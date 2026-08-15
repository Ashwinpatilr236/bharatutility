import { ContactReason, ContactSubmission } from '../types';

export interface ContactFormData {
  name: string;
  email: string;
  reason: ContactReason;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  id?: string;
}

const STORAGE_KEY = 'bu_contact_submissions';

/**
 * Provider-ready Contact Submission Service
 *
 * Easily connects to Formspree, Resend, Email API, Supabase, or custom server endpoints.
 */
export async function submitContactMessage(data: ContactFormData): Promise<ContactResponse> {
  // 1. Client-side sanity check
  if (!data.name.trim() || !data.email.trim() || !data.subject.trim() || !data.message.trim() || !data.reason) {
    throw new Error('Please fill in all required fields.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    throw new Error('Please provide a valid email address.');
  }

  // 2. Simulated network latency for realism & seamless provider swap
  await new Promise(resolve => setTimeout(resolve, 800));

  const submission: ContactSubmission = {
    id: 'msg_' + Math.random().toString(36).substring(2, 9),
    name: data.name.trim(),
    email: data.email.trim(),
    reason: data.reason,
    subject: data.subject.trim(),
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
  };

  // 3. Store locally as a reliable audit trail
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const list: ContactSubmission[] = existing ? JSON.parse(existing) : [];
    list.unshift(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('Could not cache contact message locally:', err);
  }

  return {
    success: true,
    message: "Your message has been received. We'll get back to you when appropriate.",
    id: submission.id,
  };
}
