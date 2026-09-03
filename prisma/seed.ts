import { PrismaClient, Prisma } from './generated/client';
import { PrismaPg } from "@prisma/adapter-pg";
import fs from 'fs';
import path from 'path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Admin User',
    email: 'admin@mechgirl.com',
    posts: {
      create: [
        {
          title: 'Welcome to MechGirl STEM Platform',
          content: 'An open engineering platform designed to inspire and empower women in mechanical engineering.',
          published: true,
        },
      ],
    },
  },
];

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

  // Seed Users & Initial Post
  for (const u of userData) {
    await prisma.user.upsert({
      where: { email: u.email! },
      update: {},
      create: u,
    });
  }

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

  // Seed About Profile & Timelines
  const about = readSeed<any>('about.json');
  if (about) {
    let profile = await prisma.aboutProfile.findFirst();
    if (!profile) {
      profile = await prisma.aboutProfile.create({
        data: {
          name: about.name || 'MINH NGOC',
          tagline: about.tagline || 'Mechanical Engineering Student',
          bio: about.bio || '',
          photoUrl: about.photoUrl || '',
        },
      });
    }

    if (about.timeline && Array.isArray(about.timeline)) {
      for (const t of about.timeline) {
        await prisma.timelineItem.upsert({
          where: { id: t.id },
          update: {
            startYear: t.startYear,
            endYear: t.endYear,
            title: t.title,
            institution: t.institution,
            description: t.description,
          },
          create: {
            id: t.id,
            profileId: profile.id,
            startYear: t.startYear,
            endYear: t.endYear,
            title: t.title,
            institution: t.institution,
            description: t.description,
          },
        });
      }
    }
    console.log(`Seeded about profile and timeline.`);
  }

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
