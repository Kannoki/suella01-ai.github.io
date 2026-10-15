import { adminDb } from './firebaseAdmin';
import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

// ── Types & Enums (re-exported from client-safe ./types) ─────────────────────

import {
  Role,
  ActivityType,
  ActivityStatus,
  ProductCategory,
  KnowledgeCategory,
  KnowledgeStatus,
  normalizeRole,
  normalizeActivityType,
  normalizeActivityStatus,
  normalizeProductCategory,
  normalizeKnowledgeStatus,
  type Activity,
  type Registration,
  type Product,
  type CarouselSlide,
  type TimelineItem,
  type AboutProfile,
  type User,
  type ContactInfo,
  type ContactMessage,
  type Knowledge,
} from './types';
export * from './types';


// ── Utilities ────────────────────────────────────────────────────────────────

export { slugify, toDateInputValue, formatActivityDate } from './dateUtils';

function toISOString(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

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

function docToActivity(id: string, d: DocumentData): Activity {
  return {
    id,
    title: d.title,
    slug: d.slug,
    type: d.type as ActivityType,
    date: d.date,
    time: d.time ?? null,
    location: d.location ?? null,
    description: d.description,
    content: d.content ?? null,
    image: d.image ?? null,
    seats: Number(d.seats ?? 0),
    registered: Number(d.registered ?? 0),
    status: d.status as ActivityStatus,
    featured: Boolean(d.featured),
    tags: d.tags ?? [],
  };
}

function docToProduct(id: string, d: DocumentData): Product {
  return {
    id,
    title: d.title,
    slug: d.slug,
    category: d.category as ProductCategory,
    description: d.description,
    content: d.content ?? null,
    image: d.image ?? null,
    github: d.github ?? null,
    demo: d.demo ?? null,
    tags: d.tags ?? [],
    featured: Boolean(d.featured),
  };
}

function docToUser(id: string, d: DocumentData): User {
  return {
    id,
    name: d.name ?? null,
    email: d.email ?? null,
    image: d.image ?? null,
    tagline: d.tagline ?? null,
    bio: d.bio ?? null,
    role: (d.role ?? Role.USER) as Role,
    passwordHash: d.passwordHash ?? null,
    timeline: normalizeTimeline(d.timeline),
    createdAt: d.createdAt ? toISOString(d.createdAt) : undefined,
    updatedAt: d.updatedAt ? toISOString(d.updatedAt) : undefined,
  };
}

function sanitizeUser(u: User): Record<string, any> {
  const { passwordHash, ...safe } = u as any;
  return safe;
}

// Import slugify
import { slugify } from './dateUtils';

// ── ACTIVITIES ───────────────────────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  const snap = await adminDb
    .collection('activities')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => docToActivity(d.id, d.data()));
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  // Try by slug field first
  const snap = await adminDb
    .collection('activities')
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (!snap.empty) {
    const d = snap.docs[0];
    return docToActivity(d.id, d.data());
  }
  // Fallback: try document ID
  const docSnap = await adminDb.collection('activities').doc(slug).get();
  if (docSnap.exists) return docToActivity(docSnap.id, docSnap.data()!);
  return null;
}

export async function createActivity(data: Partial<Activity>): Promise<Activity> {
  const title = data.title || 'Untitled Activity';
  const slug = data.slug || slugify(title);
  const seats = Number(data.seats) || 0;
  const now = new Date().toISOString();

  const payload = {
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
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection('activities').add(payload);
  return { id: ref.id, ...payload };
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | null> {
  // Resolve doc ID (id might be a slug)
  let docId = id;
  const bySlug = await getActivityBySlug(id);
  if (bySlug) docId = bySlug.id;

  const docRef = adminDb.collection('activities').doc(docId);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const current = docToActivity(snap.id, snap.data()!);

  const dataToUpdate: any = { ...updates, updatedAt: new Date().toISOString() };

  if (updates.title && !updates.slug) {
    dataToUpdate.slug = slugify(updates.title);
  }
  if (updates.seats !== undefined) {
    dataToUpdate.seats = Number(updates.seats);
  }

  // Recompute status
  if (updates.seats !== undefined || updates.registered !== undefined || updates.status !== undefined) {
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

  await docRef.update(dataToUpdate);
  const updated = await docRef.get();
  return docToActivity(updated.id, updated.data()!);
}

export async function deleteActivity(id: string): Promise<boolean> {
  let docId = id;
  const bySlug = await getActivityBySlug(id);
  if (bySlug) docId = bySlug.id;

  const docRef = adminDb.collection('activities').doc(docId);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

export async function registerForActivity(
  activityIdOrSlug: string,
  regData: { name: string; email: string; phone: string; address?: string }
): Promise<boolean> {
  const activity = await getActivityBySlug(activityIdOrSlug);
  if (!activity) return false;

  const actRef = adminDb.collection('activities').doc(activity.id);

  try {
    await adminDb.runTransaction(async (t) => {
      const actSnap = await t.get(actRef);
      if (!actSnap.exists) throw new Error('not-found');
      const act = docToActivity(actSnap.id, actSnap.data()!);

      if (act.status === ActivityStatus.CLOSED) throw new Error('closed');
      if (act.seats > 0 && act.registered >= act.seats) throw new Error('full');

      const newRegistered = act.registered + 1;
      const newStatus =
        act.seats > 0 && newRegistered >= act.seats ? ActivityStatus.FULL : ActivityStatus.OPEN;

      const regRef = adminDb.collection('registrations').doc();
      t.set(regRef, {
        name: regData.name,
        email: regData.email,
        phone: regData.phone,
        address: regData.address || '',
        activityId: activity.id,
        activityTitle: activity.title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      t.update(actRef, {
        registered: newRegistered,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    });
    return true;
  } catch (err: any) {
    if (err.message === 'closed' || err.message === 'full') return false;
    throw err;
  }
}

// ── PRODUCTS / PROJECTS ──────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => docToProduct(d.id, d.data()));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await adminDb
    .collection('products')
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (!snap.empty) return docToProduct(snap.docs[0].id, snap.docs[0].data());
  return null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const title = data.title || 'Untitled Project';
  const slug = data.slug || slugify(title);
  const now = new Date().toISOString();
  const payload = {
    title,
    slug,
    category: data.category || ProductCategory.ROBOTICS,
    description: data.description || '',
    content: data.content || null,
    image: data.image || null,
    github: data.github || null,
    demo: data.demo || null,
    tags: data.tags || [],
    featured: Boolean(data.featured),
    createdAt: now,
    updatedAt: now,
  };
  const ref = await adminDb.collection('products').add(payload);
  return { id: ref.id, ...payload };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const docRef = adminDb.collection('products').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) {
    // Try by slug
    const bySlug = await getProductBySlug(id);
    if (!bySlug) return null;
    return updateProduct(bySlug.id, updates);
  }
  const dataToUpdate: any = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.title && !updates.slug) {
    dataToUpdate.slug = slugify(updates.title);
  }
  await docRef.update(dataToUpdate);
  const updated = await docRef.get();
  return docToProduct(updated.id, updated.data()!);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const docRef = adminDb.collection('products').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) {
    const bySlug = await getProductBySlug(id);
    if (!bySlug) return false;
    await adminDb.collection('products').doc(bySlug.id).delete();
    return true;
  }
  await docRef.delete();
  return true;
}

// ── HERO CAROUSEL ────────────────────────────────────────────────────────────

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  try {
    const snap = await adminDb.collection('carousel_slides').get();
    return snap.docs
      .map((d) => ({
        id: d.id,
        src: d.data().src,
        alt: d.data().alt ?? null,
        title: d.data().title ?? null,
        subtitle: d.data().subtitle ?? null,
        order: d.data().order ?? 0,
        active: d.data().active !== false,
      }))
      .filter((s) => s.active)
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error('getCarouselSlides error:', err);
    return [];
  }
}

export async function addCarouselSlide(slide: Partial<CarouselSlide>): Promise<CarouselSlide> {
  const now = new Date().toISOString();
  const payload = {
    src: slide.src || '',
    alt: slide.alt || 'Slide',
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    order: slide.order !== undefined ? slide.order : 99,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await adminDb.collection('carousel_slides').add(payload);
  return { id: ref.id, ...payload };
}

export async function deleteCarouselSlide(id: string): Promise<boolean> {
  const docRef = adminDb.collection('carousel_slides').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

// ── USERS ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const snap = await adminDb.collection('users').orderBy('createdAt', 'asc').get();
  return snap.docs.map((d) => docToUser(d.id, d.data()));
}

export async function getUserById(id: string): Promise<User | null> {
  const snap = await adminDb.collection('users').doc(id).get();
  if (!snap.exists) return null;
  return docToUser(snap.id, snap.data()!);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await adminDb
    .collection('users')
    .where('email', '==', email.toLowerCase().trim())
    .limit(1)
    .get();
  if (snap.empty) return null;
  return docToUser(snap.docs[0].id, snap.docs[0].data());
}

export async function createUser(data: Partial<User>): Promise<User> {
  const now = new Date().toISOString();
  const id = data.id || `usr-${Date.now()}`;
  const payload: any = {
    name: data.name || '',
    email: data.email ? data.email.toLowerCase().trim() : null,
    image: data.image || null,
    tagline: data.tagline || null,
    bio: data.bio || null,
    role: data.role || Role.USER,
    passwordHash: data.passwordHash || null,
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection('users').doc(id).set(payload);
  return { id, ...payload };
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const docRef = adminDb.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error(`User not found: ${id}`);

  const update: any = { updatedAt: new Date().toISOString() };
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email?.toLowerCase().trim() ?? null;
  if (data.image !== undefined) update.image = data.image;
  if (data.tagline !== undefined) update.tagline = data.tagline;
  if (data.bio !== undefined) update.bio = data.bio;
  if (data.role !== undefined) update.role = data.role;
  if (data.passwordHash !== undefined) update.passwordHash = data.passwordHash;
  if (data.timeline !== undefined) update.timeline = Array.isArray(data.timeline) ? data.timeline : [];

  await docRef.update(update);
  const updated = await docRef.get();
  return docToUser(updated.id, updated.data()!);
}

export async function deleteUser(id: string): Promise<boolean> {
  const docRef = adminDb.collection('users').doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

// ── ABOUT & PROFILE ──────────────────────────────────────────────────────────

async function findPrimaryAdminUser(): Promise<User | null> {
  const snap = await adminDb
    .collection('users')
    .where('role', '==', Role.ADMIN)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return docToUser(snap.docs[0].id, snap.docs[0].data());
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

// ── CONTACT INFO ─────────────────────────────────────────────────────────────

const CONTACT_DOC = 'main';

export async function getContactInfo(): Promise<ContactInfo> {
  const snap = await adminDb.collection('contact_info').doc(CONTACT_DOC).get();
  if (snap.exists) {
    const d = snap.data()!;
    return {
      id: snap.id,
      name: d.name || 'MechGirl',
      tagline: d.tagline || 'Dream it, Scheme it, STEM it!',
      email: d.email || 'contact@mechgirl.com',
      phone: d.phone || null,
      address: d.address || null,
      about: d.about || null,
      socials: {
        facebook: d.facebook || '',
        youtube: d.youtube || '',
        github: d.github || '',
        instagram: d.instagram || '',
        linkedin: d.linkedin || '',
      },
    };
  }
  return {
    name: 'MechGirl',
    tagline: 'Dream it, Scheme it, STEM it!',
    email: 'contact@mechgirl.com',
    socials: {},
  };
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const current = await getContactInfo();
  const updatedSocials = { ...(current.socials || {}), ...(data.socials || {}) };
  const updated: ContactInfo = { ...current, ...data, socials: updatedSocials };

  const payload: any = {
    name: updated.name,
    tagline: updated.tagline,
    email: updated.email,
    phone: updated.phone ?? null,
    address: updated.address ?? null,
    about: updated.about ?? null,
    facebook: updatedSocials.facebook ?? '',
    youtube: updatedSocials.youtube ?? '',
    github: updatedSocials.github ?? '',
    instagram: updatedSocials.instagram ?? '',
    linkedin: updatedSocials.linkedin ?? '',
    updatedAt: new Date().toISOString(),
  };

  await adminDb.collection('contact_info').doc(CONTACT_DOC).set(payload, { merge: true });
  return updated;
}

// ── CONTACT MESSAGES ─────────────────────────────────────────────────────────

export async function submitContactMessage(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  const now = new Date().toISOString();
  const payload = {
    name: msg.name,
    email: msg.email,
    subject: msg.subject || '',
    message: msg.message,
    read: false,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await adminDb.collection('contact_messages').add(payload);
  return { id: ref.id, ...payload };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const snap = await adminDb
    .collection('contact_messages')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    email: d.data().email,
    subject: d.data().subject ?? null,
    message: d.data().message,
    createdAt: toISOString(d.data().createdAt),
  }));
}

// ── REGISTRATIONS ────────────────────────────────────────────────────────────

export async function getRegistrations(): Promise<Registration[]> {
  const snap = await adminDb
    .collection('registrations')
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    email: d.data().email,
    phone: d.data().phone,
    address: d.data().address ?? null,
    activityId: d.data().activityId,
    activityTitle: d.data().activityTitle,
    createdAt: toISOString(d.data().createdAt),
  }));
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const regRef = adminDb.collection('registrations').doc(id);
  const regSnap = await regRef.get();
  if (!regSnap.exists) return false;

  const reg = regSnap.data()!;
  const activityId = reg.activityId;
  const actRef = adminDb.collection('activities').doc(activityId);

  await adminDb.runTransaction(async (t) => {
    const actSnap = await t.get(actRef);
    t.delete(regRef);
    if (actSnap.exists) {
      const act = docToActivity(actSnap.id, actSnap.data()!);
      const newRegistered = Math.max(0, act.registered - 1);
      const newStatus =
        act.status !== ActivityStatus.CLOSED
          ? act.seats > 0 && newRegistered >= act.seats
            ? ActivityStatus.FULL
            : ActivityStatus.OPEN
          : ActivityStatus.CLOSED;
      t.update(actRef, {
        registered: newRegistered,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return true;
}

// ── COMMON KNOWLEDGE ─────────────────────────────────────────────────────────

export async function getKnowledgeList(filter?: {
  status?: KnowledgeStatus | 'all';
  authorEmail?: string;
  search?: string;
}): Promise<Knowledge[]> {
  try {
    const snap = await adminDb.collection('knowledge').get();

    let list: Knowledge[] = snap.docs.map((d: QueryDocumentSnapshot) => ({
      id: d.id,
      ...d.data(),
      createdAt: toISOString(d.data().createdAt),
      updatedAt: toISOString(d.data().updatedAt),
    })) as Knowledge[];

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((k) => k.status === filter.status && k.confirmed === true);
    } else if (!filter?.status) {
      list = list.filter((k) => k.confirmed === true);
    }

    if (filter?.authorEmail) {
      list = list.filter((k) => k.authorEmail === filter.authorEmail);
    }

    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (filter?.search) {
      const q2 = filter.search.toLowerCase();
      list = list.filter(
        (k) =>
          k.title.toLowerCase().includes(q2) ||
          k.category.toLowerCase().includes(q2) ||
          (k.summary && k.summary.toLowerCase().includes(q2)) ||
          k.content.toLowerCase().includes(q2)
      );
    }

    return list;
  } catch (err) {
    console.error('getKnowledgeList error:', err);
    return [];
  }
}

export async function getKnowledgeBySlug(slug: string): Promise<Knowledge | null> {
  const snap = await adminDb
    .collection('knowledge')
    .where('slug', '==', slug)
    .limit(1)
    .get();
  if (!snap.empty) {
    const d = snap.docs[0];
    return {
      id: d.id,
      ...d.data(),
      createdAt: toISOString(d.data().createdAt),
      updatedAt: toISOString(d.data().updatedAt),
    } as Knowledge;
  }
  return null;
}

export async function getKnowledgeById(id: string): Promise<Knowledge | null> {
  const snap = await adminDb.collection('knowledge').doc(id).get();
  if (!snap.exists) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: toISOString(snap.data()!.createdAt),
    updatedAt: toISOString(snap.data()!.updatedAt),
  } as Knowledge;
}

export async function createKnowledge(data: Partial<Knowledge>): Promise<Knowledge> {
  const id = data.id || `know-${Date.now()}`;
  const title = data.title || 'Untitled Knowledge';
  const slug = data.slug || slugify(title) + '-' + Math.floor(Math.random() * 1000);
  const status = data.status || KnowledgeStatus.PENDING;
  const confirmed = data.confirmed ?? status === KnowledgeStatus.CONFIRMED;
  const now = new Date().toISOString();

  const payload: any = {
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
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection('knowledge').doc(id).set(payload);
  return { id, ...payload };
}

export async function updateKnowledge(id: string, updates: Partial<Knowledge>): Promise<Knowledge | null> {
  // Resolve real doc ID (could be a slug)
  let docId = id;
  const existing = await getKnowledgeById(id);
  if (!existing) {
    const bySlug = await getKnowledgeBySlug(id);
    if (!bySlug) return null;
    docId = bySlug.id;
  }

  const current = (existing || (await getKnowledgeById(docId)))!;
  const newStatus = updates.status !== undefined ? updates.status : current.status;
  const newConfirmed = updates.confirmed !== undefined ? updates.confirmed : newStatus === KnowledgeStatus.CONFIRMED;

  const payload: any = {
    ...updates,
    status: newStatus,
    confirmed: newConfirmed,
    updatedAt: new Date().toISOString(),
  };

  await adminDb.collection('knowledge').doc(docId).update(payload);
  return getKnowledgeById(docId);
}

export async function confirmKnowledge(id: string, confirmed: boolean): Promise<Knowledge | null> {
  return updateKnowledge(id, {
    confirmed,
    status: confirmed ? KnowledgeStatus.CONFIRMED : KnowledgeStatus.REJECTED,
  });
}

export async function deleteKnowledge(id: string): Promise<boolean> {
  let docId = id;
  const existing = await getKnowledgeById(id);
  if (!existing) {
    const bySlug = await getKnowledgeBySlug(id);
    if (!bySlug) return false;
    docId = bySlug.id;
  }
  await adminDb.collection('knowledge').doc(docId).delete();
  return true;
}
