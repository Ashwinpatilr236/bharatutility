export interface EpgProgram {
  start: Date;
  stop: Date;
  title: string;
  desc: string;
  poster?: string | null;
}

export type EpgDataMap = Record<string, EpgProgram[]>;

/**
 * Safely parses XMLTV EPG string into an indexed map of channelId -> programs.
 * Returns empty object on invalid XML or failures.
 */
export function parseXMLTV(xmlString: string): EpgDataMap {
  if (!xmlString || typeof xmlString !== 'string') {
    return {};
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse error
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      return {};
    }

    const programmes = xmlDoc.getElementsByTagName('programme');
    const epgData: EpgDataMap = {};

    for (let i = 0; i < programmes.length; i++) {
      const prog = programmes[i];
      const channelId = prog.getAttribute('channel');
      const startRaw = prog.getAttribute('start');
      const stopRaw = prog.getAttribute('stop');

      if (!channelId || !startRaw || !stopRaw) continue;

      const titleNode = prog.getElementsByTagName('title')[0];
      const descNode = prog.getElementsByTagName('desc')[0];
      const iconNode = prog.getElementsByTagName('icon')[0];

      const title = titleNode ? titleNode.textContent || 'Program' : 'Program';
      const desc = descNode ? descNode.textContent || '' : '';
      const poster = iconNode ? iconNode.getAttribute('src') : null;

      if (!epgData[channelId]) {
        epgData[channelId] = [];
      }

      epgData[channelId].push({
        start: parseXmltvDate(startRaw),
        stop: parseXmltvDate(stopRaw),
        title,
        desc,
        poster,
      });
    }

    // Sort programs chronologically
    for (const channelId in epgData) {
      epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    return epgData;
  } catch (err) {
    console.warn('Failed to parse XMLTV EPG data:', err);
    return {};
  }
}

function parseXmltvDate(dateStr: string): Date {
  if (!dateStr || dateStr.length < 14) return new Date();

  try {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(8, 10), 10);
    const minute = parseInt(dateStr.substring(10, 12), 10);
    const second = parseInt(dateStr.substring(12, 14), 10);

    return new Date(year, month, day, hour, minute, second);
  } catch {
    return new Date();
  }
}
