import { getSupabase, isSupabaseConfigured } from './supabaseClient';

export interface ToolRequestFormData {
  name?: string;
  email?: string;
  toolName: string;
  category: string;
  description: string;
  usefulness?: string;
  referenceUrl?: string;
}

export interface ToolRequestResponse {
  success: boolean;
  message: string;
  id: string;
}

/**
 * Submits a new citizen tool request directly to Supabase public.tool_requests and public.inquiries
 */
export async function submitToolRequest(data: ToolRequestFormData): Promise<ToolRequestResponse> {
  // 1. Validation
  const requestedTool = (
    data.toolName ||
    (data as any).requested_tool ||
    (data as any).requestedTool ||
    (data as any).title ||
    ''
  ).trim();
  if (!requestedTool) {
    throw new Error('Please provide the name of the tool you are requesting.');
  }

  const category = (data.category || '').trim();
  if (!category) {
    throw new Error('Please select a category.');
  }

  const rawDescription = (data.description || '').trim();
  if (!rawDescription) {
    throw new Error('Please describe what this tool should calculate or do.');
  }
  if (rawDescription.length < 10) {
    throw new Error('Please provide a little more detail in the description (at least 10 characters).');
  }

  const email = (data.email || '').trim();
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
  }

  const name = (data.name || '').trim();

  // Combine optional usefulness and referenceUrl into description if present
  let fullDescription = rawDescription;
  if (data.usefulness && data.usefulness.trim()) {
    fullDescription += `\n\n[Usefulness / Why it helps]: ${data.usefulness.trim()}`;
  }
  if (data.referenceUrl && data.referenceUrl.trim()) {
    fullDescription += `\n\n[Reference URL]: ${data.referenceUrl.trim()}`;
  }

  // Generate 5-digit Ticket Number e.g. BU-84920
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const ticketNumber = `BU-${randomDigits}`;
  const subjectWithTicket = `[#${ticketNumber}] Tool Request: ${requestedTool} (${category})`;

  // 2. Check Supabase Configuration
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Database service is currently unavailable. Please try again later.');
  }

  // Save to local cache as fallback
  const localRecord = {
    id: ticketNumber,
    product_slug: 'bharatutility',
    name: name || 'Citizen Visitor',
    email: email || 'anonymous@bharatutility.com',
    subject: subjectWithTicket,
    message: fullDescription,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const existing = localStorage.getItem('bu_inquiries_cache');
    const list = existing ? JSON.parse(existing) : [];
    list.unshift(localRecord);
    localStorage.setItem('bu_inquiries_cache', JSON.stringify(list.slice(0, 50)));
  } catch {}

  // 3. Insert into Supabase public.tool_requests
  const payloadTool = {
    requested_tool: requestedTool,
    description: fullDescription || null,
    category: category || null,
    name: name || null,
    email: email || null,
    status: 'new',
  };

  const { error: toolErr } = await supabase
    .from('tool_requests')
    .insert([payloadTool]);

  if (toolErr) {
    console.warn('Supabase tool_requests insert warning:', toolErr);
  }

  // 4. Insert into Supabase central public.inquiries (for Central Admin Sync)
  const payloadInquiry = {
    product_slug: 'bharatutility',
    name: name || 'Citizen Visitor',
    email: email || 'anonymous@bharatutility.com',
    phone: null,
    subject: subjectWithTicket,
    message: fullDescription,
    form_type: 'tool_request',
    source_page: typeof window !== 'undefined' ? window.location.pathname : '/request-tool',
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
    message: 'Thanks! Your tool request has been submitted.',
    id: ticketNumber,
  };
}
