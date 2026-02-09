import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in .env');
}

const pool = new Pool({
  connectionString,
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
      { name: 'Bourgogne-Franche-Comté' },
      { name: 'Bretagne' },
      { name: 'Centre-Val de Loire' },
      { name: 'Corse' },
      { name: 'Grand Est' },
      { name: 'Hauts-de-France' },
      { name: 'Normandie' },
      { name: 'Nouvelle-Aquitaine' },
      { name: 'Occitanie' },
      { name: 'Pays de la Loire' },
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
      {
        name: 'Bordeaux Riverside',
        regionId: regionMap['Nouvelle-Aquitaine'],
        address: '14 Quai des Chartrons, Bordeaux',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Lille Grand Place',
        regionId: regionMap['Hauts-de-France'],
        address: '3 Place du Général de Gaulle, Lille',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
      {
        name: 'Strasbourg Cathedral Hotel',
        regionId: regionMap['Grand Est'],
        address: '6 Rue Mercière, Strasbourg',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101a?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Nantes Loire Escape',
        regionId: regionMap['Pays de la Loire'],
        address: '9 Quai de la Fosse, Nantes',
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
      {
        name: 'Toulouse Capitole Suites',
        regionId: regionMap['Occitanie'],
        address: '5 Place du Capitole, Toulouse',
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
        name: 'Rennes Green Park',
        regionId: regionMap['Bretagne'],
        address: '11 Avenue Janvier, Rennes',
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
        name: 'Dijon Heritage Hotel',
        regionId: regionMap['Bourgogne-Franche-Comté'],
        address: '4 Rue des Forges, Dijon',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
      {
        name: 'Tours Loire Prestige',
        regionId: regionMap['Centre-Val de Loire'],
        address: '10 Rue Nationale, Tours',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Ajaccio Seaside',
        regionId: regionMap['Corse'],
        address: '2 Route des Sanguinaires, Ajaccio',
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
        name: 'Rouen Riverside',
        regionId: regionMap['Normandie'],
        address: '7 Quai de Paris, Rouen',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Paris Opera Select',
        regionId: regionMap['Île-de-France'],
        address: '22 Rue Auber, Paris',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
      {
        name: 'Alpine Panorama',
        regionId: regionMap['Auvergne-Rhône-Alpes'],
        address: '18 Route des Alpes, Annecy',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Nice Promenade Suites',
        regionId: regionMap["Provence-Alpes-Côte d'Azur"],
        address: '5 Promenade des Anglais, Nice',
        starRating: 5,
        heroImageUrl:
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: false,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 6,
        },
      },
      {
        name: 'Reims Cathedral View',
        regionId: regionMap['Grand Est'],
        address: '10 Place du Forum, Reims',
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
        name: 'Lille Design Hotel',
        regionId: regionMap['Hauts-de-France'],
        address: '15 Rue de Béthune, Lille',
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
        name: 'Brest Harbor Stay',
        regionId: regionMap['Bretagne'],
        address: '2 Quai de la Douane, Brest',
        starRating: 3,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 1,
        },
      },
      {
        name: 'Dijon Wine & Spa',
        regionId: regionMap['Bourgogne-Franche-Comté'],
        address: '8 Rue Musette, Dijon',
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
        name: 'Orléans Royal',
        regionId: regionMap['Centre-Val de Loire'],
        address: '12 Rue Jeanne d’Arc, Orléans',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Ajaccio Marina Lodge',
        regionId: regionMap['Corse'],
        address: '3 Rue Fesch, Ajaccio',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: false,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 5,
        },
      },
      {
        name: 'Rouen Old Town',
        regionId: regionMap['Normandie'],
        address: '9 Rue Saint-Romain, Rouen',
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
        name: 'La Rochelle Marina',
        regionId: regionMap['Nouvelle-Aquitaine'],
        address: '5 Quai Duperré, La Rochelle',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: false,
          allowPayOnSite: true,
          allowFreeReservation: true,
          cancellationFreeUntilDaysBefore: 2,
        },
      },
      {
        name: 'Montpellier Urban Stay',
        regionId: regionMap['Occitanie'],
        address: '21 Rue de la Loge, Montpellier',
        starRating: 4,
        heroImageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
          cancellationFreeUntilDaysBefore: 3,
        },
      },
      {
        name: 'Angers Loire Residence',
        regionId: regionMap['Pays de la Loire'],
        address: '6 Boulevard du Roi René, Angers',
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

  const regionCount = await prisma.region.count();
  const hotelCount = await prisma.hotel.count();
  const roomTypeCount = await prisma.roomType.count();
  console.log(`Seed done. Regions: ${regionCount}, Hotels: ${hotelCount}, RoomTypes: ${roomTypeCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

