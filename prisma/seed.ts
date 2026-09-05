import { PrismaClient, Prisma } from './generated/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Role } from './generated/enums';
import fs from 'fs';
import path from 'path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});


function readSeed<T>(filename: string): T | null {
  try {
    const p = path.join(process.cwd(), 'data', 'seeds', filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    console.warn(`Could not read seed file ${filename}`, e);
  }
  return null;
}

async function main() {
  console.log(`Start seeding MechGirl STEM website database...`);

  // Seed Users
  const users = readSeed<any[]>('users.json') || [];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        tagline: u.tagline,
        bio: u.bio,
        image: u.image,
        role: u.role || Role.USER,
        timeline: u.timeline || [],
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        tagline: u.tagline,
        bio: u.bio,
        image: u.image,
        role: u.role || Role.USER,
        timeline: u.timeline || [],
      },
    });
  }
  console.log(`Seeded ${users.length} users.`);

  // Seed Activities
  const activities = readSeed<any[]>('activities.json') || [];
  for (const act of activities) {
    await prisma.activity.upsert({
      where: { slug: act.slug },
      update: {
        title: act.title,
        type: act.type,
        date: act.date,
        time: act.time,
        location: act.location,
        description: act.description,
        content: act.content,
        image: act.image,
        seats: act.seats,
        registered: act.registered,
        status: act.status,
      },
      create: {
        id: act.id,
        title: act.title,
        slug: act.slug,
        type: act.type,
        date: act.date,
        time: act.time,
        location: act.location,
        description: act.description,
        content: act.content,
        image: act.image,
        seats: act.seats,
        registered: act.registered,
        status: act.status,
      },
    });
  }
  console.log(`Seeded ${activities.length} activities.`);

  // Seed Products
  const products = readSeed<any[]>('products.json') || [];
  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        title: prod.title,
        category: prod.category,
        description: prod.description,
        content: prod.content,
        image: prod.image,
        github: prod.github,
        demo: prod.demo,
        tags: prod.tags || [],
        featured: Boolean(prod.featured),
      },
      create: {
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        category: prod.category,
        description: prod.description,
        content: prod.content,
        image: prod.image,
        github: prod.github,
        demo: prod.demo,
        tags: prod.tags || [],
        featured: Boolean(prod.featured),
      },
    });
  }
  console.log(`Seeded ${products.length} products/projects.`);

  // Seed Carousel Slides
  const carousel = readSeed<any[]>('carousel.json') || [];
  for (const slide of carousel) {
    await prisma.carouselSlide.upsert({
      where: { id: slide.id },
      update: {
        src: slide.src,
        alt: slide.alt,
        order: slide.order,
      },
      create: {
        id: slide.id,
        src: slide.src,
        alt: slide.alt,
        order: slide.order,
        active: true,
      },
    });
  }
  console.log(`Seeded ${carousel.length} carousel slides.`);

  // Seed Contact Info
  const contact = readSeed<any>('contact.json');
  if (contact) {
    let contactRecord = await prisma.contactInfo.findFirst();
    if (!contactRecord) {
      await prisma.contactInfo.create({
        data: {
          name: contact.name || 'MechGirl',
          tagline: contact.tagline || '',
          email: contact.email || 'contact@mechgirl.com',
          phone: contact.phone || '',
          address: contact.address || '',
          about: contact.about || '',
          facebook: contact.socials?.facebook || '',
          youtube: contact.socials?.youtube || '',
          github: contact.socials?.github || '',
          instagram: contact.socials?.instagram || '',
        },
      });
    }
    console.log(`Seeded contact info.`);
  }

  console.log(`Seeding finished successfully!`);
}

main()
  .catch((e) => {
    console.error('Seeding encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
