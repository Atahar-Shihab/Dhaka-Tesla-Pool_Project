const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// List of major locations in Dhaka with approximate coordinates
const locations = [
  { name: 'Banani', latitude: 23.7937, longitude: 90.4066 },
  { name: 'Gulshan 1', latitude: 23.7808, longitude: 90.4169 },
  { name: 'Gulshan 2', latitude: 23.7925, longitude: 90.4138 },
  { name: 'Mohakhali', latitude: 23.7781, longitude: 90.4080 },
  { name: 'Dhanmondi', latitude: 23.7465, longitude: 90.3763 },
  { name: 'Mirpur', latitude: 23.8223, longitude: 90.3654 },
  { name: 'Uttara', latitude: 23.8759, longitude: 90.3795 },
  { name: 'Farmgate', latitude: 23.7570, longitude: 90.3876 },
  { name: 'Bashundhara', latitude: 23.8130, longitude: 90.4250 },
  { name: 'Tejgaon', latitude: 23.7636, longitude: 90.3936 },
];

async function main() {
  console.log('Starting seed...');

  // 1. Seed Locations
  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: loc,
    });
  }
  console.log('Locations seeded successfully.');

  // 2. Hash default password for users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Seed Users (1 Driver, 3 Passengers)
  // Jashim - Driver
  const driver = await prisma.user.upsert({
    where: { email: 'jashim@teslapool.com' },
    update: {},
    create: {
      name: 'Jashim',
      email: 'jashim@teslapool.com',
      password: hashedPassword,
      role: 'DRIVER',
      phone: '01711000000',
    },
  });
  console.log(`Driver created: ${driver.name}`);

  // Nusrat - Passenger
  const passenger1 = await prisma.user.upsert({
    where: { email: 'nusrat@teslapool.com' },
    update: {},
    create: {
      name: 'Nusrat',
      email: 'nusrat@teslapool.com',
      password: hashedPassword,
      role: 'PASSENGER',
      phone: '01811000001',
    },
  });
  console.log(`Passenger created: ${passenger1.name}`);

  // Rafiq - Passenger
  const passenger2 = await prisma.user.upsert({
    where: { email: 'rafiq@teslapool.com' },
    update: {},
    create: {
      name: 'Rafiq',
      email: 'rafiq@teslapool.com',
      password: hashedPassword,
      role: 'PASSENGER',
      phone: '01911000002',
    },
  });
  console.log(`Passenger created: ${passenger2.name}`);

  // Shirin - Passenger
  const passenger3 = await prisma.user.upsert({
    where: { email: 'shirin@teslapool.com' },
    update: {},
    create: {
      name: 'Shirin',
      email: 'shirin@teslapool.com',
      password: hashedPassword,
      role: 'PASSENGER',
      phone: '01611000003',
    },
  });
  console.log(`Passenger created: ${passenger3.name}`);

  // 4. Seed Vehicle for Driver Jashim
  // Using try/catch to avoid errors if the vehicle already exists (upsert based on a non-unique field without a constraint is tricky)
  // Since driverId is unique, we can check for an existing vehicle first.
  let vehicle = await prisma.vehicle.findUnique({
    where: { driverId: driver.id },
  });

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        driverId: driver.id,
        name: 'Tesla Bullet',
        capacity: 3,
        model: 'Model 3',
        licensePlate: 'DHK-11-2233',
        isActive: true, // Jashim is ready to drive!
      },
    });
    console.log(`Vehicle created: ${vehicle.name} for ${driver.name}`);
  } else {
    console.log(`Vehicle already exists for ${driver.name}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Always disconnect the Prisma client when done
    await prisma.$disconnect();
  });
