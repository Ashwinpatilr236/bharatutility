import { ChannelItem } from './types';

export interface StalkerAuthResult {
  success: boolean;
  channels: ChannelItem[];
  portalUrl: string;
  mac: string;
  error?: string;
  token?: string;
}

export const formatMacAddress = (input: string): string => {
  const clean = input.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length && i < 12; i += 2) {
    chunks.push(clean.slice(i, i + 2));
  }
  return chunks.join(':');
};

export const isValidMacAddress = (mac: string): boolean => {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
};

export const generateRandomMagMac = (): string => {
  // Infomir MAG Vendor OUI is typically 00:1A:79
  const randomHexByte = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
  return `00:1A:79:${randomHexByte()}:${randomHexByte()}:${randomHexByte()}`;
};

export const normalizePortalUrl = (url: string): string => {
  let cleaned = url.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'http://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
};

export const fetchStalkerChannels = async (
  portalUrl: string,
  mac: string
): Promise<StalkerAuthResult> => {
  const base = normalizePortalUrl(portalUrl);
  const formattedMac = formatMacAddress(mac);

  if (!isValidMacAddress(formattedMac)) {
    return {
      success: false,
      channels: [],
      portalUrl: base,
      mac: formattedMac,
      error: 'Invalid MAC address. Must be in the format 00:1A:79:XX:XX:XX.',
    };
  }

  try {
    // Step 1: Handshake with Stalker Middleware
    const handshakeUrl = `${base}/server/load.php?type=stb&action=handshake&token=&JsHttpRequest=1-xml`;
    const handshakeRes = await fetch(handshakeUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    if (handshakeRes.ok) {
      const data = await handshakeRes.json();
      const token = data?.js?.token;

      if (token) {
        // Step 2: Fetch genres
        let genreMap: Record<string, string> = {};
        try {
          const genresRes = await fetch(
            `${base}/server/load.php?type=itv&action=get_genres&JsHttpRequest=1-xml`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (genresRes.ok) {
            const genresData = await genresRes.json();
            if (Array.isArray(genresData?.js)) {
              genresData.js.forEach((g: { id: string; title: string }) => {
                genreMap[g.id] = g.title;
              });
            }
          }
        } catch {
          // Genre map non-fatal
        }

        // Step 3: Fetch all channels
        const channelsRes = await fetch(
          `${base}/server/load.php?type=itv&action=get_all_channels&JsHttpRequest=1-xml`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          const channelList = channelsData?.js?.data;

          if (Array.isArray(channelList) && channelList.length > 0) {
            const mapped: ChannelItem[] = channelList.map((ch, idx) => {
              // Extract stream URL from cmd: "ffmpeg http://..." or direct URL
              let streamUrl = ch.cmd || '';
              if (streamUrl.startsWith('ffmpeg ')) {
                streamUrl = streamUrl.replace('ffmpeg ', '').trim();
              }
              return {
                id: ch.number || ch.id || idx + 1,
                name: ch.name || `Channel ${idx + 1}`,
                url: streamUrl,
                logo: ch.logo ? (ch.logo.startsWith('http') ? ch.logo : `${base}/${ch.logo}`) : undefined,
                group: genreMap[ch.tv_genre_id] || 'Stalker Live',
                tvgId: String(ch.id || idx + 1),
                tvgName: ch.name,
                tvgChno: String(ch.number || idx + 1),
              };
            });

            return {
              success: true,
              channels: mapped,
              portalUrl: base,
              mac: formattedMac,
              token,
            };
          }
        }
      }
    }
  } catch (err: unknown) {
    console.warn('Stalker handshake failed:', err);
  }

  return {
    success: false,
    channels: [],
    portalUrl: base,
    mac: formattedMac,
    error:
      'Stalker Middleware Connection Failed: In-browser calls to Stalker / MAG middleware are restricted by browser CORS security. Please ensure the portal endpoint allows Web client access, or configure an M3U export link from your IPTV provider.',
  };
};
