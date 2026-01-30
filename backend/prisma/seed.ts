import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.region.deleteMany();

  const regions = await prisma.region.createMany({
    data: [
      { name: 'Île-de-France' },
      { name: 'Auvergne-Rhône-Alpes' },
      { name: "Provence-Alpes-Côte d'Azur" },
    ],
  });

  const allRegions = await prisma.region.findMany();
  const regionMap = Object.fromEntries(allRegions.map(r => [r.name, r.id]));

  const hotels = await prisma.hotel.createMany({
    data: [
      {
        name: 'Atlas Riverside',
        regionId: regionMap['Auvergne-Rhône-Alpes'],
        address: '12 Quai du Soleil, Lyon',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101a?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
      {
        name: 'Marina Centrale',
        regionId: regionMap["Provence-Alpes-Côte d'Azur"],
        address: '8 Rue des Arts, Marseille',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Champs Lumière',
        regionId: regionMap['Île-de-France'],
        address: '44 Avenue Victor, Paris',
        starRating: 5,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: false,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 5,
        },
      },
      {
        name: 'Bellevue Opéra',
        regionId: regionMap['Île-de-France'],
        address: '5 Rue de l\'Opéra, Paris',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 1,
        },
      },
      {
        name: 'Mont Blanc Lodge',
        regionId: regionMap['Auvergne-Rhône-Alpes'],
        address: '2 Route des Neiges, Chamonix',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 4,
        },
      },
      {
        name: 'Azur Bay Resort',
        regionId: regionMap["Provence-Alpes-Côte d'Azur"],
        address: '90 Promenade des Lumières, Nice',
        starRating: 5,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: false,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 7,
        },
      },
      {
        name: 'Riviera Garden',
        regionId: regionMap["Provence-Alpes-Côte d'Azur"],
        address: '21 Avenue des Palmiers, Cannes',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Lyon Art Hotel',
        regionId: regionMap['Auvergne-Rhône-Alpes'],
        address: '7 Place des Terreaux, Lyon',
        starRating: 3,
        heroImageUrl:
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 1,
        },
      },
      {
        name: 'Seine Horizon',
        regionId: regionMap['Île-de-France'],
        address: '18 Quai Saint-Martin, Paris',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
    ],
  });

  const createdHotels = await prisma.hotel.findMany();

  const roomTypesData = createdHotels.flatMap(hotel => {
    const base = hotel.name.includes('Champs') ? 18000 : hotel.name.includes('Azur') ? 20000 : 12000;
    return [
      {
        hotelId: hotel.id,
        name: 'Double Signature',
        capacity: 2,
        pricePerNightCents: base,
        totalRooms: 10,
      },
      {
        hotelId: hotel.id,
        name: 'Suite Panorama',
        capacity: 3,
        pricePerNightCents: base + 7000,
        totalRooms: 6,
      },
      {
        hotelId: hotel.id,
        name: 'Family Loft',
        capacity: 4,
        pricePerNightCents: base + 12000,
        totalRooms: 4,
      },
    ];
  });

  await prisma.roomType.createMany({ data: roomTypesData });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

