import { ChannelItem } from './types';

/**
 * Resilient client-side M3U / M3U8 Playlist Parser
 * Parses #EXTINF metadata safely without throwing errors on malformed lines.
 */
export function parseM3u(content: string, maxItems: number = 5000): ChannelItem[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const channels: ChannelItem[] = [];
  let currentItem: Partial<ChannelItem> | null = null;
  let channelCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      channelCounter++;
      // Extract tvg-chno if present
      const chnoMatch = line.match(/tvg-chno="([^"]*)"/i);
      const channelId = chnoMatch && chnoMatch[1] ? chnoMatch[1].trim() : channelCounter;

      currentItem = {
        id: channelId,
        name: `Channel ${channelCounter}`,
        group: 'All',
        url: '',
      };

      // Extract tvg-id
      const idMatch = line.match(/tvg-id="([^"]*)"/i) || line.match(/tvg-id=([^\s]+)/i);
      if (idMatch && idMatch[1]) {
        currentItem.tvgId = idMatch[1].trim();
      }

      // Extract tvg-name
      const nameMatch = line.match(/tvg-name="([^"]*)"/i);
      if (nameMatch && nameMatch[1]) {
        currentItem.tvgName = nameMatch[1].trim();
      }

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      if (logoMatch && logoMatch[1]) {
        const logoUrl = logoMatch[1].trim();
        // Ignore known broken or slow external placeholders
        if (!logoUrl.includes('via.placeholder.com')) {
          currentItem.logo = logoUrl;
        }
      }

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      if (groupMatch && groupMatch[1]) {
        currentItem.group = groupMatch[1].trim() || 'General';
      }

      // Extract channel name (after the last comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        const parsedName = line.substring(commaIndex + 1).trim();
        if (parsedName) {
          currentItem.name = parsedName;
        }
      } else if (currentItem.tvgName) {
        currentItem.name = currentItem.tvgName;
      }
    } else if (line.startsWith('#EXTGRP:')) {
      if (currentItem && !currentItem.group) {
        currentItem.group = line.replace('#EXTGRP:', '').trim() || 'General';
      }
    } else if (line.startsWith('#')) {
      // Ignore other directives (#EXTM3U, #EXTVLCOPT, #KODIPROP, comments)
      continue;
    } else {
      // This is a candidate URL line
      const urlCandidate = line;
      if (currentItem) {
        currentItem.url = urlCandidate;
        channels.push({
          id: currentItem.id !== undefined ? currentItem.id : (channels.length + 1),
          name: currentItem.name || `Channel ${channels.length + 1}`,
          url: currentItem.url,
          logo: currentItem.logo,
          group: currentItem.group || 'All',
          tvgId: currentItem.tvgId,
          tvgName: currentItem.tvgName,
        });
        currentItem = null;
      } else if (urlCandidate.startsWith('http://') || urlCandidate.startsWith('https://') || urlCandidate.endsWith('.m3u8')) {
        // Plain URL without #EXTINF
        channels.push({
          id: channels.length + 1,
          name: `Stream ${channels.length + 1}`,
          url: urlCandidate,
          group: 'Direct Streams',
        });
      }

      if (channels.length >= maxItems) {
        break;
      }
    }
  }

  return channels;
}
