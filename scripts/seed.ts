// Seed script — populates the Bishoftu tourism DB with realistic initial data.
// Run with: bun run scripts/seed.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('Clearing existing data…')
  await db.newsPost.deleteMany()
  await db.attraction.deleteMany()
  await db.hotel.deleteMany()
  await db.business.deleteMany()

  console.log('Seeding hotels…')
  const hotels = [
    {
      name: 'Kuriftu Resort & Spa Bishoftu',
      description: 'Premier lakeside resort on the shore of Lake Kuriftu with private beach, infinity pool, spa, and water sports. A flagship destination for lakeside luxury in the Rift Valley.',
      starRating: 5, type: 'resort', subCity: 'Kuriftu',
      address: 'Lake Kuriftu, Bishoftu', pricePerNight: 18500,
      totalRooms: 102, occupiedRooms: 71, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0101', email: 'reservations@kurifturesort.com',
    },
    {
      name: 'Babogaya Lake View Resort',
      description: 'Clifftop resort overlooking the volcanic crater Lake Babiogaya. Panoramic lake views, terrace dining, and a tranquil garden setting minutes from the city center.',
      starRating: 5, type: 'resort', subCity: 'Cheleleka',
      address: 'Babiogaya Crater Rim, Bishoftu', pricePerNight: 12000,
      totalRooms: 48, occupiedRooms: 31, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0202', email: 'stay@babogayaresort.com',
    },
    {
      name: 'Bishoftu Resort Lodge',
      description: 'Established family-friendly resort with lush gardens, hot-spring-fed pools, and a spa. Walking distance to Lake Hora and the Irecha festival grounds.',
      starRating: 4, type: 'resort', subCity: 'Tullu Dimtu',
      address: 'Near Lake Hora, Bishoftu', pricePerNight: 8500,
      totalRooms: 64, occupiedRooms: 38, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0303', email: 'info@bishofturesort.com',
    },
    {
      name: 'Africa Junction Resort',
      description: 'Boutique resort tucked among acacia trees with traditional Oromo-tufted bungalows, an outdoor pool, and farm-to-table restaurant.',
      starRating: 4, type: 'resort', subCity: 'Cheleleka',
      address: 'Cheleleka Road, Bishoftu', pricePerNight: 7500,
      totalRooms: 36, occupiedRooms: 22, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a850609994b?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0404', email: 'booking@africajunction.com',
    },
    {
      name: 'The Lake Resort Bishoftu',
      description: 'Modern lakefront resort with private pier, kayak rentals, and rooftop restaurant serving fresh Rift Valley cuisine.',
      starRating: 4, type: 'resort', subCity: 'Kuriftu',
      address: 'Lake Kuriftu North Shore, Bishoftu', pricePerNight: 9800,
      totalRooms: 52, occupiedRooms: 27, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0505', email: 'hello@thelakeresort.com',
    },
    {
      name: 'Getfam Hotel Bishoftu',
      description: 'Central business hotel with conference facilities, ideal for corporate travelers visiting Bishoftu industrial parks.',
      starRating: 4, type: 'hotel', subCity: 'Bole Bishoftu',
      address: 'Bole Road, Bishoftu', pricePerNight: 4500,
      totalRooms: 78, occupiedRooms: 24, featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0606', email: 'reception@getfambishoftu.com',
    },
    {
      name: 'Splash Hotel & Lodge',
      description: 'Affordable lodge near Lake Hora with cozy rooms, breakfast terrace, and tour desk for crater-lake excursions.',
      starRating: 3, type: 'hotel', subCity: 'Tullu Dimtu',
      address: 'Lake Hora Road, Bishoftu', pricePerNight: 2800,
      totalRooms: 42, occupiedRooms: 9, featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0707', email: 'stay@splashhotel.com',
    },
    {
      name: 'Bekele Molla Hotel',
      description: 'Long-established budget hotel in central Bishoftu, popular with transit travelers and tour groups.',
      starRating: 3, type: 'hotel', subCity: 'Kebele 03',
      address: 'Main Street, Bishoftu', pricePerNight: 1800,
      totalRooms: 56, occupiedRooms: 12, featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1445966275305-9806357a1758?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0808', email: 'info@bekelemolla.com',
    },
    {
      name: 'Lake Hora Lodge',
      description: 'Rustic eco-lodge perched above Lake Hora with wood cabins, traditional Oromo cuisine, and guided crater hikes.',
      starRating: 3, type: 'lodge', subCity: 'Tullu Dimtu',
      address: 'Lake Hora Rim, Bishoftu', pricePerNight: 3500,
      totalRooms: 18, occupiedRooms: 7, featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1542718617-a374918a2231?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 0909', email: 'eco@lakehoralodge.com',
    },
    {
      name: 'Crater View Motel',
      description: 'Convenient roadside motel catering to weekend visitors, with simple rooms and a small café.',
      starRating: 2, type: 'motel', subCity: 'Kebele 05',
      address: 'Addis–Adama Expressway Junction, Bishoftu', pricePerNight: 1200,
      totalRooms: 24, occupiedRooms: 4, featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?auto=format&fit=crop&w=1200&q=80',
      phone: '+251 11 433 1010', email: 'motel@craterview.com',
    },
  ]
  for (const h of hotels) {
    await db.hotel.create({ data: h })
  }

  console.log('Seeding attractions…')
  const attractions = [
    {
      name: 'Lake Bishoftu',
      description: 'The deepest crater lake in the Bishoftu chain — a sacred, deep-green caldera surrounded by sheer volcanic cliffs. Popular for photography and quiet contemplation.',
      category: 'lake', subCity: 'Kebele 01', featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Lake Hora',
      description: 'Site of the annual Irecha thanksgiving festival — the Oromo people’s most important cultural celebration, held each September on the lake’s grassy shore.',
      category: 'lake', subCity: 'Tullu Dimtu', featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Lake Babiogaya',
      description: 'Twin-crater lake popular for bird-watching and lakeside relaxation, with resorts perched on the crater rim.',
      category: 'lake', subCity: 'Cheleleka', featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Lake Kuriftu',
      description: 'Recreational lake with beach clubs, kayaking, and the famous Kuriftu Resort & Spa. Best for families and water-sports enthusiasts.',
      category: 'lake', subCity: 'Kuriftu', featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Cheleleka Wetland',
      description: 'Seasonal wetland and important bird area — a Ramsar-recognized habitat hosting flamingos, pelicans, and migratory waterfowl.',
      category: 'wetland', subCity: 'Cheleleka', featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Sodre Hot Springs',
      description: 'Natural geothermal springs on the outskirts of Bishoftu, valued for relaxation and traditional wellness rituals.',
      category: 'hot_spring', subCity: 'Bole Bishoftu', featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Ethiopian Air Force Museum',
      description: 'Outdoor and indoor display of historic aircraft, engines, and aviation artifacts chronicling Ethiopia’s air force heritage, headquartered in Bishoftu.',
      category: 'museum', subCity: 'Air Force Base', featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'St. Gabriel Church',
      description: 'Historic Ethiopian Orthodox church in the heart of Bishoftu, known for its distinctive architecture and annual Timkat procession.',
      category: 'church', subCity: 'Kebele 03', featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1545569310-f8c1c9d6e7b6?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Bishoftu Crater Rim Trail',
      description: 'Hiking trail circling the main crater lakes — a half-day trek offering dramatic cliffside panoramas of the Rift Valley lakes.',
      category: 'viewpoint', subCity: 'Kebele 01', featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    },
  ]
  for (const a of attractions) {
    await db.attraction.create({ data: a })
  }

  console.log('Seeding news…')
  const news = [
    {
      title: 'Irecha Festival 2026 — Lake Hora',
      excerpt: 'Bishoftu prepares to welcome over 100,000 visitors for this year’s Irecha thanksgiving celebration on the shores of Lake Hora.',
      hotelName: 'Bishoftu Tourism Office',
      publishedAt: new Date('2026-10-12'),
    },
    {
      title: 'New Spa Wing Now Open',
      excerpt: 'Kuriftu Resort & Spa unveils a new lakeside spa wing featuring Rift Valley botanical treatments.',
      hotelName: 'Kuriftu Resort & Spa Bishoftu',
      publishedAt: new Date('2026-09-28'),
    },
    {
      title: 'Cheleleka Wetland Bird Count',
      excerpt: 'Annual bird-monitoring survey recorded 142 species this season — a record for the wetland.',
      hotelName: 'Bishoftu Tourism Office',
      publishedAt: new Date('2026-09-05'),
    },
    {
      title: 'Family Lakeside Getaway Package',
      excerpt: 'Bishoftu Resort Lodge launches an all-inclusive weekend package for families visiting the crater lakes.',
      hotelName: 'Bishoftu Resort Lodge',
      publishedAt: new Date('2026-08-19'),
    },
  ]
  for (const n of news) {
    await db.newsPost.create({ data: n })
  }

  console.log('Seeding businesses…')
  const businesses = [
    { name: 'Bishoftu Boat Club', type: 'tour_operator', subCity: 'Kuriftu' },
    { name: 'Rift Valley Coffee House', type: 'restaurant', subCity: 'Kebele 03' },
    { name: 'Babiogaya Birding Tours', type: 'tour_operator', subCity: 'Cheleleka' },
    { name: 'Lake Hora Cultural Guides', type: 'tour_operator', subCity: 'Tullu Dimtu' },
    { name: 'Sodre Springs Wellness', type: 'spa', subCity: 'Bole Bishoftu' },
  ]
  for (const b of businesses) {
    await db.business.create({ data: b })
  }

  const counts = {
    hotels: await db.hotel.count(),
    attractions: await db.attraction.count(),
    news: await db.newsPost.count(),
    businesses: await db.business.count(),
  }
  console.log('Seeding complete:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
