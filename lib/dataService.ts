import prisma from './prisma';
import { Role, ActivityType, ActivityStatus, ProductCategory, KnowledgeCategory, KnowledgeStatus } from '../prisma/generated/enums';
export { Role, ActivityType, ActivityStatus, ProductCategory, KnowledgeCategory, KnowledgeStatus };
import fs from 'fs';
import path from 'path';

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
  image?: string | null; // Base64 encoded or URL
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

// Fallback JSON data loader
function loadJsonSeed<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seeds', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (e) {
    console.warn(`Could not load seed ${filename}:`, e);
  }
  return fallback;
}

function saveJsonSeed<T>(filename: string, data: T): void {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seeds', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    const publicPath = path.join(process.cwd(), 'public', 'json', filename);
    if (fs.existsSync(path.dirname(publicPath))) {
      fs.writeFileSync(publicPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (e) {
    console.warn(`Could not save seed ${filename}:`, e);
  }
}

// In-memory fallback stores for when DB is unreachable
let inMemoryActivities: Activity[] = [];
let inMemoryUsers: User[] = [];
let inMemoryProducts: Product[] = [];
let inMemoryCarousel: CarouselSlide[] = [];
let inMemoryAbout: AboutProfile | null = null;
let inMemoryContact: ContactInfo | null = null;
let inMemoryRegistrations: Registration[] = [];
let inMemoryMessages: ContactMessage[] = [];
let inMemoryKnowledge: Knowledge[] = [];

function initFallbackStores() {
  if (inMemoryUsers.length === 0) {
    const rawUsers = loadJsonSeed<any[]>('users.json', []);
    inMemoryUsers = rawUsers.map((u) => ({
      ...u,
      role: normalizeRole(u.role),
      timeline: normalizeTimeline(u.timeline),
    }));
  }
  if (inMemoryActivities.length === 0) {
    const rawActs = loadJsonSeed<any[]>('activities.json', []);
    inMemoryActivities = rawActs.map((a) => ({
      ...a,
      type: normalizeActivityType(a.type),
      status: normalizeActivityStatus(a.status),
      tags: a.tags ?? [],
    }));
  }
  if (inMemoryProducts.length === 0) {
    const rawProds = loadJsonSeed<any[]>('products.json', []);
    inMemoryProducts = rawProds.map((p) => ({
      ...p,
      category: normalizeProductCategory(p.category),
      tags: p.tags ?? [],
    }));
  }
  if (inMemoryCarousel.length === 0) {
    inMemoryCarousel = loadJsonSeed<CarouselSlide[]>('carousel.json', []);
  }
  if (!inMemoryAbout) {
    inMemoryAbout = loadJsonSeed<AboutProfile>('about.json', {
      name: 'MINH NGOC',
      tagline: 'Mechanical Engineering Student',
      bio: 'A passionate mechanical engineering student exploring mechanics, robotics, and tech.',
      timeline: [],
    });
  }
  if (!inMemoryContact) {
    const rawContact = loadJsonSeed<any>('contact.json', {
      name: 'MechGirl',
      tagline: 'Dream it, Scheme it, STEM it!',
      email: 'contact@mechgirl.com',
      phone: '+1 (555) 123-4567',
      address: '123 Engineering Way, Innovation District, CA 94043',
    });
    inMemoryContact = {
      name: rawContact.name || 'MechGirl',
      tagline: rawContact.tagline || 'Dream it, Scheme it, STEM it!',
      email: rawContact.email || 'contact@mechgirl.com',
      phone: rawContact.phone || '+1 (555) 123-4567',
      address: rawContact.address || '123 Engineering Way, Innovation District, CA 94043',
      about: rawContact.about || '',
      socials: rawContact.socials || {
        facebook: 'https://facebook.com/mechgirl',
        youtube: 'https://youtube.com/@mechgirl',
        github: 'https://github.com/mechgirl',
        instagram: 'https://instagram.com/mechgirl_official',
      },
    };
  }
  if (inMemoryRegistrations.length === 0) {
    inMemoryRegistrations = loadJsonSeed<Registration[]>('registrations.json', []);
  }
  if (inMemoryKnowledge.length === 0) {
    const rawK = loadJsonSeed<any[]>('knowledge.json', []);
    inMemoryKnowledge = rawK.map((k) => ({
      ...k,
      status: normalizeKnowledgeStatus(k.status),
      tags: k.tags ?? [],
    }));
  }
}

import { slugify, toDateInputValue, formatActivityDate } from './dateUtils';
export { slugify, toDateInputValue, formatActivityDate };

// ----------------- ACTIVITIES -----------------

export async function getActivities(): Promise<Activity[]> {
  try {
    const records = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (records && records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        type: r.type as ActivityType,
        date: r.date,
        time: r.time,
        location: r.location,
        description: r.description,
        content: r.content,
        image: r.image,
        seats: r.seats,
        registered: r.registered,
        status: r.status as ActivityStatus,
        featured: r.featured,
        tags: r.tags ?? [],
      }));
    }
  } catch (err) {
    // Database connection or schema error, fallback to JSON
  }

  initFallbackStores();
  return inMemoryActivities;
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  try {
    const record = await prisma.activity.findUnique({
      where: { slug },
      include: { registrations: true },
    });
    if (record) {
      return {
        id: record.id,
        title: record.title,
        slug: record.slug,
        type: record.type as ActivityType,
        date: record.date,
        time: record.time,
        location: record.location,
        description: record.description,
        content: record.content,
        image: record.image,
        seats: record.seats,
        registered: record.registered,
        status: record.status as ActivityStatus,
        featured: record.featured,
        tags: record.tags ?? [],
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryActivities.find((a) => a.slug === slug || a.id === slug) || null;
}

export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const title = data.title || 'Untitled Activity';
  const slug = data.slug || slugify(title);
  const seats = Number(data.seats) || 0;

  try {
    const created = await prisma.activity.create({
      data: {
        title,
        slug,
        type: data.type || ActivityType.WORKSHOP,
        date: data.date || 'TBD',
        time: data.time || null,
        location: data.location || 'Online',
        description: data.description || '',
        content: data.content || null,
        image: data.image || null,
        seats,
        registered: 0,
        status: seats > 0 ? ActivityStatus.OPEN : ActivityStatus.FULL,
        featured: Boolean(data.featured),
        tags: data.tags || [],
      },
    });
    return {
      id: created.id,
      title: created.title,
      slug: created.slug,
      type: created.type as ActivityType,
      date: created.date,
      time: created.time,
      location: created.location,
      description: created.description,
      content: created.content,
      image: created.image,
      seats: created.seats,
      registered: created.registered,
      status: created.status as ActivityStatus,
      featured: created.featured,
      tags: created.tags ?? [],
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newActivity: Activity = {
    id: `act-${Date.now()}`,
    title,
    slug,
    type: data.type || ActivityType.WORKSHOP,
    date: data.date || 'TBD',
    time: data.time || '',
    location: data.location || 'Online',
    description: data.description || '',
    content: data.content || '',
    image: data.image || '',
    seats,
    registered: 0,
    status: seats > 0 ? ActivityStatus.OPEN : ActivityStatus.FULL,
    featured: Boolean(data.featured),
    tags: data.tags || [],
  };
  inMemoryActivities.unshift(newActivity);
  saveJsonSeed('activities.json', inMemoryActivities);
  return newActivity;
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | null> {
  const dataToUpdate: any = { ...updates };
  if (updates.title && !updates.slug) {
    dataToUpdate.slug = slugify(updates.title);
  }
  if (updates.seats !== undefined) {
    dataToUpdate.seats = Number(updates.seats);
  }

  // Recompute status from seats & registered whenever either changes
  if (updates.seats !== undefined || updates.registered !== undefined || updates.status !== undefined) {
    const current = await getActivityBySlug(id);
    if (current) {
      const seats = updates.seats !== undefined ? Number(updates.seats) : current.seats;
      const registered = updates.registered !== undefined ? Number(updates.registered) : current.registered;
      if (updates.status === ActivityStatus.CLOSED) {
        dataToUpdate.status = ActivityStatus.CLOSED;
      } else if (seats > 0 && registered >= seats) {
        dataToUpdate.status = ActivityStatus.FULL;
      } else {
        dataToUpdate.status = ActivityStatus.OPEN;
      }
    }
  }

  try {
    const updated = await prisma.activity.update({
      where: { id },
      data: dataToUpdate,
    });
    return {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      type: updated.type as ActivityType,
      date: updated.date,
      time: updated.time,
      location: updated.location,
      description: updated.description,
      content: updated.content,
      image: updated.image,
      seats: updated.seats,
      registered: updated.registered,
      status: updated.status as ActivityStatus,
      featured: updated.featured,
      tags: updated.tags ?? [],
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const idx = inMemoryActivities.findIndex((a) => a.id === id || a.slug === id);
  if (idx !== -1) {
    inMemoryActivities[idx] = { ...inMemoryActivities[idx], ...dataToUpdate };
    saveJsonSeed('activities.json', inMemoryActivities);
    return inMemoryActivities[idx];
  }
  return null;
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    await prisma.activity.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const before = inMemoryActivities.length;
  inMemoryActivities = inMemoryActivities.filter((a) => a.id !== id && a.slug !== id);
  if (inMemoryActivities.length < before) {
    saveJsonSeed('activities.json', inMemoryActivities);
    return true;
  }
  return false;
}

export async function registerForActivity(
  activityIdOrSlug: string,
  regData: { name: string; email: string; phone: string; address?: string }
): Promise<boolean> {
  try {
    const activity = await prisma.activity.findFirst({
      where: {
        OR: [{ id: activityIdOrSlug }, { slug: activityIdOrSlug }],
      },
    });

    if (activity) {
      // Atomic seat-guarded transaction: only succeeds if seats are not full
      // Use a conditional update that only matches when registered < seats
      const updated = await prisma.activity.updateMany({
        where: {
          id: activity.id,
          status: { not: ActivityStatus.CLOSED },
          // Conditional: registered must be strictly less than seats
          // (or seats must be 0 for unlimited, which we treat as no cap)
          OR: [
            { seats: 0 },
            { registered: { lt: activity.seats } },
          ],
        },
        data: {
          registered: { increment: 1 },
          status: activity.seats > 0 && activity.registered + 1 >= activity.seats ? ActivityStatus.FULL : ActivityStatus.OPEN,
        },
      });

      if (updated.count === 0) {
        // No rows updated — either event is full or closed
        return false;
      }

      await prisma.registration.create({
        data: {
          name: regData.name,
          email: regData.email,
          phone: regData.phone,
          address: regData.address || '',
          activityId: activity.id,
        },
      });
      return true;
    }
  } catch (err) {
    // Fallback to in-memory if DB unavailable
  }

  initFallbackStores();
  const act = inMemoryActivities.find((a) => a.id === activityIdOrSlug || a.slug === activityIdOrSlug);
  if (!act) return false;
  if (act.seats > 0 && act.registered >= act.seats) return false;
  if (act.status === ActivityStatus.CLOSED) return false;

  const newReg: Registration = {
    id: `reg-${Date.now()}`,
    name: regData.name,
    email: regData.email,
    phone: regData.phone,
    address: regData.address,
    activityId: act.id,
    activityTitle: act.title,
    createdAt: new Date().toISOString(),
  };
  inMemoryRegistrations.push(newReg);
  act.registered += 1;
  if (act.registered >= act.seats) {
    act.status = ActivityStatus.FULL;
  }
  return true;
}

// ----------------- PRODUCTS / PROJECTS -----------------

export async function getProducts(): Promise<Product[]> {
  try {
    const records = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (records && records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category as ProductCategory,
        description: r.description,
        content: r.content,
        image: r.image,
        github: r.github,
        demo: r.demo,
        tags: r.tags,
        featured: r.featured,
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const record = await prisma.product.findUnique({
      where: { slug },
    });
    if (record) {
      return {
        id: record.id,
        title: record.title,
        slug: record.slug,
        category: record.category as ProductCategory,
        description: record.description,
        content: record.content,
        image: record.image,
        github: record.github,
        demo: record.demo,
        tags: record.tags,
        featured: record.featured,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryProducts.find((p) => p.slug === slug) || null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const title = data.title || 'Untitled Project';
  const slug = data.slug || slugify(title);

  try {
    const created = await prisma.product.create({
      data: {
        title,
        slug,
        category: data.category || ProductCategory.ROBOTICS,
        description: data.description || '',
        content: data.content || '',
        image: data.image || '',
        github: data.github || '',
        demo: data.demo || '',
        tags: data.tags || [],
        featured: Boolean(data.featured),
      },
    });
    return {
      id: created.id,
      title: created.title,
      slug: created.slug,
      category: created.category as ProductCategory,
      description: created.description,
      content: created.content,
      image: created.image,
      github: created.github,
      demo: created.demo,
      tags: created.tags,
      featured: created.featured,
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title,
    slug,
    category: data.category || ProductCategory.ROBOTICS,
    description: data.description || '',
    content: data.content || '',
    image: data.image || '',
    github: data.github || '',
    demo: data.demo || '',
    tags: data.tags || [],
    featured: Boolean(data.featured),
  };
  inMemoryProducts.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const dataToUpdate: any = { ...updates };
  if (updates.title && !updates.slug) {
    dataToUpdate.slug = slugify(updates.title);
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    return updated;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const idx = inMemoryProducts.findIndex((p) => p.id === id || p.slug === id);
  if (idx !== -1) {
    inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...dataToUpdate };
    return inMemoryProducts[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const before = inMemoryProducts.length;
  inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id && p.slug !== id);
  return inMemoryProducts.length < before;
}

// ----------------- HERO CAROUSEL -----------------

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  try {
    const records = await prisma.carouselSlide.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    if (records && records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        src: r.src,
        alt: r.alt,
        title: r.title,
        subtitle: r.subtitle,
        order: r.order,
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryCarousel;
}

export async function addCarouselSlide(slide: Partial<CarouselSlide>): Promise<CarouselSlide> {
  try {
    const created = await prisma.carouselSlide.create({
      data: {
        src: slide.src || '',
        alt: slide.alt || 'Slide',
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        order: slide.order !== undefined ? slide.order : 99,
        active: true,
      },
    });
    return created;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newSlide: CarouselSlide = {
    id: `carousel-${Date.now()}`,
    src: slide.src || '',
    alt: slide.alt || 'Slide',
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    order: slide.order !== undefined ? slide.order : inMemoryCarousel.length + 1,
    // Persist active so getCarouselSlides() (which filters by active=true) returns this slide
    ...({ active: true } as any),
  };
  inMemoryCarousel.push(newSlide);
  saveJsonSeed('carousel.json', inMemoryCarousel);
  return newSlide;
}

export async function deleteCarouselSlide(id: string): Promise<boolean> {
  try {
    await prisma.carouselSlide.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const before = inMemoryCarousel.length;
  inMemoryCarousel = inMemoryCarousel.filter((c) => c.id !== id);
  return inMemoryCarousel.length < before;
}

// ----------------- USERS CRUD -----------------

function normalizeTimeline(raw: any): TimelineItem[] {
  if (Array.isArray(raw)) return raw as TimelineItem[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as TimelineItem[];
    } catch {}
  }
  return [];
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    if (users && users.length > 0) {
      return users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        tagline: u.tagline,
        bio: u.bio,
        role: (u.role || Role.USER) as Role,
        passwordHash: u.passwordHash,
        timeline: normalizeTimeline(u.timeline),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const seedUsers = loadJsonSeed<User[]>('users.json', inMemoryUsers);
  if (seedUsers && Array.isArray(seedUsers) && seedUsers.length > 0) {
    inMemoryUsers = seedUsers;
  }
  return inMemoryUsers;
}

/**
 * Strips sensitive fields (like passwordHash) from a User record before returning it to clients.
 */
function sanitizeUser(u: User): Record<string, any> {
  if (!u) return u as any;
  const { passwordHash, ...safe } = u as any;
  return safe;
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const u: any = await prisma.user.findUnique({
      where: { id },
    });
    if (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        tagline: u.tagline,
        bio: u.bio,
        role: (u.role || Role.USER) as Role,
        passwordHash: u.passwordHash,
        timeline: normalizeTimeline(u.timeline),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryUsers.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const u: any = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        tagline: u.tagline,
        bio: u.bio,
        role: (u.role || Role.USER) as Role,
        passwordHash: u.passwordHash,
        timeline: normalizeTimeline(u.timeline),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(data: Partial<User>): Promise<User> {
  const newId = data.id || `usr-${Date.now()}`;
  const timelineVal = Array.isArray(data.timeline) ? data.timeline : [];

  initFallbackStores();
  const newUser: User = {
    id: newId,
    name: data.name || '',
    email: data.email || null,
    image: data.image || null,
    tagline: data.tagline || null,
    bio: data.bio || null,
    role: data.role || Role.USER,
    passwordHash: data.passwordHash || null,
    timeline: timelineVal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryUsers.push(newUser);
  saveJsonSeed('users.json', inMemoryUsers);

  try {
    const created: any = await prisma.user.create({
      data: {
        id: newId,
        name: data.name || '',
        email: data.email || null,
        image: data.image || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        role: data.role || Role.USER,
        passwordHash: data.passwordHash || null,
        timeline: timelineVal as any,
      },
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      image: created.image,
      tagline: created.tagline,
      bio: created.bio,
      role: created.role as Role,
      passwordHash: created.passwordHash,
      timeline: normalizeTimeline(created.timeline),
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  } catch (err) {
    // Fallback
  }

  return newUser;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const timelineVal = data.timeline !== undefined ? (Array.isArray(data.timeline) ? data.timeline : []) : undefined;

  // Try Prisma first
  try {
    const updated: any = await prisma.user.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        email: data.email !== undefined ? data.email : undefined,
        image: data.image !== undefined ? data.image : undefined,
        tagline: data.tagline !== undefined ? data.tagline : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
        role: data.role !== undefined ? data.role : undefined,
        passwordHash: data.passwordHash !== undefined ? data.passwordHash : undefined,
        timeline: timelineVal !== undefined ? (timelineVal as any) : undefined,
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      tagline: updated.tagline,
      bio: updated.bio,
      role: updated.role as Role,
      passwordHash: updated.passwordHash,
      timeline: normalizeTimeline(updated.timeline),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (err) {
    // Fall through to in-memory fallback
  }

  // Fallback to in-memory update — never silently create a new user from update
  initFallbackStores();
  const idx = inMemoryUsers.findIndex((u) => u.id === id);
  if (idx === -1) {
    throw new Error(`User not found: ${id}`);
  }
  inMemoryUsers[idx] = {
    ...inMemoryUsers[idx],
    name: data.name !== undefined ? data.name : inMemoryUsers[idx].name,
    email: data.email !== undefined ? data.email : inMemoryUsers[idx].email,
    image: data.image !== undefined ? data.image : inMemoryUsers[idx].image,
    tagline: data.tagline !== undefined ? data.tagline : inMemoryUsers[idx].tagline,
    bio: data.bio !== undefined ? data.bio : inMemoryUsers[idx].bio,
    role: data.role !== undefined ? data.role : inMemoryUsers[idx].role,
    passwordHash: data.passwordHash !== undefined ? data.passwordHash : inMemoryUsers[idx].passwordHash,
    timeline: timelineVal !== undefined ? timelineVal : inMemoryUsers[idx].timeline,
    updatedAt: new Date().toISOString(),
  };
  saveJsonSeed('users.json', inMemoryUsers);
  return inMemoryUsers[idx];
}

export async function deleteUser(id: string): Promise<boolean> {
  initFallbackStores();
  const before = inMemoryUsers.length;
  inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id);
  if (inMemoryUsers.length < before) {
    saveJsonSeed('users.json', inMemoryUsers);
  }

  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (err) {
    // Fallback
  }

  return inMemoryUsers.length < before;
}

// ----------------- ABOUT & PROFILE (Backed by Primary Admin User) -----------------

/**
 * Finds the canonical admin user for site-wide About profile data.
 * Strictly prefers role === Role.ADMIN (set in DB); never falls back to brittle string matching.
 */
async function findPrimaryAdminUser(): Promise<User | null> {
  const users = await getUsers();
  return (
    users.find((u) => u.role === Role.ADMIN) ||
    null
  );
}

export async function getAboutProfile(): Promise<AboutProfile> {
  const primary = await findPrimaryAdminUser();

  if (primary) {
    return {
      id: primary.id,
      name: primary.name || 'MINH NGOC',
      tagline: primary.tagline || 'Mechanical Engineering Student & STEM Advocate',
      bio: primary.bio || '',
      image: primary.image,
      photoUrl: primary.image,
      timeline: primary.timeline || [],
    };
  }

  initFallbackStores();
  return {
    name: 'MINH NGOC',
    tagline: 'Mechanical Engineering Student & STEM Advocate',
    bio: 'A passionate mechanical engineering student exploring mechanics, robotics, and tech.',
    image: null,
    photoUrl: null,
    timeline: [],
  };
}

export async function updateAboutProfile(data: Partial<AboutProfile>): Promise<AboutProfile> {
  const primary = await findPrimaryAdminUser();

  const imageVal = data.image !== undefined ? data.image : data.photoUrl;

  if (primary) {
    const updated = await updateUser(primary.id, {
      name: data.name,
      tagline: data.tagline,
      bio: data.bio,
      image: imageVal,
      timeline: data.timeline,
    });
    return {
      id: updated.id,
      name: updated.name || 'MINH NGOC',
      tagline: updated.tagline || 'Mechanical Engineering Student & STEM Advocate',
      bio: updated.bio || '',
      image: updated.image,
      photoUrl: updated.image,
      timeline: updated.timeline || [],
    };
  }

  // If no admin user exists yet, create one
  const created = await createUser({
    name: data.name || 'MINH NGOC',
    email: 'admin@mechgirl.com',
    role: Role.ADMIN,
    tagline: data.tagline || 'Mechanical Engineering Student & STEM Advocate',
    bio: data.bio || '',
    image: imageVal,
    timeline: data.timeline || [],
  });

  return {
    id: created.id,
    name: created.name || 'MINH NGOC',
    tagline: created.tagline || '',
    bio: created.bio || '',
    image: created.image,
    photoUrl: created.image,
    timeline: created.timeline || [],
  };
}

// ----------------- CONTACT & MESSAGES -----------------

export async function getContactInfo(): Promise<ContactInfo> {
  // Always load latest contact from JSON seed file - no database table required
  const rawContact = loadJsonSeed<any>('contact.json', inMemoryContact || null);
  if (rawContact) {
    inMemoryContact = {
      name: rawContact.name || 'MechGirl',
      tagline: rawContact.tagline || 'Dream it, Scheme it, STEM it!',
      email: rawContact.email || 'contact@mechgirl.com',
      phone: rawContact.phone || '+1 (555) 123-4567',
      address: rawContact.address || '123 Engineering Way, Innovation District, CA 94043',
      about: rawContact.about || '',
      socials: {
        facebook: rawContact.socials?.facebook || '',
        youtube: rawContact.socials?.youtube || '',
        github: rawContact.socials?.github || '',
        instagram: rawContact.socials?.instagram || '',
        linkedin: rawContact.socials?.linkedin || '',
      },
    };
    return inMemoryContact;
  }

  initFallbackStores();
  return inMemoryContact!;
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const current = await getContactInfo();
  const updatedSocials = {
    ...(current.socials || {}),
    ...(data.socials || {}),
  };

  inMemoryContact = {
    ...current,
    ...data,
    socials: updatedSocials,
  };

  // Persist directly to contact.json (both data/seeds and public/json) - no database table required!
  saveJsonSeed('contact.json', inMemoryContact);

  // Optional: keep DB synchronized if Prisma is connected, without failing if table does not exist
  try {
    let contact = await prisma.contactInfo.findFirst();
    const updatePayload = {
      name: inMemoryContact.name,
      tagline: inMemoryContact.tagline,
      email: inMemoryContact.email,
      phone: inMemoryContact.phone,
      address: inMemoryContact.address,
      about: inMemoryContact.about,
      facebook: inMemoryContact.socials?.facebook,
      youtube: inMemoryContact.socials?.youtube,
      github: inMemoryContact.socials?.github,
      instagram: inMemoryContact.socials?.instagram,
      linkedin: inMemoryContact.socials?.linkedin,
    };

    if (contact) {
      await prisma.contactInfo.update({
        where: { id: contact.id },
        data: updatePayload,
      });
    } else {
      await prisma.contactInfo.create({
        data: updatePayload,
      });
    }
  } catch (err) {
    // Database table not required, ignore silently
  }

  return inMemoryContact;
}

export async function submitContactMessage(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  try {
    const created = await prisma.contactMessage.create({
      data: {
        name: msg.name,
        email: msg.email,
        subject: msg.subject || '',
        message: msg.message,
      },
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      subject: created.subject,
      message: created.message,
      createdAt: created.createdAt.toISOString(),
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: msg.name,
    email: msg.email,
    subject: msg.subject || '',
    message: msg.message,
    createdAt: new Date().toISOString(),
  };
  inMemoryMessages.unshift(newMsg);
  return newMsg;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const records = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (records && records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        subject: r.subject,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryMessages;
}

// ----------------- REGISTRATIONS -----------------

export async function getRegistrations(): Promise<Registration[]> {
  try {
    const records = await prisma.registration.findMany({
      include: { activity: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    if (records && records.length > 0) {
      return records.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        address: r.address,
        activityId: r.activityId,
        activityTitle: r.activity?.title,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryRegistrations;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  try {
    // Fetch the registration first so we know which activity to update
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) return false;

    // Transactional: delete registration, then decrement activity counter and recompute status
    await prisma.$transaction([
      prisma.registration.delete({ where: { id } }),
      prisma.activity.update({
        where: { id: reg.activityId },
        data: {
          registered: { decrement: 1 },
        },
      }),
    ]);

    // Recompute status after decrement (separate read since the activity update above only decrements)
    const act = await prisma.activity.findUnique({ where: { id: reg.activityId } });
    if (act && act.status !== ActivityStatus.CLOSED) {
      const newStatus = act.seats > 0 && act.registered >= act.seats ? ActivityStatus.FULL : ActivityStatus.OPEN;
      if (newStatus !== act.status) {
        await prisma.activity.update({ where: { id: reg.activityId }, data: { status: newStatus } });
      }
    }

    return true;
  } catch (err) {
    // Fallback to in-memory
  }

  initFallbackStores();
  const before = inMemoryRegistrations.length;
  const regToDelete = inMemoryRegistrations.find((r) => r.id === id);
  inMemoryRegistrations = inMemoryRegistrations.filter((r) => r.id !== id);
  const deleted = inMemoryRegistrations.length < before;
  if (deleted && regToDelete) {
    const act = inMemoryActivities.find((a) => a.id === regToDelete.activityId);
    if (act && act.registered > 0) {
      act.registered -= 1;
      if (act.status !== ActivityStatus.CLOSED && act.registered < act.seats) {
        act.status = ActivityStatus.OPEN;
      }
    }
  }
  return deleted;
}

// ----------------- COMMON KNOWLEDGE (BLOGS & COMMUNITY ARTICLES) -----------------

export async function getKnowledgeList(filter?: {
  status?: KnowledgeStatus | 'all';
  authorEmail?: string;
  search?: string;
}): Promise<Knowledge[]> {
  try {
    const whereClause: any = {};
    if (filter?.status && (filter.status as any) !== 'all') {
      whereClause.status = filter.status;
      // Always require confirmed=true alongside an explicit status filter
      // so we don't surface unconfirmed rows even if status was set externally
      whereClause.confirmed = true;
    }
    if (filter?.authorEmail) {
      whereClause.authorEmail = filter.authorEmail;
    }
    const records: any = await (prisma as any).knowledge?.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : { confirmed: true },
      orderBy: { createdAt: 'desc' },
    });
    if (records && records.length > 0) {
      return records.map((k: any) => ({
        ...k,
        createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : k.createdAt,
        updatedAt: k.updatedAt instanceof Date ? k.updatedAt.toISOString() : k.updatedAt,
      }));
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const seed = loadJsonSeed<Knowledge[]>('knowledge.json', inMemoryKnowledge);
  if (seed && Array.isArray(seed) && seed.length > 0) {
    inMemoryKnowledge = seed.map((k) => ({
      ...k,
      status: normalizeKnowledgeStatus(k.status),
      tags: k.tags ?? [],
    }));
  }

  let list = [...inMemoryKnowledge];

  // Both DB and JSON branches must require confirmed=true unless explicitly opting in
  if (filter?.status && (filter.status as any) !== 'all') {
    list = list.filter((k) => k.status === filter.status && k.confirmed);
  } else {
    // No status filter — default to confirmed only for public listing
    list = list.filter((k) => k.confirmed);
  }
  if (filter?.authorEmail) {
    list = list.filter((k) => k.authorEmail?.toLowerCase() === filter.authorEmail?.toLowerCase());
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q) ||
        (k.summary && k.summary.toLowerCase().includes(q)) ||
        k.content.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getKnowledgeBySlug(slug: string): Promise<Knowledge | null> {
  try {
    const record: any = await (prisma as any).knowledge?.findUnique({
      where: { slug },
    });
    if (record) {
      return {
        ...record,
        createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const list = await getKnowledgeList();
  return list.find((k) => k.slug === slug) || null;
}

export async function getKnowledgeById(id: string): Promise<Knowledge | null> {
  try {
    const record: any = await (prisma as any).knowledge?.findUnique({
      where: { id },
    });
    if (record) {
      return {
        ...record,
        createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const list = await getKnowledgeList();
  return list.find((k) => k.id === id) || null;
}

export async function createKnowledge(data: Partial<Knowledge>): Promise<Knowledge> {
  initFallbackStores();
  const id = data.id || `know-${Date.now()}`;
  const title = data.title || 'Untitled Knowledge';
  const slug = data.slug || slugify(title) + '-' + Math.floor(Math.random() * 1000);
  const status = data.status || KnowledgeStatus.PENDING;
  const confirmed = data.confirmed ?? (status === KnowledgeStatus.CONFIRMED);

  const newArticle: Knowledge = {
    id,
    title,
    slug,
    category: data.category || KnowledgeCategory.ENGINEERING,
    summary: data.summary || '',
    content: data.content || '',
    image: data.image || null,
    status,
    confirmed,
    authorId: data.authorId || null,
    authorName: data.authorName || 'Community Member',
    authorEmail: data.authorEmail || null,
    authorImage: data.authorImage || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryKnowledge.unshift(newArticle);
  saveJsonSeed('knowledge.json', inMemoryKnowledge);

  try {
    await (prisma as any).knowledge?.create({
      data: {
        id: newArticle.id,
        title: newArticle.title,
        slug: newArticle.slug,
        category: newArticle.category,
        summary: newArticle.summary,
        content: newArticle.content,
        image: newArticle.image,
        status: newArticle.status,
        confirmed: newArticle.confirmed,
        authorId: newArticle.authorId,
        authorName: newArticle.authorName,
        authorEmail: newArticle.authorEmail,
        authorImage: newArticle.authorImage,
        tags: newArticle.tags,
      },
    });
  } catch (err) {
    // Fallback
  }

  return newArticle;
}

export async function updateKnowledge(id: string, updates: Partial<Knowledge>): Promise<Knowledge | null> {
  initFallbackStores();
  const idx = inMemoryKnowledge.findIndex((k) => k.id === id || k.slug === id);
  if (idx === -1) return null;

  const target = inMemoryKnowledge[idx];
  const newStatus = updates.status !== undefined ? updates.status : target.status;
  const newConfirmed = updates.confirmed !== undefined ? updates.confirmed : (newStatus === KnowledgeStatus.CONFIRMED);

  const updated: Knowledge = {
    ...target,
    ...updates,
    status: newStatus,
    confirmed: newConfirmed,
    updatedAt: new Date().toISOString(),
  };

  inMemoryKnowledge[idx] = updated;
  saveJsonSeed('knowledge.json', inMemoryKnowledge);

  try {
    await (prisma as any).knowledge?.update({
      where: { id: target.id },
      data: {
        title: updates.title,
        slug: updates.slug,
        category: updates.category,
        summary: updates.summary,
        content: updates.content,
        image: updates.image,
        status: newStatus,
        confirmed: newConfirmed,
        tags: updates.tags,
      },
    });
  } catch (err) {
    // Fallback
  }

  return updated;
}

export async function confirmKnowledge(id: string, confirmed: boolean): Promise<Knowledge | null> {
  return updateKnowledge(id, {
    confirmed,
    status: confirmed ? KnowledgeStatus.CONFIRMED : KnowledgeStatus.REJECTED,
  });
}

export async function deleteKnowledge(id: string): Promise<boolean> {
  initFallbackStores();
  const before = inMemoryKnowledge.length;
  inMemoryKnowledge = inMemoryKnowledge.filter((k) => k.id !== id && k.slug !== id);
  const deleted = inMemoryKnowledge.length < before;

  if (deleted) {
    saveJsonSeed('knowledge.json', inMemoryKnowledge);
  }

  try {
    await (prisma as any).knowledge?.delete({
      where: { id },
    });
  } catch (err) {
    // Fallback
  }

  return deleted;
}
