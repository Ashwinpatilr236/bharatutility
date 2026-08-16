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
 * Submits a new citizen tool request directly to Supabase public.tool_requests
 */
export async function submitToolRequest(data: ToolRequestFormData): Promise<ToolRequestResponse> {
  // 1. Validation
  const requestedTool = (data.toolName || '').trim();
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

  // 2. Check Supabase Configuration
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Database service is currently unavailable. Please try again later.');
  }

  // 3. Insert into Supabase public.tool_requests
  const { data: record, error } = await supabase
    .from('tool_requests')
    .insert([
      {
        requested_tool: requestedTool,
        description: fullDescription || null,
        category: category || null,
        name: name || null,
        email: email || null,
        status: 'new',
      },
    ])
    .select('id, requested_tool, status, created_at')
    .single();

  if (error || !record) {
    console.error('Supabase tool request insert error:', error);
    throw new Error(error?.message || 'Something went wrong while submitting your request. Please try again.');
  }

  return {
    success: true,
    message: 'Thanks! Your tool request has been submitted.',
    id: record.id,
  };
}
