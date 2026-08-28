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
  id: string;
}

/**
 * Submits a contact inquiry directly to Supabase public.contact_messages and public.inquiries
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
  const rawSubject = (data.subject || '').trim() || (data.reason ? `[${data.reason}]` : 'General Inquiry');

  // Generate 5-digit Ticket Number e.g. BU-74920
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const ticketNumber = `BU-${randomDigits}`;
  const subjectWithTicket = `[#${ticketNumber}] ${rawSubject}`;

  // Instant Telegram Admin Phone Alert
  const telegramMessage = `🇮🇳 <b>NEW BHARATUTILITY MESSAGE RECEIVED!</b>\n\n` +
    `🎫 <b>Ticket Reference:</b> <code>#${ticketNumber}</code>\n` +
    `👤 <b>Name:</b> ${name || 'Visitor'}\n` +
    `✉️ <b>Email:</b> ${email}\n` +
    `📌 <b>Subject:</b> ${rawSubject}\n\n` +
    `💬 <b>Message:</b>\n${message}\n\n` +
    `⚡ <i>Logged in Central Admin Workspace</i>`;

  try {
    fetch(`https://api.telegram.org/bot8276384400:AAF8BsimAlsOrsbx0w0PYJ9ymUBi9JVvOLI/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '5892799474',
        text: telegramMessage,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  } catch {}

  // 2. Check Supabase Configuration
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Contact service is currently unavailable. Please try again later.');
  }

  // Save to local cache as fallback
  const localRecord = {
    id: ticketNumber,
    product_slug: 'bharatutility',
    name: name || 'Visitor',
    email: email,
    subject: subjectWithTicket,
    message: message,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const existing = localStorage.getItem('bu_inquiries_cache');
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(localRecord);
    localStorage.setItem('bu_inquiries_cache', JSON.stringify(list.slice(0, 50)));
  } catch {}

  // 3. Insert into Supabase public.contact_messages
  const payloadContact = {
    name: name || null,
    email: email,
    subject: subjectWithTicket,
    message: message,
    status: 'new',
  };

  const { error: contactErr } = await supabase
    .from('contact_messages')
    .insert([payloadContact]);

  if (contactErr) {
    console.warn('Supabase contact_messages insert warning:', contactErr);
  }

  // 4. Insert into Supabase central public.inquiries (for Central Admin Sync)
  const payloadInquiry = {
    product_slug: 'bharatutility',
    name: name || 'Visitor',
    email: email,
    phone: null,
    subject: subjectWithTicket,
    message: message,
    form_type: 'contact',
    source_page: typeof window !== 'undefined' ? window.location.pathname : '/contact',
    status: 'new',
    priority: 'normal',
  };

  const { error: inqErr } = await supabase
    .from('inquiries')
    .insert([payloadInquiry]);

  if (inqErr) {
    console.warn('Supabase inquiries insert warning:', inqErr);
  }

  return {
    success: true,
    message: 'Thanks! Your message has been sent successfully.',
    id: ticketNumber,
  };
}
