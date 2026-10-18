export const LIMITS: { name: number; message: number };
export type ContactErrors = Partial<Record<'name' | 'email' | 'message', string>>;
export function validateContact(input?: Record<string, unknown>): {
  valid: boolean; errors: ContactErrors; values: { name: string; email: string; message: string };
};
