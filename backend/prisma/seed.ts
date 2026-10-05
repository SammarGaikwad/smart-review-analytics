import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Clean existing records (Optional reset)
  await prisma.auditLog.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.reviewKeyword.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.reviewTopic.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.sentimentResult.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cluster.deleteMany();

  // 2. Seed Roles (RBAC)
  console.log('Creating Roles...');
  const adminRole = await prisma.role.create({
    data: { name: 'Admin', description: 'Full system administration access' }
  });
  const analystRole = await prisma.role.create({
    data: { name: 'Analyst', description: 'Access to analytics, dashboards, and reports' }
  });
  const businessRole = await prisma.role.create({
    data: { name: 'BusinessUser', description: 'Access to reviews, products, and domain insights' }
  });
  const customerRole = await prisma.role.create({
    data: { name: 'Customer', description: 'Can submit and view customer reviews' }
  });

  // 3. Seed Users
  console.log('Creating System Users...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@analytics.com',
      passwordHash: defaultPasswordHash,
      fullName: 'System Administrator',
      userRoles: { create: { roleId: adminRole.id } }
    }
  });

  const analystUser = await prisma.user.create({
    data: {
      email: 'analyst@analytics.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Data Analyst User',
      userRoles: { create: { roleId: analystRole.id } }
    }
  });

  const businessUser = await prisma.user.create({
    data: {
      email: 'business@analytics.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Business Manager',
      userRoles: { create: { roleId: businessRole.id } }
    }
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@analytics.com',
      passwordHash: defaultPasswordHash,
      fullName: 'John Doe Customer',
      userRoles: { create: { roleId: customerRole.id } }
    }
  });

  // 4. Seed Domains (Hotels, Restaurants, Movies, Electronics, E-commerce)
  console.log('Creating Domains & Products...');
  const hotelsDomain = await prisma.domain.create({
    data: {
      name: 'Hotels',
      code: 'hotels',
      description: 'Hospitality and hotel stay review analytics',
      products: {
        create: [
          { name: 'Grand Horizon Hotel', category: 'Luxury Hotel', description: '5-Star downtown hotel' },
          { name: 'Ocean View Resort', category: 'Resort', description: 'Beachfront resort & spa' }
        ]
      }
    },
    include: { products: true }
  });

  const restaurantsDomain = await prisma.domain.create({
    data: {
      name: 'Restaurants',
      code: 'restaurants',
      description: 'Dining, food quality, and restaurant service analytics',
      products: {
        create: [
          { name: 'Gourmet Bistro', category: 'Fine Dining', description: 'French bistro & steakhouse' },
          { name: 'Pasta & Pizza Co.', category: 'Casual Dining', description: 'Italian restaurant chain' }
        ]
      }
    },
    include: { products: true }
  });

  const moviesDomain = await prisma.domain.create({
    data: {
      name: 'Movies',
      code: 'movies',
      description: 'Cinema, film reviews, and audience sentiment',
      products: {
        create: [
          { name: 'Interstellar Odyssey', category: 'Sci-Fi Film', description: 'Blockbuster sci-fi movie' },
          { name: 'The Silent Mystery', category: 'Thriller', description: 'Mystery thriller film' }
        ]
      }
    },
    include: { products: true }
  });

  const electronicsDomain = await prisma.domain.create({
    data: {
      name: 'Electronics',
      code: 'electronics',
      description: 'Gadgets, hardware, battery life, and specs review',
      products: {
        create: [
          { name: 'SoundMax Pro Wireless Headphones', category: 'Audio', description: 'Noise cancelling headphones' },
          { name: 'UltraTab 12 Tablet', category: 'Tablets', description: '12-inch OLED flagship tablet' }
        ]
      }
    },
    include: { products: true }
  });

  const ecommerceDomain = await prisma.domain.create({
    data: {
      name: 'E-commerce',
      code: 'ecommerce',
      description: 'Online retail, shipping, delivery, and item quality analytics',
      products: {
        create: [
          { name: 'Ergonomic Office Chair', category: 'Furniture', description: 'High back lumbar support chair' },
          { name: 'Smart Fitness Band V4', category: 'Wearables', description: 'Waterproof health tracker' }
        ]
      }
    },
    include: { products: true }
  });

  // 5. Seed Topics
  console.log('Creating Pre-defined Topics...');
  const topicQuality = await prisma.topic.create({ data: { name: 'Quality', description: 'Overall product or build quality' } });
  const topicService = await prisma.topic.create({ data: { name: 'Service', description: 'Customer support or hospitality service' } });
  const topicPrice = await prisma.topic.create({ data: { name: 'Price', description: 'Pricing, value for money, cost' } });
  const topicDelivery = await prisma.topic.create({ data: { name: 'Delivery', description: 'Shipping speed and order delivery' } });
  const topicBattery = await prisma.topic.create({ data: { name: 'Battery', description: 'Battery performance and charging' } });
  const topicCleanliness = await prisma.topic.create({ data: { name: 'Cleanliness', description: 'Hygiene and room/table cleanliness' } });

  // 6. Seed Sample Reviews with Ground-truth Sentiment & Topics
  console.log('Creating Sample Dataset Reviews...');

  const review1 = await prisma.review.create({
    data: {
      customerId: customerUser.id,
      domainId: hotelsDomain.id,
      productId: hotelsDomain.products[0].id,
      rating: 5.0,
      reviewText: 'Outstanding room cleanliness and exceptional service from the hotel staff! Highly recommended.',
      source: 'manual',
      sentimentResult: {
        create: {
          sentimentLabel: 'Positive',
          sentimentScore: 0.92,
          positiveProb: 0.94,
          neutralProb: 0.04,
          negativeProb: 0.02
        }
      },
      reviewTopics: {
        create: [
          { topicId: topicCleanliness.id, probability: 0.85 },
          { topicId: topicService.id, probability: 0.90 }
        ]
      }
    }
  });

  const review2 = await prisma.review.create({
    data: {
      customerId: customerUser.id,
      domainId: electronicsDomain.id,
      productId: electronicsDomain.products[0].id,
      rating: 2.0,
      reviewText: 'Excellent audio quality but the battery drains very quickly after only two hours of use.',
      source: 'manual',
      sentimentResult: {
        create: {
          sentimentLabel: 'Negative',
          sentimentScore: -0.45,
          positiveProb: 0.25,
          neutralProb: 0.15,
          negativeProb: 0.60
        }
      },
      reviewTopics: {
        create: [
          { topicId: topicBattery.id, probability: 0.95 },
          { topicId: topicQuality.id, probability: 0.60 }
        ]
      }
    }
  });

  const review3 = await prisma.review.create({
    data: {
      customerId: customerUser.id,
      domainId: ecommerceDomain.id,
      productId: ecommerceDomain.products[0].id,
      rating: 4.0,
      reviewText: 'Great ergonomic chair for working from home. Delivery was fast and assembly was easy.',
      source: 'csv_import',
      sentimentResult: {
        create: {
          sentimentLabel: 'Positive',
          sentimentScore: 0.82,
          positiveProb: 0.88,
          neutralProb: 0.10,
          negativeProb: 0.02
        }
      },
      reviewTopics: {
        create: [
          { topicId: topicDelivery.id, probability: 0.88 },
          { topicId: topicQuality.id, probability: 0.75 }
        ]
      }
    }
  });

  // 7. Seed Initial Clusters
  console.log('Creating Base Clusters...');
  await prisma.cluster.createMany({
    data: [
      { clusterNumber: 1, name: 'Quality & Durability', description: 'Reviews focused on build quality, durability, and craftsmanship', reviewCount: 15 },
      { clusterNumber: 2, name: 'Pricing & Value', description: 'Reviews evaluating price point and value for money', reviewCount: 12 },
      { clusterNumber: 3, name: 'Delivery & Logistics', description: 'Reviews regarding shipping speed and packaging condition', reviewCount: 8 },
      { clusterNumber: 4, name: 'Service & Hospitality', description: 'Reviews discussing customer support, staff behavior, and service', reviewCount: 20 }
    ]
  });

  // 8. Seed Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'SYSTEM_SEED_INITIALIZED',
      resource: 'Database',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS'
    }
  });

  console.log('✅ Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
