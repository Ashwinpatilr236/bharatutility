import { ChannelItem } from './types';
import { parseM3u } from './m3uParser';

export interface XtreamUserInfo {
  username: string;
  status: string;
  exp_date?: string;
  is_trial?: string;
  active_cons?: string;
  max_connections?: string;
  created_at?: string;
  allowed_output_formats?: string[];
}

export interface XtreamServerInfo {
  url?: string;
  port?: string;
  server_protocol?: string;
  timezone?: string;
}

export interface XtreamAuthResult {
  success: boolean;
  channels: ChannelItem[];
  userInfo?: XtreamUserInfo;
  serverInfo?: XtreamServerInfo;
  m3uUrl: string;
  error?: string;
}

export const normalizeServerUrl = (url: string): string => {
  let cleaned = url.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'http://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
};

export const getXtreamM3uUrl = (serverUrl: string, username: string, password: string): string => {
  const base = normalizeServerUrl(serverUrl);
  const u = encodeURIComponent(username.trim());
  const p = encodeURIComponent(password.trim());
  return `${base}/get.php?username=${u}&password=${p}&type=m3u_plus&output=m3u8`;
};

export const fetchXtreamChannels = async (
  serverUrl: string,
  username: string,
  password: string
): Promise<XtreamAuthResult> => {
  const base = normalizeServerUrl(serverUrl);
  const u = encodeURIComponent(username.trim());
  const p = encodeURIComponent(password.trim());
  const m3uUrl = `${base}/get.php?username=${u}&password=${p}&type=m3u_plus&output=m3u8`;

  // Method 1: Try Xtream Codes REST API
  try {
    const authEndpoint = `${base}/player_api.php?username=${u}&password=${p}`;
    const authRes = await fetch(authEndpoint, { method: 'GET' });

    if (authRes.ok) {
      const authData = await authRes.json();
      if (authData?.user_info?.auth === 1) {
        // Authenticated! Now fetch live streams and categories
        let categoryMap: Record<string, string> = {};
        try {
          const catRes = await fetch(`${authEndpoint}&action=get_live_categories`);
          if (catRes.ok) {
            const categories = await catRes.json();
            if (Array.isArray(categories)) {
              categories.forEach((cat: { category_id: string; category_name: string }) => {
                categoryMap[cat.category_id] = cat.category_name;
              });
            }
          }
        } catch {
          // Categories non-fatal
        }

        // Fetch live streams
        const streamsRes = await fetch(`${authEndpoint}&action=get_live_streams`);
        if (streamsRes.ok) {
          const streamsData = await streamsRes.json();
          if (Array.isArray(streamsData) && streamsData.length > 0) {
            const mappedChannels: ChannelItem[] = streamsData.map((item, idx) => ({
              id: item.num || item.stream_id || idx + 1,
              name: item.name || `Live Channel ${idx + 1}`,
              url: `${base}/live/${username.trim()}/${password.trim()}/${item.stream_id}.m3u8`,
              logo: item.stream_icon || undefined,
              group: categoryMap[item.category_id] || 'Xtream Live',
              tvgId: item.epg_channel_id || String(item.stream_id),
              tvgName: item.name,
              tvgChno: String(item.num || idx + 1),
            }));

            return {
              success: true,
              channels: mappedChannels,
              userInfo: authData.user_info,
              serverInfo: authData.server_info,
              m3uUrl,
            };
          }
        }
      } else if (authData?.user_info?.status === 'Disabled' || authData?.user_info?.status === 'Expired') {
        throw new Error(`Xtream Account is ${authData.user_info.status}. Please check your subscription.`);
      }
    }
  } catch (apiErr: unknown) {
    console.warn('Xtream REST API failed, attempting direct M3U stream fallback:', apiErr);
  }

  // Method 2: Fallback to direct M3U endpoint
  try {
    const m3uRes = await fetch(m3uUrl);
    if (m3uRes.ok) {
      const text = await m3uRes.text();
      const parsedChannels = parseM3u(text);
      if (parsedChannels.length > 0) {
        return {
          success: true,
          channels: parsedChannels,
          m3uUrl,
        };
      }
    }
  } catch {
    // Both failed (usually browser CORS policy on IPTV servers)
  }

  // If browser CORS blocked both direct requests, return helpful guidance with the generated M3U URL
  return {
    success: false,
    channels: [],
    m3uUrl,
    error:
      'Browser CORS Block: Your IPTV provider server does not permit direct in-browser REST calls. You can download the generated M3U file via the link below and drop it into the "Local M3U File" tab for instant playback.',
  };
};
