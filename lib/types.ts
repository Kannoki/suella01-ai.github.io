// ── Enums (plain const — client and server safe) ──────────────────────────────

export const Role = {
  ADMIN: 'admin',
  AUTHOR: 'author',
  USER: 'user',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ActivityType = {
  WORKSHOP: 'Workshop',
  CHALLENGE: 'Challenge',
  MASTERCLASS: 'Masterclass',
  PANEL: 'Panel',
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const ActivityStatus = {
  OPEN: 'open',
  FULL: 'full',
  CLOSED: 'closed',
} as const;
export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

export const ProductCategory = {
  ROBOTICS: 'Robotics',
  KNOWLEDGE: 'Knowledge',
  IOT: 'IoT',
  MECHATRONICS: 'Mechatronics',
} as const;
export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const KnowledgeCategory = {
  ROBOTICS: 'Robotics',
  MECHANICS: 'Mechanics',
  ENGINEERING: 'Engineering',
  AI_And_Vision: 'AI & Vision',
  IoT_And_Hardware: 'IoT & Hardware',
  PROGRAMMING: 'Programming',
  GENERAL: 'General',
} as const;
export type KnowledgeCategory = (typeof KnowledgeCategory)[keyof typeof KnowledgeCategory];

export const KnowledgeStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;
export type KnowledgeStatus = (typeof KnowledgeStatus)[keyof typeof KnowledgeStatus];

// ── Normalize helpers ────────────────────────────────────────────────────────

export function normalizeRole(r: any): Role {
  if (!r) return Role.USER;
  const s = String(r).toUpperCase();
  if (s === 'ADMIN') return Role.ADMIN;
  if (s === 'AUTHOR') return Role.AUTHOR;
  return Role.USER;
}

export function normalizeActivityType(t: any): ActivityType {
  if (!t) return ActivityType.WORKSHOP;
  const s = String(t).toUpperCase();
  if (s === 'CHALLENGE') return ActivityType.CHALLENGE;
  if (s === 'MASTERCLASS') return ActivityType.MASTERCLASS;
  if (s === 'PANEL') return ActivityType.PANEL;
  return ActivityType.WORKSHOP;
}

export function normalizeActivityStatus(s: any): ActivityStatus {
  if (!s) return ActivityStatus.OPEN;
  const val = String(s).toUpperCase();
  if (val === 'FULL') return ActivityStatus.FULL;
  if (val === 'CLOSED') return ActivityStatus.CLOSED;
  return ActivityStatus.OPEN;
}

export function normalizeProductCategory(c: any): ProductCategory {
  if (!c) return ProductCategory.ROBOTICS;
  const s = String(c).toUpperCase();
  if (s === 'KNOWLEDGE') return ProductCategory.KNOWLEDGE;
  if (s === 'IOT') return ProductCategory.IOT;
  if (s === 'MECHATRONICS') return ProductCategory.MECHATRONICS;
  return ProductCategory.ROBOTICS;
}

export function normalizeKnowledgeStatus(s: any): KnowledgeStatus {
  if (!s) return KnowledgeStatus.PENDING;
  const val = String(s).toUpperCase();
  if (val === 'CONFIRMED') return KnowledgeStatus.CONFIRMED;
  if (val === 'REJECTED') return KnowledgeStatus.REJECTED;
  return KnowledgeStatus.PENDING;
}

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  title: string;
  slug: string;
  type: ActivityType;
  date: string;
  time?: string | null;
  location?: string | null;
  description: string;
  content?: string | null;
  image?: string | null;
  seats: number;
  registered: number;
  status: ActivityStatus;
  featured?: boolean;
  tags: string[];
}

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  activityId: string;
  activityTitle?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  description: string;
  content?: string | null;
  image?: string | null;
  github?: string | null;
  demo?: string | null;
  tags: string[];
  featured: boolean;
}

export interface CarouselSlide {
  id: string;
  src: string;
  alt?: string | null;
  title?: string | null;
  subtitle?: string | null;
  order: number;
}

export interface TimelineItem {
  id: string;
  startYear: number;
  endYear?: number | null;
  title: string;
  institution: string;
  description: string;
  order?: number;
}

export interface AboutProfile {
  id?: string;
  name: string;
  tagline: string;
  bio: string;
  image?: string | null;
  photoUrl?: string | null;
  timeline: TimelineItem[];
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tagline?: string | null;
  bio?: string | null;
  role?: Role;
  passwordHash?: string | null;
  timeline?: TimelineItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ContactInfo {
  id?: string;
  name: string;
  tagline: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  about?: string | null;
  socials?: {
    facebook?: string;
    youtube?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt: string;
}

export interface Knowledge {
  id: string;
  title: string;
  slug: string;
  category: KnowledgeCategory;
  summary?: string | null;
  content: string;
  image?: string | null;
  status: KnowledgeStatus;
  confirmed: boolean;
  authorId?: string | null;
  authorName?: string | null;
  authorEmail?: string | null;
  authorImage?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
