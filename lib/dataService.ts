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
  photoUrl?: string | null;
  timeline: TimelineItem[];
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

// In-memory fallback stores for when DB is unreachable
let inMemoryActivities: Activity[] = [];
let inMemoryProducts: Product[] = [];
let inMemoryCarousel: CarouselSlide[] = [];
let inMemoryAbout: AboutProfile | null = null;
let inMemoryContact: ContactInfo | null = null;
let inMemoryRegistrations: Registration[] = [];
let inMemoryMessages: ContactMessage[] = [];

function initFallbackStores() {
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
      tagline: 'Empowering Women in Mechanical Engineering',
      email: 'contact@mechgirl.com',
      phone: '+1 (555) 123-4567',
      address: '123 Engineering Way, Innovation District, CA 94043',
    });
    inMemoryContact = {
      name: rawContact.name || 'MechGirl',
      tagline: rawContact.tagline || 'Empowering Women in Mechanical Engineering',
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

// ----------------- ABOUT & TIMELINE -----------------

export async function getAboutProfile(): Promise<AboutProfile> {
  try {
    const profile = await prisma.aboutProfile.findFirst({
      include: {
        timelines: {
          orderBy: { startYear: 'desc' },
        },
      },
    });

    if (profile) {
      return {
        id: profile.id,
        name: profile.name,
        tagline: profile.tagline,
        bio: profile.bio,
        photoUrl: profile.photoUrl,
        timeline: profile.timelines.map((t) => ({
          id: t.id,
          startYear: t.startYear,
          endYear: t.endYear,
          title: t.title,
          institution: t.institution,
          description: t.description,
          order: t.order,
        })),
      };
    }
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  return inMemoryAbout!;
}

export async function updateAboutProfile(data: Partial<AboutProfile>): Promise<AboutProfile> {
  try {
    let profile = await prisma.aboutProfile.findFirst();
    if (profile) {
      profile = await prisma.aboutProfile.update({
        where: { id: profile.id },
        data: {
          name: data.name ?? profile.name,
          tagline: data.tagline ?? profile.tagline,
          bio: data.bio ?? profile.bio,
          photoUrl: data.photoUrl ?? profile.photoUrl,
        },
      });
    } else {
      profile = await prisma.aboutProfile.create({
        data: {
          name: data.name || 'MINH NGOC',
          tagline: data.tagline || 'Mechanical Engineering Student',
          bio: data.bio || '',
          photoUrl: data.photoUrl || '',
        },
      });
    }
    return getAboutProfile();
  } catch (err) {
    // Fallback
  }

  initFallbackStores();
  if (inMemoryAbout) {
    inMemoryAbout = {
      ...inMemoryAbout,
      name: data.name ?? inMemoryAbout.name,
      tagline: data.tagline ?? inMemoryAbout.tagline,
      bio: data.bio ?? inMemoryAbout.bio,
      photoUrl: data.photoUrl ?? inMemoryAbout.photoUrl,
      timeline: data.timeline ?? inMemoryAbout.timeline,
    };
  }
  return inMemoryAbout!;
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
