export interface ChannelItem {
  id: string | number;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
  tvgChno?: string;
}

export type AspectRatio = 'contain' | 'cover' | 'fill';

export type InputMode = 'direct' | 'playlist-url' | 'playlist-file';

export interface SampleStream {
  name: string;
  type: 'direct' | 'hls' | 'playlist';
  url: string;
  description: string;
  format: string;
}

export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface StalkerCredentials {
  portalUrl: string;
  macAddress: string;
}

export type IptvSourceType = 'remote' | 'local' | 'xtream' | 'stalker' | 'mock' | 'direct';

