export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  genre: string;
  artwork: string;
}

export interface PostizAccount {
  id: string;
  name: string;
  handle: string;
  type: 'tiktok' | 'instagram' | 'youtube' | 'medium' | string;
  avatar: string;
  connected: boolean;
  theme?: string;
  aesthetic?: string;
  goal?: string;
  strategy?: string;
  style?: string;
  personality?: string;
  agentLogs?: string[];
  categories?: string[];
}

export interface PostizConfig {
  endpoint: string;
  apiKey: string;
  useRealPostiz: boolean;
}

export interface ImportedAsset {
  id: string;
  sourceUrl: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  downloaded: boolean;
  size: string;
}

export interface ScheduledPost {
  id: string;
  title: string;
  type: 'social' | 'blog';
  mediaType: 'video' | 'image' | 'text';
  platform: string;
  fileUrl?: string;
  subtitles?: string;
  scheduledAt: string;
  status: 'scheduled' | 'published';
  songId?: string;
  cropStart?: number;
  cropEnd?: number;
  blogContent?: string;
  seoMeta?: {
    title: string;
    description: string;
  } | null;
  accountId?: string;
  platforms: string[]; // List of account ids scheduled to
}

export interface BulkVariant {
  id: string;
  heading: string;
  subtitles: string;
  hashtags: string[];
  aestheticRecommendation: string;
}
