import { FormEvent, useState } from 'react';
import { LIMITS, validateContact, ContactErrors } from '../shared/validate.js';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as keyof ContactErrors]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validateContact(values);
    setErrors(result.errors);
    if (!result.valid) { setStatus('idle'); return; }
    setStatus('sending'); setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result.values, website: values.website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setStatus('success'); setValues({ name: '', email: '', message: '', website: '' }); return; }
      if (data.errors) setErrors(data.errors);
      setServerError(data.error || 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success')
    return (
      <div className="form-ok" role="status" data-testid="form-success">
        <h3>Message sent ✓</h3>
        <p>Thanks for reaching out — I’ll get back to you soon.</p>
        <button className="btn" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    );

  const field = (k: 'name' | 'email' | 'message', label: string, el: 'input' | 'textarea', extra = {}) => {
    const Tag = el as 'input';
    return (
      <label className="fld">
        <span>{label}</span>
        <Tag id={k} name={k} value={values[k]} onChange={set(k) as never} aria-invalid={!!errors[k]}
          aria-describedby={errors[k] ? `${k}-err` : undefined} {...extra} />
        {errors[k] && <em id={`${k}-err`} className="err" role="alert">{errors[k]}</em>}
      </label>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="form" aria-label="Contact form">
      {field('name', 'Name', 'input', { type: 'text', autoComplete: 'name' })}
      {field('email', 'Email', 'input', { type: 'email', autoComplete: 'email' })}
      {field('message', 'Message', 'textarea', { rows: 5 })}
      <div className="count">{values.message.length}/{LIMITS.message}</div>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"
        value={values.website} onChange={set('website')} />
      {status === 'error' && <p className="err box" role="alert" data-testid="form-error">{serverError}</p>}
      <button className="btn p" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
