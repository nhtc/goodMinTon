import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Parse CSV row handling quoted values
function parseCSVRow(row: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (insideQuotes && row[i + 1] === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add last value
  values.push(currentValue);
  
  return values;
}

// Convert CSV string value to appropriate type
function parseValue(value: string, expectedType: string): any {
  if (value === '' || value === 'null') {
    return null;
  }
  
  switch (expectedType) {
    case 'boolean':
      return value === 'true' || value === '1';
    case 'number':
      return parseFloat(value);
    case 'date':
      return new Date(value);
    default:
      return value;
  }
}

// Read CSV file and convert to array of objects
async function csvToArray(filePath: string, schema: Record<string, string>): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let headers: string[] = [];
    let isFirstLine = true;
    
    rl.on('line', (line) => {
      if (isFirstLine) {
        headers = parseCSVRow(line);
        isFirstLine = false;
      } else if (line.trim()) {
        const values = parseCSVRow(line);
        const obj: any = {};
        
        headers.forEach((header, index) => {
          obj[header] = parseValue(values[index], schema[header] || 'string');
        });
        
        results.push(obj);
      }
    });
    
    rl.on('close', () => {
      resolve(results);
    });
    
    rl.on('error', (error) => {
      reject(error);
    });
  });
}

async function restoreDatabase(backupPath: string) {
  try {
    console.log('🔄 Starting database restore...\n');
    
    // Validate backup directory exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup directory not found: ${backupPath}`);
    }
    
    console.log(`📁 Restoring from: ${backupPath}\n`);
    
    // Read summary if exists
    const summaryPath = path.join(backupPath, 'backup_summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      console.log('📊 Backup Summary:');
      console.log(`   Created: ${new Date(summary.timestamp).toLocaleString()}`);
      console.log(`   Total Records: ${summary.total_records}\n`);
    }
    
    console.log('⚠️  WARNING: This will DELETE all existing data and replace it with backup data!');
    console.log('   Make sure you have a backup of current data if needed.\n');
    
    // Define schemas for type conversion
    const memberSchema = {
      id: 'string',
      name: 'string',
      phone: 'string',
      avatar: 'string',
      isActive: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    };
    
    const gameSchema = {
      id: 'string',
      date: 'date',
      location: 'string',
      yardCost: 'number',
      shuttleCockQuantity: 'number',
      shuttleCockPrice: 'number',
      otherFees: 'number',
      totalCost: 'number',
      costPerMember: 'number',
      costPerGame: 'number',
      createdAt: 'date',
      updatedAt: 'date'
    };
    
    const gameParticipantSchema = {
      id: 'string',
      gameId: 'string',
      memberId: 'string',
      hasPaid: 'boolean',
      paidAt: 'date',
      prePaid: 'number',
      prePaidCategory: 'string',
      customAmount: 'number'
    };
    
    const personalEventSchema = {
      id: 'string',
      title: 'string',
      description: 'string',
      date: 'date',
      location: 'string',
      totalCost: 'number',
      createdAt: 'date',
      updatedAt: 'date'
    };
    
    const personalEventParticipantSchema = {
      id: 'string',
      personalEventId: 'string',
      memberId: 'string',
      customAmount: 'number',
      hasPaid: 'boolean',
      paidAt: 'date',
      prePaid: 'number',
      prePaidCategory: 'string'
    };
    
    // Delete existing data in reverse order (to respect foreign keys)
    console.log('🗑️  Deleting existing data...');
    await prisma.personalEventParticipant.deleteMany({});
    console.log('   ✅ Personal Event Participants deleted');
    
    await prisma.personalEvent.deleteMany({});
    console.log('   ✅ Personal Events deleted');
    
    await prisma.gameParticipant.deleteMany({});
    console.log('   ✅ Game Participants deleted');
    
    await prisma.game.deleteMany({});
    console.log('   ✅ Games deleted');
    
    await prisma.member.deleteMany({});
    console.log('   ✅ Members deleted\n');
    
    // Restore Members
    const membersPath = path.join(backupPath, 'members.csv');
    if (fs.existsSync(membersPath)) {
      console.log('📥 Restoring Members...');
      const members = await csvToArray(membersPath, memberSchema);
      
      for (const member of members) {
        await prisma.member.create({ data: member });
      }
      console.log(`   ✅ Restored ${members.length} members\n`);
    }
    
    // Restore Games
    const gamesPath = path.join(backupPath, 'games.csv');
    if (fs.existsSync(gamesPath)) {
      console.log('📥 Restoring Games...');
      const games = await csvToArray(gamesPath, gameSchema);
      
      for (const game of games) {
        await prisma.game.create({ data: game });
      }
      console.log(`   ✅ Restored ${games.length} games\n`);
    }
    
    // Restore Game Participants
    const gameParticipantsPath = path.join(backupPath, 'game_participants.csv');
    if (fs.existsSync(gameParticipantsPath)) {
      console.log('📥 Restoring Game Participants...');
      const gameParticipants = await csvToArray(gameParticipantsPath, gameParticipantSchema);
      
      for (const participant of gameParticipants) {
        await prisma.gameParticipant.create({ data: participant });
      }
      console.log(`   ✅ Restored ${gameParticipants.length} game participants\n`);
    }
    
    // Restore Personal Events
    const personalEventsPath = path.join(backupPath, 'personal_events.csv');
    if (fs.existsSync(personalEventsPath)) {
      console.log('📥 Restoring Personal Events...');
      const personalEvents = await csvToArray(personalEventsPath, personalEventSchema);
      
      for (const event of personalEvents) {
        await prisma.personalEvent.create({ data: event });
      }
      console.log(`   ✅ Restored ${personalEvents.length} personal events\n`);
    }
    
    // Restore Personal Event Participants
    const personalEventParticipantsPath = path.join(backupPath, 'personal_event_participants.csv');
    if (fs.existsSync(personalEventParticipantsPath)) {
      console.log('📥 Restoring Personal Event Participants...');
      const personalEventParticipants = await csvToArray(
        personalEventParticipantsPath,
        personalEventParticipantSchema
      );
      
      for (const participant of personalEventParticipants) {
        await prisma.personalEventParticipant.create({ data: participant });
      }
      console.log(`   ✅ Restored ${personalEventParticipants.length} personal event participants\n`);
    }
    
    console.log('=' .repeat(50));
    console.log('✨ Database restored successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get backup path from command line argument or use latest
const backupPath = process.argv[2];

if (!backupPath) {
  console.error('❌ Please provide a backup directory path');
  console.log('\nUsage:');
  console.log('  npm run db:restore -- ./backups/2025-10-17_10-30-00');
  console.log('\nOr list available backups with:');
  console.log('  ls -la ./backups/');
  process.exit(1);
}

restoreDatabase(backupPath);
