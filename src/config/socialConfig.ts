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
  subtitle: 'Get notified about new Indian utility calculators, tax updates, and productivity tips.',
  platforms: [
    {
      id: 'x',
      name: 'X (Twitter)',
      url: 'https://twitter.com/BharatUtility',
      handle: '@BharatUtility',
      icon: 'Twitter',
      color: '#000000',
      enabled: true,
      followerCount: '12K+'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/@BharatUtility',
      handle: 'BharatUtility India',
      icon: 'Youtube',
      color: '#FF0000',
      enabled: true,
      followerCount: '25K+'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      url: 'https://t.me/BharatUtility',
      handle: 't.me/BharatUtility',
      icon: 'Send',
      color: '#229ED9',
      enabled: true,
      followerCount: '18K+'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/bharatutility',
      handle: 'BharatUtility India',
      icon: 'Linkedin',
      color: '#0A66C2',
      enabled: true,
      followerCount: '8K+'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/bharatutility.in',
      handle: '@bharatutility.in',
      icon: 'Instagram',
      color: '#E4405F',
      enabled: true,
      followerCount: '30K+'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://facebook.com/BharatUtility',
      handle: 'BharatUtility',
      icon: 'Facebook',
      color: '#1877F2',
      enabled: false, // Disabled platforms are automatically hidden
    }
  ]
};

export function getActiveSocialPlatforms(): SocialPlatform[] {
  return SOCIAL_CONFIG.platforms.filter(p => p.enabled && p.url && p.url.trim() !== '');
}
