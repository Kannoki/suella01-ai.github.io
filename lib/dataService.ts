import prisma from './prisma';
import fs from 'fs';
import path from 'path';

export interface Activity {
  id: string;
  title: string;
  slug: string;
  type: string;
  date: string;
  time?: string | null;
  location?: string | null;
  description: string;
  content?: string | null;
  image?: string | null;
  seats: number;
  registered: number;
  status: string;
  featured?: boolean;
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
  category: string;
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
  role?: string;
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

function initFallbackStores() {
  if (inMemoryUsers.length === 0) {
    inMemoryUsers = loadJsonSeed<User[]>('users.json', []);
  }
  if (inMemoryActivities.length === 0) {
    inMemoryActivities = loadJsonSeed<Activity[]>('activities.json', []);
  }
  if (inMemoryProducts.length === 0) {
    inMemoryProducts = loadJsonSeed<Product[]>('products.json', []);
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
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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
        type: r.type,
        date: r.date,
        time: r.time,
        location: r.location,
        description: r.description,
        content: r.content,
        image: r.image,
        seats: r.seats,
        registered: r.registered,
        status: r.status,
        featured: r.featured,
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
        type: record.type,
        date: record.date,
        time: record.time,
        location: record.location,
        description: record.description,
        content: record.content,
        image: record.image,
        seats: record.seats,
        registered: record.registered,
        status: record.status,
        featured: record.featured,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryActivities.find((a) => a.slug === slug) || null;
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
        type: data.type || 'Workshop',
        date: data.date || 'TBD',
        time: data.time || '',
        location: data.location || 'Online',
        description: data.description || '',
        content: data.content || '',
        image: data.image || '',
        seats,
        registered: 0,
        status: seats > 0 ? 'open' : 'full',
        featured: Boolean(data.featured),
      },
    });
    return created;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newActivity: Activity = {
    id: `act-${Date.now()}`,
    title,
    slug,
    type: data.type || 'Workshop',
    date: data.date || 'TBD',
    time: data.time || '',
    location: data.location || 'Online',
    description: data.description || '',
    content: data.content || '',
    image: data.image || '',
    seats,
    registered: 0,
    status: seats > 0 ? 'open' : 'full',
    featured: Boolean(data.featured),
  };
  inMemoryActivities.unshift(newActivity);
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

  try {
    const updated = await prisma.activity.update({
      where: { id },
      data: dataToUpdate,
    });
    return updated;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const idx = inMemoryActivities.findIndex((a) => a.id === id || a.slug === id);
  if (idx !== -1) {
    inMemoryActivities[idx] = { ...inMemoryActivities[idx], ...dataToUpdate };
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
  return inMemoryActivities.length < before;
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
      await prisma.$transaction([
        prisma.registration.create({
          data: {
            name: regData.name,
            email: regData.email,
            phone: regData.phone,
            address: regData.address || '',
            activityId: activity.id,
          },
        }),
        prisma.activity.update({
          where: { id: activity.id },
          data: {
            registered: { increment: 1 },
            status: activity.registered + 1 >= activity.seats ? 'full' : 'open',
          },
        }),
      ]);
      return true;
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const act = inMemoryActivities.find((a) => a.id === activityIdOrSlug || a.slug === activityIdOrSlug);
  if (!act) return false;

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
    act.status = 'full';
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
        category: r.category,
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
        category: record.category,
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
        category: data.category || 'Robotics',
        description: data.description || '',
        content: data.content || '',
        image: data.image || '',
        github: data.github || '',
        demo: data.demo || '',
        tags: data.tags || [],
        featured: Boolean(data.featured),
      },
    });
    return created;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title,
    slug,
    category: data.category || 'Robotics',
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
  };
  inMemoryCarousel.push(newSlide);
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
    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      tagline: u.tagline,
      bio: u.bio,
      role: u.role || 'user',
      timeline: normalizeTimeline(u.timeline),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryUsers;
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
        role: u.role || 'user',
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
      where: { email },
    });
    if (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        tagline: u.tagline,
        bio: u.bio,
        role: u.role || 'user',
        timeline: normalizeTimeline(u.timeline),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryUsers.find((u) => u.email === email) || null;
}

export async function createUser(data: Partial<User>): Promise<User> {
  const newId = data.id || `usr-${Date.now()}`;
  const timelineVal = Array.isArray(data.timeline) ? data.timeline : [];

  try {
    const created: any = await prisma.user.create({
      data: {
        id: newId,
        name: data.name || '',
        email: data.email || null,
        image: data.image || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        role: data.role || 'user',
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
      role: created.role,
      timeline: normalizeTimeline(created.timeline),
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const newUser: User = {
    id: newId,
    name: data.name || '',
    email: data.email || null,
    image: data.image || null,
    tagline: data.tagline || null,
    bio: data.bio || null,
    role: data.role || 'user',
    timeline: timelineVal,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryUsers.push(newUser);
  saveJsonSeed('users.json', inMemoryUsers);
  return newUser;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const timelineVal = data.timeline !== undefined ? (Array.isArray(data.timeline) ? data.timeline : []) : undefined;

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
      role: updated.role,
      timeline: normalizeTimeline(updated.timeline),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const idx = inMemoryUsers.findIndex((u) => u.id === id);
  if (idx >= 0) {
    inMemoryUsers[idx] = {
      ...inMemoryUsers[idx],
      name: data.name !== undefined ? data.name : inMemoryUsers[idx].name,
      email: data.email !== undefined ? data.email : inMemoryUsers[idx].email,
      image: data.image !== undefined ? data.image : inMemoryUsers[idx].image,
      tagline: data.tagline !== undefined ? data.tagline : inMemoryUsers[idx].tagline,
      bio: data.bio !== undefined ? data.bio : inMemoryUsers[idx].bio,
      role: data.role !== undefined ? data.role : inMemoryUsers[idx].role,
      timeline: timelineVal !== undefined ? timelineVal : inMemoryUsers[idx].timeline,
      updatedAt: new Date().toISOString(),
    };
    saveJsonSeed('users.json', inMemoryUsers);
    return inMemoryUsers[idx];
  }

  // If not found in memory, create it
  return createUser({ ...data, id });
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const before = inMemoryUsers.length;
  inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id);
  if (inMemoryUsers.length < before) {
    saveJsonSeed('users.json', inMemoryUsers);
    return true;
  }
  return false;
}

// ----------------- ABOUT & PROFILE (Backed by Primary User) -----------------

export async function getAboutProfile(): Promise<AboutProfile> {
  const users = await getUsers();
  const primary =
    users.find((u) => u.role === 'admin') ||
    users.find((u) => u.name?.toUpperCase().includes('MINH NGOC')) ||
    users[0];

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
  const users = await getUsers();
  const primary =
    users.find((u) => u.role === 'admin') ||
    users.find((u) => u.name?.toUpperCase().includes('MINH NGOC')) ||
    users[0];

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

  // If no user exists yet, create primary user
  const created = await createUser({
    name: data.name || 'MINH NGOC',
    email: 'admin@mechgirl.com',
    role: 'admin',
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
  try {
    const contact = await prisma.contactInfo.findFirst();
    if (contact) {
      return {
        id: contact.id,
        name: contact.name,
        tagline: contact.tagline,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        about: contact.about,
        socials: {
          facebook: contact.facebook || undefined,
          youtube: contact.youtube || undefined,
          github: contact.github || undefined,
          instagram: contact.instagram || undefined,
          linkedin: contact.linkedin || undefined,
        },
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryContact!;
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  try {
    let contact = await prisma.contactInfo.findFirst();
    const updatePayload = {
      name: data.name,
      tagline: data.tagline,
      email: data.email,
      phone: data.phone,
      address: data.address,
      about: data.about,
      facebook: data.socials?.facebook,
      youtube: data.socials?.youtube,
      github: data.socials?.github,
      instagram: data.socials?.instagram,
      linkedin: data.socials?.linkedin,
    };

    if (contact) {
      await prisma.contactInfo.update({
        where: { id: contact.id },
        data: updatePayload,
      });
    } else {
      await prisma.contactInfo.create({
        data: {
          name: data.name || 'MechGirl',
          tagline: data.tagline || '',
          email: data.email || 'contact@mechgirl.com',
          phone: data.phone || '',
          address: data.address || '',
          about: data.about || '',
          facebook: data.socials?.facebook || '',
          youtube: data.socials?.youtube || '',
          github: data.socials?.github || '',
          instagram: data.socials?.instagram || '',
          linkedin: data.socials?.linkedin || '',
        },
      });
    }
    return getContactInfo();
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  if (inMemoryContact) {
    inMemoryContact = { ...inMemoryContact, ...data };
  }
  return inMemoryContact!;
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
    await prisma.registration.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  const before = inMemoryRegistrations.length;
  inMemoryRegistrations = inMemoryRegistrations.filter((r) => r.id !== id);
  return inMemoryRegistrations.length < before;
}
