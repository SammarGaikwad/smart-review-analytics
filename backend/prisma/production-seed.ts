import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  ['Hotels','Mountain Pearl Retreat','Boutique Hotel','Scenic mountain retreat with premium rooms'],
  ['Hotels','City Central Suites','Business Hotel','Modern suites for business travellers'],
  ['Restaurants','Spice Route Kitchen','Indian Cuisine','Modern Indian restaurant'],
  ['Restaurants','Harbor Coffee House','Cafe','Specialty coffee and all-day breakfast cafe'],
  ['Movies','City Lights Again','Drama','Character-driven urban drama'],
  ['Movies','Guardians of Tomorrow','Action','High-energy futuristic action film'],
  ['Electronics','VisionX 4K Smart TV','Television','55-inch 4K smart television'],
  ['Electronics','PowerCore X100 Laptop','Laptop','Performance laptop for work and productivity'],
  ['E-commerce','AirFlow Portable Fan','Home Appliances','Rechargeable compact cooling fan'],
  ['E-commerce','Urban Travel Backpack','Bags','Water-resistant everyday travel backpack']
] as const;

const reviews = [
  ['Grand Horizon Hotel',5,'Outstanding room cleanliness and exceptional service from the hotel staff! Highly recommended.','manual','2026-01-08'],
  ['Grand Horizon Hotel',4.5,'Beautiful rooms, quick check-in and excellent breakfast. The price is slightly high but the stay was worth it.','web','2026-02-14'],
  ['Ocean View Resort',5,'Fantastic beachfront location with clean rooms and very friendly staff. The resort exceeded expectations.','web','2026-01-19'],
  ['Ocean View Resort',3,'The view is excellent, but room service was slow and the restaurant prices were expensive.','manual','2026-03-03'],
  ['City Central Suites',4,'Convenient location and spacious room. Check-in was smooth and the staff were helpful.','web','2026-02-02'],
  ['City Central Suites',2.5,'The room looked dated and cleanliness could be improved. The location is convenient though.','manual','2026-03-18'],
  ['Mountain Pearl Retreat',5,'Peaceful location, spotless rooms and excellent hospitality. Perfect for a weekend getaway.','web','2026-02-26'],
  ['Mountain Pearl Retreat',3.5,'Great views and comfortable rooms, but the stay felt expensive compared with nearby options.','csv_import','2026-03-25'],
  ['Gourmet Bistro',5,'Excellent food quality and attentive service. Every dish was fresh and beautifully presented.','web','2026-01-12'],
  ['Gourmet Bistro',3,'The food was good, but portions were small for the price and the waiting time was longer than expected.','manual','2026-02-21'],
  ['Pasta & Pizza Co.',4.5,'Tasty pasta, fresh ingredients and fast service. Good value for a casual dinner.','web','2026-01-27'],
  ['Pasta & Pizza Co.',2,'The pizza arrived cold and delivery took much longer than promised. Disappointing experience.','csv_import','2026-03-07'],
  ['Spice Route Kitchen',5,'Amazing Indian flavours and very professional staff. The food was fresh and served quickly.','web','2026-02-09'],
  ['Spice Route Kitchen',3.5,'Good food overall, although the prices are a little high and the restaurant was crowded.','manual','2026-03-15'],
  ['Harbor Coffee House',4.5,'Great coffee, clean seating area and friendly service. A comfortable place to work for a few hours.','web','2026-01-31'],
  ['Harbor Coffee House',2.5,'Coffee was average and the order took too long despite the cafe not being very busy.','manual','2026-03-29'],
  ['Interstellar Odyssey',5,'Amazing visuals, powerful soundtrack and a compelling story. One of the best sci-fi experiences this year.','web','2026-01-06'],
  ['Interstellar Odyssey',4,'Strong performances and impressive visuals, although the second half moves a little slowly.','manual','2026-02-17'],
  ['The Silent Mystery',4.5,'Excellent suspense with a clever ending. The pacing kept me interested throughout.','web','2026-01-22'],
  ['The Silent Mystery',2.5,'The opening was promising, but the story became predictable and the ending felt rushed.','csv_import','2026-03-11'],
  ['City Lights Again',4,'Emotional story with realistic characters and strong acting. A thoughtful drama.','web','2026-02-05'],
  ['City Lights Again',3,'Good performances, but the pacing is slow and some scenes feel unnecessary.','manual','2026-03-20'],
  ['Guardians of Tomorrow',5,'Fantastic action sequences and great visual effects. Very entertaining from start to finish.','web','2026-02-12'],
  ['Guardians of Tomorrow',3.5,'Fun action movie with impressive effects, but the plot is fairly predictable.','csv_import','2026-03-30'],
  ['SoundMax Pro Wireless Headphones',2,'Excellent audio quality but the battery drains very quickly after only two hours of use.','manual','2026-01-14'],
  ['SoundMax Pro Wireless Headphones',4,'Very good sound and comfortable ear cups. Noise cancellation works well, although charging could be faster.','web','2026-02-28'],
  ['UltraTab 12 Tablet',5,'Bright OLED display, smooth performance and excellent battery life. Great tablet for productivity.','web','2026-01-25'],
  ['UltraTab 12 Tablet',3,'The screen is excellent, but the device gets warm during heavy use and the price is high.','manual','2026-03-05'],
  ['VisionX 4K Smart TV',4.5,'Sharp picture quality and an easy-to-use interface. Setup was quick and the speakers are decent.','web','2026-02-07'],
  ['VisionX 4K Smart TV',2.5,'Picture is good, but the smart interface is slow and the remote feels cheap.','csv_import','2026-03-22'],
  ['PowerCore X100 Laptop',4.5,'Fast performance, solid keyboard and excellent build quality. Battery easily lasts through a workday.','web','2026-01-30'],
  ['PowerCore X100 Laptop',3,'Performance is strong, but the laptop is heavier than expected and the price is premium.','manual','2026-03-27'],
  ['Ergonomic Office Chair',4,'Great ergonomic chair for working from home. Delivery was fast and assembly was easy.','csv_import','2026-01-18'],
  ['Ergonomic Office Chair',5,'Very comfortable for long working sessions. Excellent lumbar support and the packaging was secure.','web','2026-02-23'],
  ['Smart Fitness Band V4',4.5,'Accurate activity tracking, comfortable strap and impressive battery life for the price.','web','2026-01-10'],
  ['Smart Fitness Band V4',2.5,'The tracker works, but syncing sometimes fails and delivery arrived two days late.','manual','2026-03-13'],
  ['AirFlow Portable Fan',4,'Compact, quiet and useful during travel. Battery lasts well and the product arrived on time.','web','2026-02-01'],
  ['AirFlow Portable Fan',3,'Cooling is acceptable, but the fan is smaller than expected and the build feels average.','csv_import','2026-03-17'],
  ['Urban Travel Backpack',5,'Excellent material quality, plenty of compartments and very comfortable for daily commuting.','web','2026-02-16'],
  ['Urban Travel Backpack',3.5,'Looks good and has useful pockets, but the zippers could be stronger for the price.','manual','2026-03-31']
] as const;

async function main() {
  console.log('Adding production products and reviews...');

  const customer = await prisma.user.findUnique({ where: { email: 'customer@analytics.com' } });
  if (!customer) throw new Error('customer@analytics.com not found. Run the normal seed first.');

  const domains = await prisma.domain.findMany();
  const domainMap = new Map(domains.map(d => [d.name, d.id]));

  for (const [domainName, name, category, description] of data) {
    const domainId = domainMap.get(domainName);
    if (!domainId) throw new Error(`Domain not found: ${domainName}`);
    await prisma.product.upsert({
      where: { id: '00000000-0000-0000-0000-000000000000' },
      update: {},
      create: { domainId, name, category, description }
    });
  }

  const products = await prisma.product.findMany();
  const productMap = new Map(products.map(p => [p.name, p]));

  for (const [productName, rating, reviewText, source, date] of reviews) {
    const product = productMap.get(productName);
    if (!product) throw new Error(`Product not found: ${productName}`);
    const exists = await prisma.review.findFirst({ where: { productId: product.id, reviewText } });
    if (exists) continue;

    let sentimentLabel = 'Neutral';
    let sentimentScore = 0.05;
    if (rating >= 4) {
      sentimentLabel = 'Positive';
      sentimentScore = Math.min(0.95, 0.55 + (rating - 4) * 0.25);
    } else if (rating <= 2.5) {
      sentimentLabel = 'Negative';
      sentimentScore = Math.max(-0.9, -0.45 - (2.5 - rating) * 0.25);
    }

    await prisma.review.create({
      data: {
        customerId: customer.id,
        domainId: product.domainId,
        productId: product.id,
        rating,
        reviewText,
        source,
        reviewDate: new Date(date + 'T10:00:00.000Z'),
        sentimentResult: {
          create: {
            sentimentLabel,
            sentimentScore,
            positiveProb: sentimentLabel === 'Positive' ? 0.9 : 0.2,
            neutralProb: sentimentLabel === 'Neutral' ? 0.6 : 0.1,
            negativeProb: sentimentLabel === 'Negative' ? 0.7 : 0.1
          }
        }
      }
    });
  }

  console.log(`✅ Products in DB: ${await prisma.product.count()}`);
  console.log(`✅ Reviews in DB: ${await prisma.review.count()}`);
}

main().catch(e => {
  console.error('❌ Production data error:', e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
