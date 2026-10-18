export const LIMITS = { name: 80, message: 2000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates the contact form. Used by both the browser and the API. */
export function validateContact(input = {}) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const message = String(input.message ?? '').trim();
  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  else if (name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;
  if (!EMAIL.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.length < 10) errors.message = 'Message should be at least 10 characters.';
  else if (message.length > LIMITS.message) errors.message = `Message must be ${LIMITS.message} characters or fewer.`;
  return { valid: Object.keys(errors).length === 0, errors, values: { name, email, message } };
}
