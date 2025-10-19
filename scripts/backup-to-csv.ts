import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper function to escape CSV values
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Helper function to convert array of objects to CSV
function arrayToCSV(data: any[]): string {
  if (data.length === 0) {
    return '';
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.map(escapeCSV).join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => escapeCSV(row[header]));
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

async function backupDatabase() {
  try {
    console.log('🚀 Starting database backup...\n');
    
    // Create backups directory if it doesn't exist
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupDir = path.join(process.cwd(), 'backups', timestamp);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log(`📁 Backup directory: ${backupDir}\n`);
    
    // Backup Members
    console.log('📦 Backing up Members...');
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'asc' }
    });
    fs.writeFileSync(
      path.join(backupDir, 'members.csv'),
      arrayToCSV(members)
    );
    console.log(`✅ Exported ${members.length} members\n`);
    
    // Backup Games
    console.log('📦 Backing up Games...');
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'asc' }
    });
    fs.writeFileSync(
      path.join(backupDir, 'games.csv'),
      arrayToCSV(games)
    );
    console.log(`✅ Exported ${games.length} games\n`);
    
    // Backup GameParticipants
    console.log('📦 Backing up Game Participants...');
    const gameParticipants = await prisma.gameParticipant.findMany({
      orderBy: { id: 'asc' }
    });
    fs.writeFileSync(
      path.join(backupDir, 'game_participants.csv'),
      arrayToCSV(gameParticipants)
    );
    console.log(`✅ Exported ${gameParticipants.length} game participants\n`);
    
    // Backup PersonalEvents
    console.log('📦 Backing up Personal Events...');
    const personalEvents = await prisma.personalEvent.findMany({
      orderBy: { createdAt: 'asc' }
    });
    fs.writeFileSync(
      path.join(backupDir, 'personal_events.csv'),
      arrayToCSV(personalEvents)
    );
    console.log(`✅ Exported ${personalEvents.length} personal events\n`);
    
    // Backup PersonalEventParticipants
    console.log('📦 Backing up Personal Event Participants...');
    const personalEventParticipants = await prisma.personalEventParticipant.findMany({
      orderBy: { id: 'asc' }
    });
    fs.writeFileSync(
      path.join(backupDir, 'personal_event_participants.csv'),
      arrayToCSV(personalEventParticipants)
    );
    console.log(`✅ Exported ${personalEventParticipants.length} personal event participants\n`);
    
    // Create a summary file
    const summary = {
      timestamp: new Date().toISOString(),
      tables: {
        members: members.length,
        games: games.length,
        game_participants: gameParticipants.length,
        personal_events: personalEvents.length,
        personal_event_participants: personalEventParticipants.length
      },
      total_records: members.length + games.length + gameParticipants.length + 
                     personalEvents.length + personalEventParticipants.length
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('=' .repeat(50));
    console.log('✨ Backup completed successfully!');
    console.log('=' .repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   Members: ${summary.tables.members}`);
    console.log(`   Games: ${summary.tables.games}`);
    console.log(`   Game Participants: ${summary.tables.game_participants}`);
    console.log(`   Personal Events: ${summary.tables.personal_events}`);
    console.log(`   Personal Event Participants: ${summary.tables.personal_event_participants}`);
    console.log(`   Total Records: ${summary.total_records}`);
    console.log(`\n📁 Location: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
