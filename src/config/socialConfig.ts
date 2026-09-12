export interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  handle: string;
  icon: string;
  color: string;
  enabled: boolean;
  followerCount?: string;
}

export interface SocialConfig {
  title: string;
  subtitle: string;
  platforms: SocialPlatform[];
}

export const SOCIAL_CONFIG: SocialConfig = {
  title: 'Follow BharatUtility',
  subtitle: 'Stay updated with new tools, useful utilities and BharatUtility updates.',
  platforms: [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/arrjstechnologies',
      handle: 'arrjstechnologies',
      icon: 'Linkedin',
      color: '#0A66C2',
      enabled: true,
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      url: 'https://x.com/ARRJS_Tech',
      handle: '@ARRJS_Tech',
      icon: 'Twitter',
      color: '#000000',
      enabled: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/arrjstechnologies/',
      handle: '@arrjstechnologies',
      icon: 'Instagram',
      color: '#E4405F',
      enabled: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/arrjstechnologies',
      handle: 'arrjstechnologies',
      icon: 'Facebook',
      color: '#1877F2',
      enabled: true,
    }
  ]
};

export function getActiveSocialPlatforms(): SocialPlatform[] {
  return SOCIAL_CONFIG.platforms.filter(p => p.enabled && p.url && p.url.trim() !== '');
}
