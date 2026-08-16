import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { ContactReason } from '../types';

export interface ContactFormData {
  name: string;
  email: string;
  reason?: ContactReason | string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  id?: string;
}

/**
 * Submits a contact inquiry directly to Supabase public.contact_messages
 */
export async function submitContactMessage(data: ContactFormData): Promise<ContactResponse> {
  // 1. Validation
  const email = (data.email || '').trim();
  if (!email) {
    throw new Error('Please enter your email address.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  const message = (data.message || '').trim();
  if (!message) {
    throw new Error('Please enter your message.');
  }
  if (message.length < 5) {
    throw new Error('Please provide a little more detail in your message.');
  }

  const name = (data.name || '').trim();
  const subject = (data.subject || '').trim() || (data.reason ? `[${data.reason}]` : 'General Inquiry');

  // 2. Check Supabase Configuration
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Contact service is currently unavailable. Please try again later.');
  }

  // 3. Insert into Supabase public.contact_messages (Insert-only without .select() to respect anon RLS)
  const payload = {
    name: name || null,
    email: email,
    subject: subject || null,
    message: message,
    status: 'new',
  };

  const { error } = await supabase
    .from('contact_messages')
    .insert([payload]);

  if (error) {
    console.error('Supabase contact message insert error:', error);
    throw new Error(error.message || 'Something went wrong while sending your message. Please try again.');
  }

  return {
    success: true,
    message: 'Thanks! Your message has been sent successfully.',
    id: '',
  };
}
