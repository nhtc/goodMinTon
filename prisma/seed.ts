import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration for data generation
const CONFIG = {
  members: 100, // Total number of members
  games: 500, // Total number of games (spanning 2 years)
  personalEvents: 50, // Total number of personal events
  avgParticipantsPerGame: 6, // Average participants per game
  avgParticipantsPerEvent: 8, // Average participants per event
};

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomBool = (probability: number = 0.5) => Math.random() < probability;
const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomElements = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};

// Data generators
const firstNames = [
  'John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer',
  'William', 'Jessica', 'James', 'Emily', 'Daniel', 'Ashley', 'Matthew', 'Amanda',
  'Christopher', 'Melissa', 'Andrew', 'Michelle', 'Joshua', 'Stephanie', 'Kevin', 'Nicole',
  'Brian', 'Elizabeth', 'Ryan', 'Rebecca', 'Jason', 'Laura', 'Justin', 'Lauren',
  'Brandon', 'Brittany', 'Tyler', 'Megan', 'Eric', 'Rachel', 'Jacob', 'Samantha',
  'Alexander', 'Katherine', 'Jonathan', 'Christina', 'Nathan', 'Victoria', 'Benjamin', 'Hannah',
];

const lastNames = [
  'Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Martinez',
  'Garcia', 'Rodriguez', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson',
  'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker',
  'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed',
];

const locations = [
  'Central Sports Complex', 'East Side Arena', 'Downtown Sports Hall', 'Northside Badminton Center',
  'Westside Recreation Center', 'Southside Sports Club', 'Olympic Training Facility', 'City Sports Center',
  'Community Badminton Hall', 'Riverside Sports Complex', 'Lakeside Arena', 'Mountain View Courts',
  'Sunset Sports Center', 'Golden Gate Badminton Club', 'Phoenix Sports Complex', 'Dragon Sports Hall',
];

const eventTitles = [
  'Team Dinner', 'Equipment Purchase', 'Tournament Registration', 'Team Building Event',
  'Championship Celebration', 'Season Opening Party', 'Annual Banquet', 'Charity Tournament',
  'Training Camp Fee', 'Coach Appreciation', 'Year End Celebration', 'Team Jersey Purchase',
];

const prePaidCategories = ['Previous Credit', 'Advance Payment', 'Refund Credit', 'Bonus Points'];

async function main() {
  console.log('🌱 Starting LARGE database seeding for performance testing...');
  console.log(`📈 Configuration: ${CONFIG.members} members, ${CONFIG.games} games, ${CONFIG.personalEvents} events`);

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.personalEventParticipant.deleteMany();
  await prisma.gameParticipant.deleteMany();
  await prisma.personalEvent.deleteMany();
  await prisma.game.deleteMany();
  await prisma.member.deleteMany();

  // Create Members
  console.log(`👥 Creating ${CONFIG.members} members...`);
  const members = [];
  const batchSize = 50;
  
  for (let i = 0; i < CONFIG.members; i += batchSize) {
    const batch = [];
    const end = Math.min(i + batchSize, CONFIG.members);
    
    for (let j = i; j < end; j++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const name = `${firstName} ${lastName} ${j + 1}`;
      
      batch.push(
        prisma.member.create({
          data: {
            name,
            phone: `+84${randomInt(900000000, 999999999)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            isActive: randomBool(0.9), // 90% active members
          },
        })
      );
    }
    
    const createdBatch = await Promise.all(batch);
    members.push(...createdBatch);
    console.log(`   Created ${members.length}/${CONFIG.members} members...`);
  }

  console.log(`✅ Created ${members.length} members (${members.filter(m => m.isActive).length} active)`);

  // Create Games
  console.log(`🏸 Creating ${CONFIG.games} games with participants...`);
  const games = [];
  let totalParticipants = 0;
  
  // Generate games over the past 2 years and next 3 months
  const startDate = new Date('2023-10-17');
  const endDate = new Date('2026-01-17');
  const dateRange = endDate.getTime() - startDate.getTime();
  
  for (let i = 0; i < CONFIG.games; i++) {
    // Random date within range
    const gameDate = new Date(startDate.getTime() + Math.random() * dateRange);
    gameDate.setHours(randomInt(17, 21), randomInt(0, 59), 0, 0);
    
    // Random costs
    const yardCost = randomInt(150000, 300000);
    const shuttleCockQuantity = randomInt(1, 5);
    const shuttleCockPrice = randomInt(70000, 90000);
    const otherFees = randomBool(0.3) ? randomInt(10000, 50000) : 0;
    const totalCost = yardCost + (shuttleCockQuantity * shuttleCockPrice) + otherFees;
    const participantCount = randomInt(4, 10);
    const costPerMember = Math.round(totalCost / participantCount);
    
    const game = await prisma.game.create({
      data: {
        date: gameDate,
        location: randomElement(locations),
        yardCost,
        shuttleCockQuantity,
        shuttleCockPrice,
        otherFees,
        totalCost,
        costPerMember,
        costPerGame: costPerMember,
      },
    });
    
    games.push(game);
    
    // Create participants for this game
    const selectedMembers = randomElements(members, participantCount);
    const isPastGame = gameDate < new Date();
    
    const participantPromises = selectedMembers.map((member) => {
      const hasPaid = isPastGame ? randomBool(0.85) : randomBool(0.2); // 85% paid for past, 20% for future
      const hasCustomAmount = randomBool(0.1); // 10% have custom amounts
      const hasPrePaid = randomBool(0.05); // 5% have prepaid
      
      return prisma.gameParticipant.create({
        data: {
          gameId: game.id,
          memberId: member.id,
          hasPaid,
          paidAt: hasPaid ? new Date(gameDate.getTime() + randomInt(0, 7200000)) : null, // Within 2 hours after game
          customAmount: hasCustomAmount ? Math.round(costPerMember * randomFloat(0.5, 1.5)) : null,
          prePaid: hasPrePaid ? randomInt(20000, 100000) : 0,
          prePaidCategory: hasPrePaid ? randomElement(prePaidCategories) : '',
        },
      });
    });
    
    await Promise.all(participantPromises);
    totalParticipants += selectedMembers.length;
    
    if ((i + 1) % 50 === 0) {
      console.log(`   Created ${i + 1}/${CONFIG.games} games with ${totalParticipants} participants...`);
    }
  }

  console.log(`✅ Created ${games.length} games with ${totalParticipants} total participants`);

  // Create Personal Events
  console.log(`🎉 Creating ${CONFIG.personalEvents} personal events with participants...`);
  const events = [];
  let eventParticipantsCreated = 0;
  
  // Generate events over the past year and next 6 months
  const eventStartDate = new Date('2024-10-17');
  const eventEndDate = new Date('2026-04-17');
  const eventDateRange = eventEndDate.getTime() - eventStartDate.getTime();
  
  for (let i = 0; i < CONFIG.personalEvents; i++) {
    const eventDate = new Date(eventStartDate.getTime() + Math.random() * eventDateRange);
    eventDate.setHours(randomInt(9, 20), randomInt(0, 59), 0, 0);
    
    const participantCount = randomInt(5, 15);
    const costPerPerson = randomInt(100000, 500000);
    const totalCost = costPerPerson * participantCount;
    
    const event = await prisma.personalEvent.create({
      data: {
        title: `${randomElement(eventTitles)} ${i + 1}`,
        description: `Event description for ${randomElement(eventTitles).toLowerCase()} #${i + 1}`,
        date: eventDate,
        location: randomElement(locations),
        totalCost,
      },
    });
    
    events.push(event);
    
    // Create participants for this event
    const selectedMembers = randomElements(members, participantCount);
    const isPastEvent = eventDate < new Date();
    
    const eventParticipantPromises = selectedMembers.map((member) => {
      const hasPaid = isPastEvent ? randomBool(0.8) : randomBool(0.15); // 80% paid for past, 15% for future
      const hasPrePaid = randomBool(0.05); // 5% have prepaid
      const customAmount = Math.round(costPerPerson * randomFloat(0.8, 1.2)); // Some variation in amounts
      
      return prisma.personalEventParticipant.create({
        data: {
          personalEventId: event.id,
          memberId: member.id,
          customAmount,
          hasPaid,
          paidAt: hasPaid ? new Date(eventDate.getTime() + randomInt(0, 10800000)) : null, // Within 3 hours
          prePaid: hasPrePaid ? randomInt(50000, 200000) : 0,
          prePaidCategory: hasPrePaid ? randomElement(prePaidCategories) : '',
        },
      });
    });
    
    await Promise.all(eventParticipantPromises);
    eventParticipantsCreated += selectedMembers.length;
    
    if ((i + 1) % 10 === 0) {
      console.log(`   Created ${i + 1}/${CONFIG.personalEvents} events with ${eventParticipantsCreated} participants...`);
    }
  }

  console.log(`✅ Created ${events.length} personal events with ${eventParticipantsCreated} total participants`);

  // Calculate statistics
  const activeMembersCount = members.filter(m => m.isActive).length;
  const inactiveMembersCount = members.filter(m => !m.isActive).length;
  
  const allGames = await prisma.game.findMany({ include: { participants: true } });
  const totalGameParticipants = allGames.reduce((sum, game) => sum + game.participants.length, 0);
  const paidGameParticipants = allGames.reduce((sum, game) => 
    sum + game.participants.filter(p => p.hasPaid).length, 0
  );
  
  const allEvents = await prisma.personalEvent.findMany({ include: { participants: true } });
  const totalEventParticipants = allEvents.reduce((sum, event) => sum + event.participants.length, 0);
  const paidEventParticipants = allEvents.reduce((sum, event) => 
    sum + event.participants.filter(p => p.hasPaid).length, 0
  );
  
  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`👥 Members: ${members.length} total`);
  console.log(`   - Active: ${activeMembersCount} (${Math.round(activeMembersCount/members.length*100)}%)`);
  console.log(`   - Inactive: ${inactiveMembersCount} (${Math.round(inactiveMembersCount/members.length*100)}%)`);
  console.log('');
  console.log(`🏸 Games: ${allGames.length} total`);
  console.log(`   - Total participants: ${totalGameParticipants}`);
  console.log(`   - Paid: ${paidGameParticipants} (${Math.round(paidGameParticipants/totalGameParticipants*100)}%)`);
  console.log(`   - Unpaid: ${totalGameParticipants - paidGameParticipants} (${Math.round((totalGameParticipants - paidGameParticipants)/totalGameParticipants*100)}%)`);
  console.log(`   - Average participants per game: ${Math.round(totalGameParticipants/allGames.length)}`);
  console.log('');
  console.log(`🎉 Personal Events: ${allEvents.length} total`);
  console.log(`   - Total participants: ${totalEventParticipants}`);
  console.log(`   - Paid: ${paidEventParticipants} (${Math.round(paidEventParticipants/totalEventParticipants*100)}%)`);
  console.log(`   - Unpaid: ${totalEventParticipants - paidEventParticipants} (${Math.round((totalEventParticipants - paidEventParticipants)/totalEventParticipants*100)}%)`);
  console.log(`   - Average participants per event: ${Math.round(totalEventParticipants/allEvents.length)}`);
  console.log('─────────────────────────────────────────────────────────');
  console.log(`📈 Total records created: ${members.length + allGames.length + allEvents.length + totalGameParticipants + totalEventParticipants}`);
  console.log('');
  console.log('💡 Tip: Use this data to test pagination, filtering, and performance!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
