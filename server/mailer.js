/** Optional email notification. Enabled only when SMTP_HOST is set. */
export async function createMailer(env = process.env) {
  if (!env.SMTP_HOST) return null;
  const { default: nodemailer } = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587), secure: env.SMTP_SECURE === 'true',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return {
    send: (m) => transport.sendMail({
      from: env.MAIL_FROM || env.SMTP_USER, to: env.MAIL_TO || env.SMTP_USER, replyTo: m.email,
      subject: `Portfolio message from ${m.name}`, text: `${m.message}\n\n— ${m.name} <${m.email}>`,
    }),
  };
}
