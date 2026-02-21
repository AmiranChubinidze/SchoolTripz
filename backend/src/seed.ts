import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schooltripz';

// Inline schemas for seed script
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  school: String, phone: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TripSchema = new mongoose.Schema({
  title: String, slug: String, description: String, destination: String,
  country: String, durationDays: Number, images: [String], highlights: [String],
  includedItems: [String], excludedItems: [String], priceConfig: Object,
  availableTransport: [String], availableExtras: Object,
  minStudents: Number, maxStudents: Number,
  isActive: { type: Boolean, default: true }, isFeatured: Boolean,
  category: String, tags: [String],
}, { timestamps: true });

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const User = mongoose.model('User', UserSchema);
  const Trip = mongoose.model('Trip', TripSchema);

  // Clear existing
  await User.deleteMany({});
  await Trip.deleteMany({});
  console.log('Cleared existing data.');

  // Create users
  const adminPw = await bcrypt.hash('Admin123!', 12);
  const clientPw = await bcrypt.hash('Client123!', 12);

  const [admin, client1, client2] = await User.insertMany([
    { name: 'Platform Admin', email: 'admin@schooltripz.com', password: adminPw, role: 'admin', isActive: true },
    { name: 'Sarah Johnson', email: 'sarah@greenviewschool.com', password: clientPw, role: 'client', school: 'Greenview High School', phone: '+44 7700 900001', isActive: true },
    { name: 'Mark Thompson', email: 'mark@stpeterscollege.edu', password: clientPw, role: 'client', school: "St Peter's College", phone: '+44 7700 900002', isActive: true },
  ]);

  console.log('Users created.');

  // Create trips
  const trips = await Trip.insertMany([
    {
      title: 'Discover Paris & Versailles',
      slug: 'discover-paris-versailles',
      description: "An unforgettable 5-day educational journey through the City of Light. Students explore the Louvre, climb the Eiffel Tower, visit the Palace of Versailles, and experience authentic French culture. Perfect for history, art, and language students.",
      destination: 'Paris',
      country: 'France',
      durationDays: 5,
      images: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      ],
      highlights: ['Eiffel Tower visit', 'Louvre Museum guided tour', 'Palace of Versailles', 'Seine River cruise', 'French cooking workshop'],
      includedItems: ['Return coach travel', 'Hotel accommodation (4 nights)', 'Daily breakfast', 'Entry to all attractions', 'Licensed tour guide'],
      excludedItems: ['Personal spending money', 'Travel insurance', 'Additional meals'],
      priceConfig: {
        basePerStudent: 85,
        basePerAdult: 110,
        mealPerPersonPerDay: 18,
        transportSurcharge: { bus: 0, train: 40, flight: 120, ferry: 25 },
        extras: { 'Museum Pass': 28, 'Cooking Workshop': 45, 'Seine Cruise Upgrade': 22 },
      },
      availableTransport: ['bus', 'train', 'flight'],
      availableExtras: { 'Museum Pass': 28, 'Cooking Workshop': 45, 'Seine Cruise Upgrade': 22 },
      minStudents: 15,
      maxStudents: 50,
      isActive: true,
      isFeatured: true,
      category: 'Cultural',
      tags: ['Europe', 'Art', 'History', 'Language', 'France'],
    },
    {
      title: 'Rome: Ancient Wonders',
      slug: 'rome-ancient-wonders',
      description: "Step back in time on this 6-day Roman adventure. From the Colosseum to Vatican City, students immerse themselves in 2,000 years of history, art, and civilization. Ideal for classics, history, and RE students.",
      destination: 'Rome',
      country: 'Italy',
      durationDays: 6,
      images: [
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800',
      ],
      highlights: ['Colosseum & Roman Forum', 'Vatican Museums & Sistine Chapel', 'St. Peter\'s Basilica', 'Trevi Fountain', 'Pompeii day trip'],
      includedItems: ['Return flights', 'Centrally located hotel', 'Daily breakfast & dinner', 'All entry tickets', 'Expert guides'],
      excludedItems: ['Lunch', 'Personal expenses', 'Travel insurance'],
      priceConfig: {
        basePerStudent: 110,
        basePerAdult: 140,
        mealPerPersonPerDay: 22,
        transportSurcharge: { bus: 60, train: 20, flight: 0, ferry: 80 },
        extras: { 'Pompeii Day Trip': 55, 'Vatican Skip-the-Line': 35, 'Gladiator School': 40 },
      },
      availableTransport: ['bus', 'train', 'flight'],
      availableExtras: { 'Pompeii Day Trip': 55, 'Vatican Skip-the-Line': 35, 'Gladiator School': 40 },
      minStudents: 15,
      maxStudents: 45,
      isActive: true,
      isFeatured: true,
      category: 'Historical',
      tags: ['Europe', 'History', 'Classics', 'Art', 'Italy'],
    },
    {
      title: 'Barcelona: Art & Architecture',
      slug: 'barcelona-art-architecture',
      description: "A 4-day creative odyssey through Gaudí's masterpieces and Barcelona's vibrant culture. Students visit Sagrada Família, Park Güell, and the Gothic Quarter, exploring modernism and Catalan identity.",
      destination: 'Barcelona',
      country: 'Spain',
      durationDays: 4,
      images: [
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      ],
      highlights: ['Sagrada Família', 'Park Güell', 'Picasso Museum', 'Gothic Quarter walk', 'Camp Nou stadium'],
      includedItems: ['Return flights', 'City-centre hotel', 'Daily breakfast', 'City transport card', 'Guided tours'],
      excludedItems: ['Lunches & dinners', 'Personal spending', 'Insurance'],
      priceConfig: {
        basePerStudent: 95,
        basePerAdult: 120,
        mealPerPersonPerDay: 20,
        transportSurcharge: { bus: 50, train: 30, flight: 0, ferry: 40 },
        extras: { 'Picasso Museum': 18, 'Camp Nou Tour': 32, 'Tapas Workshop': 38 },
      },
      availableTransport: ['bus', 'flight'],
      availableExtras: { 'Picasso Museum': 18, 'Camp Nou Tour': 32, 'Tapas Workshop': 38 },
      minStudents: 12,
      maxStudents: 40,
      isActive: true,
      isFeatured: false,
      category: 'Cultural',
      tags: ['Europe', 'Art', 'Architecture', 'Spain'],
    },
    {
      title: 'Scottish Highlands Adventure',
      slug: 'scottish-highlands-adventure',
      description: "A 3-day outdoor and geography field trip through the dramatic Scottish Highlands. Featuring Loch Ness, Glencoe, and Ben Nevis, this is perfect for geography, biology, and outdoor education groups.",
      destination: 'Inverness',
      country: 'United Kingdom',
      durationDays: 3,
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      ],
      highlights: ['Loch Ness cruise', 'Glencoe valley walk', 'Urquhart Castle', 'Highland wildlife watching', 'Traditional ceilidh evening'],
      includedItems: ['Coach transport', 'Guest house accommodation', 'All meals', 'Activity leader', 'Equipment hire'],
      excludedItems: ['Personal spending', 'Insurance'],
      priceConfig: {
        basePerStudent: 65,
        basePerAdult: 80,
        mealPerPersonPerDay: 0,
        transportSurcharge: { bus: 0, train: 15, flight: 80, ferry: 30 },
        extras: { 'Loch Ness Boat Cruise': 20, 'Wildlife Tracking': 25, 'Ceilidh Evening': 15 },
      },
      availableTransport: ['bus', 'train'],
      availableExtras: { 'Loch Ness Boat Cruise': 20, 'Wildlife Tracking': 25, 'Ceilidh Evening': 15 },
      minStudents: 10,
      maxStudents: 35,
      isActive: true,
      isFeatured: true,
      category: 'Adventure',
      tags: ['UK', 'Outdoor', 'Geography', 'Nature'],
    },
    {
      title: 'Berlin: History & Reunification',
      slug: 'berlin-history-reunification',
      description: "A deeply educational 5-day journey through 20th century history in Berlin. Students visit the Brandenburg Gate, Holocaust Memorial, Checkpoint Charlie, and the Berlin Wall Memorial. Essential for history and politics students.",
      destination: 'Berlin',
      country: 'Germany',
      durationDays: 5,
      images: [
        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
        'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800',
      ],
      highlights: ['Brandenburg Gate', 'Holocaust Memorial', 'Checkpoint Charlie Museum', 'Berlin Wall Memorial', 'Reichstag visit'],
      includedItems: ['Return train travel', 'Central hotel', 'Daily breakfast', 'Museum passes', 'Expert historian guides'],
      excludedItems: ['Lunches', 'Personal spending', 'Insurance'],
      priceConfig: {
        basePerStudent: 80,
        basePerAdult: 100,
        mealPerPersonPerDay: 15,
        transportSurcharge: { bus: 40, train: 0, flight: 60, ferry: 70 },
        extras: { 'DDR Museum': 15, 'Stasi Museum': 12, 'Sachsenhausen Memorial': 25 },
      },
      availableTransport: ['bus', 'train', 'flight'],
      availableExtras: { 'DDR Museum': 15, 'Stasi Museum': 12, 'Sachsenhausen Memorial': 25 },
      minStudents: 15,
      maxStudents: 50,
      isActive: true,
      isFeatured: false,
      category: 'Historical',
      tags: ['Europe', 'History', 'Politics', 'Germany', 'WWII'],
    },
  ]);

  console.log(`Created ${trips.length} trips.`);
  console.log('\n=== SEED DATA COMPLETE ===');
  console.log('\nLogin credentials:');
  console.log('Admin:  admin@schooltripz.com / Admin123!');
  console.log('Client: sarah@greenviewschool.com / Client123!');
  console.log('Client: mark@stpeterscollege.edu / Client123!');

  await mongoose.disconnect();
  console.log('\nDone. Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
