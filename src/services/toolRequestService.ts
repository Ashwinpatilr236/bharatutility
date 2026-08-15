import { ToolRequest, ToolRequestStatus } from '../types';

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

const STORAGE_KEY = 'bu_tool_requests';

/**
 * Provider-ready Tool Request Service
 *
 * Easily connects to Supabase, Firebase, PostgreSQL, Airtable, or custom REST APIs.
 */
export async function submitToolRequest(data: ToolRequestFormData): Promise<ToolRequestResponse> {
  // 1. Validation
  if (!data.toolName.trim()) {
    throw new Error('Tool name is required.');
  }
  if (!data.category.trim()) {
    throw new Error('Category selection is required.');
  }
  if (!data.description.trim()) {
    throw new Error('Please describe what this tool should do.');
  }

  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error('Please enter a valid email address if provided.');
    }
  }

  // 2. Simulated network latency for realism & seamless provider swap
  await new Promise(resolve => setTimeout(resolve, 800));

  const newRequest: ToolRequest = {
    id: 'req_' + Math.random().toString(36).substring(2, 9),
    name: data.name?.trim() || undefined,
    email: data.email?.trim() || undefined,
    toolName: data.toolName.trim(),
    category: data.category.trim(),
    description: data.description.trim(),
    usefulness: data.usefulness?.trim() || undefined,
    referenceUrl: data.referenceUrl?.trim() || undefined,
    createdAt: new Date().toISOString(),
    status: 'New' as ToolRequestStatus,
  };

  // 3. Store in local state/storage for offline/client availability
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const list: ToolRequest[] = existing ? JSON.parse(existing) : [];
    list.unshift(newRequest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('Could not cache tool request locally:', err);
  }

  return {
    success: true,
    message: 'Thanks for helping us improve BharatUtility. Your suggestion has been received.',
    id: newRequest.id,
  };
}

export function getLocalToolRequests(): ToolRequest[] {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}
