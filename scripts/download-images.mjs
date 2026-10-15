import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const root = process.cwd();
const publicAsset = path.join(root, 'public', 'asset');

const dirs = [
  path.join(publicAsset, 'activities'),
  path.join(publicAsset, 'products'),
  path.join(publicAsset, 'knowledge'),
  path.join(publicAsset, 'avatars'),
];

dirs.forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Download helper
function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`  ↪ Already exists: ${path.basename(dest)}`);
      return resolve(dest);
    }
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return reject(new Error(`Failed with status ${res.statusCode}: ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log(`  ✔ Saved: ${path.basename(dest)}`);
            resolve(dest);
          });
        });
      })
      .on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

async function run() {
  console.log('📦 Downloading & organizing local images...\n');

  // 1. Copy generated Minh Ngoc avatar
  const artifactAvatar = 'C:\\Users\\ADmin\\.gemini\\antigravity-ide\\brain\\20f1c3f6-fce9-42f4-99e9-a51b92f13a7b\\minh_ngoc_avatar_1792050507001.jpg';
  const destMinhNgoc = path.join(publicAsset, 'avatars', 'minh-ngoc.jpg');
  if (fs.existsSync(artifactAvatar)) {
    fs.copyFileSync(artifactAvatar, destMinhNgoc);
    console.log('  ✔ Installed Minh Ngoc avatar -> /asset/avatars/minh-ngoc.jpg');
  }

  // 2. Activities images
  const activityImages = [
    {
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      dest: path.join(publicAsset, 'activities', 'ftc-portfolio.jpg'),
      localPath: '/asset/activities/ftc-portfolio.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&q=80',
      dest: path.join(publicAsset, 'activities', 'cad-challenge.jpg'),
      localPath: '/asset/activities/cad-challenge.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      dest: path.join(publicAsset, 'activities', 'robot-kinematics.jpg'),
      localPath: '/asset/activities/robot-kinematics.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1612831819720-28dc994fa96d?w=800&q=80',
      dest: path.join(publicAsset, 'activities', '3d-printing.jpg'),
      localPath: '/asset/activities/3d-printing.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
      dest: path.join(publicAsset, 'activities', 'women-in-stem.jpg'),
      localPath: '/asset/activities/women-in-stem.jpg',
    },
  ];

  for (const item of activityImages) {
    try {
      await download(item.url, item.dest);
    } catch (e) {
      console.error(`  ❌ Failed downloading ${item.url}:`, e.message);
    }
  }

  // 3. Products images
  const productImages = [
    {
      url: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&q=80',
      dest: path.join(publicAsset, 'products', '3dof-arm.jpg'),
      localPath: '/asset/products/3dof-arm.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      dest: path.join(publicAsset, 'products', 'obstacle-bot.jpg'),
      localPath: '/asset/products/obstacle-bot.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      dest: path.join(publicAsset, 'products', 'solidworks-library.jpg'),
      localPath: '/asset/products/solidworks-library.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80',
      dest: path.join(publicAsset, 'products', 'drive-analysis.jpg'),
      localPath: '/asset/products/drive-analysis.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1504608524841-42584120d693?w=800&q=80',
      dest: path.join(publicAsset, 'products', 'weather-station.jpg'),
      localPath: '/asset/products/weather-station.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1612831819720-28dc994fa96d?w=800&q=80',
      dest: path.join(publicAsset, 'products', 'pen-plotter.jpg'),
      localPath: '/asset/products/pen-plotter.jpg',
    },
  ];

  for (const item of productImages) {
    try {
      await download(item.url, item.dest);
    } catch (e) {
      console.error(`  ❌ Failed downloading ${item.url}:`, e.message);
    }
  }

  // 4. Knowledge images
  const knowledgeImages = [
    {
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
      dest: path.join(publicAsset, 'knowledge', 'intro-to-amr.jpg'),
      localPath: '/asset/knowledge/intro-to-amr.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      dest: path.join(publicAsset, 'knowledge', 'fea-basics.jpg'),
      localPath: '/asset/knowledge/fea-basics.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80',
      dest: path.join(publicAsset, 'knowledge', 'pid-controller.jpg'),
      localPath: '/asset/knowledge/pid-controller.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      dest: path.join(publicAsset, 'knowledge', 'pcb-design.jpg'),
      localPath: '/asset/knowledge/pcb-design.jpg',
    },
    {
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      dest: path.join(publicAsset, 'avatars', 'contributor-priya.jpg'),
      localPath: '/asset/avatars/contributor-priya.jpg',
    },
  ];

  for (const item of knowledgeImages) {
    try {
      await download(item.url, item.dest);
    } catch (e) {
      console.error(`  ❌ Failed downloading ${item.url}:`, e.message);
    }
  }

  console.log('\n🔄 Updating seed JSON files to use local server paths...');

  // Update activities.json
  const actPath = path.join(root, 'data', 'seeds', 'activities.json');
  const activities = JSON.parse(fs.readFileSync(actPath, 'utf-8'));
  const actMap = {
    'act-001': '/asset/activities/ftc-portfolio.jpg',
    'act-002': '/asset/activities/cad-challenge.jpg',
    'act-003': '/asset/activities/robot-kinematics.jpg',
    'act-004': '/asset/activities/3d-printing.jpg',
    'act-005': '/asset/activities/women-in-stem.jpg',
  };
  activities.forEach((a) => {
    if (actMap[a.id]) a.image = actMap[a.id];
  });
  fs.writeFileSync(actPath, JSON.stringify(activities, null, 2));
  console.log('  ✅ Updated activities.json');

  // Update products.json
  const prodPath = path.join(root, 'data', 'seeds', 'products.json');
  const products = JSON.parse(fs.readFileSync(prodPath, 'utf-8'));
  const prodMap = {
    'prod-001': '/asset/products/3dof-arm.jpg',
    'prod-002': '/asset/products/obstacle-bot.jpg',
    'prod-003': '/asset/products/solidworks-library.jpg',
    'prod-004': '/asset/products/drive-analysis.jpg',
    'prod-005': '/asset/products/weather-station.jpg',
    'prod-006': '/asset/products/pen-plotter.jpg',
  };
  products.forEach((p) => {
    if (prodMap[p.id]) p.image = prodMap[p.id];
  });
  fs.writeFileSync(prodPath, JSON.stringify(products, null, 2));
  console.log('  ✅ Updated products.json');

  // Update knowledge.json
  const knowPath = path.join(root, 'data', 'seeds', 'knowledge.json');
  const knowledge = JSON.parse(fs.readFileSync(knowPath, 'utf-8'));
  const knowMap = {
    'know-1': '/asset/knowledge/intro-to-amr.jpg',
    'know-2': '/asset/knowledge/fea-basics.jpg',
    'know-3': '/asset/knowledge/pid-controller.jpg',
    'know-4': '/asset/knowledge/pcb-design.jpg',
  };
  knowledge.forEach((k) => {
    if (knowMap[k.id]) k.image = knowMap[k.id];
    if (k.authorId === 'user-1' || !k.authorImage || k.authorImage.includes('zadn.vn')) {
      k.authorImage = '/asset/avatars/minh-ngoc.jpg';
    } else if (k.authorId === 'user-2') {
      k.authorImage = '/asset/avatars/contributor-priya.jpg';
    }
  });
  fs.writeFileSync(knowPath, JSON.stringify(knowledge, null, 2));
  console.log('  ✅ Updated knowledge.json');

  // Update users.json
  const userPath = path.join(root, 'data', 'seeds', 'users.json');
  const users = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  users.forEach((u) => {
    if (u.id === 'user-1' || u.email === 'admin@mechgirl.com') {
      u.image = '/asset/avatars/minh-ngoc.jpg';
    }
  });
  fs.writeFileSync(userPath, JSON.stringify(users, null, 2));
  console.log('  ✅ Updated users.json');

  // Update about.json
  const aboutPath = path.join(root, 'data', 'seeds', 'about.json');
  const about = JSON.parse(fs.readFileSync(aboutPath, 'utf-8'));
  about.image = '/asset/avatars/minh-ngoc.jpg';
  about.photoUrl = '/asset/avatars/minh-ngoc.jpg';
  fs.writeFileSync(aboutPath, JSON.stringify(about, null, 2));
  console.log('  ✅ Updated about.json');

  console.log('\n🎉 All images saved locally to public/asset and seed files updated!');
}

run().catch(console.error);
