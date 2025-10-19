# Dummy Test Data Reference

## Overview
The database has been populated with a **LARGE dataset** for performance testing of the Badminton Manager application.

## Configuration
The seed script generates:
- **100 members** (with realistic names and contact information)
- **500 games** (spanning from Oct 2023 to Jan 2026)
- **50 personal events** (spanning from Oct 2024 to Apr 2026)
- **~3,400+ game participants** (average 7 per game)
- **~550+ event participants** (average 11 per event)
- **Total: 4,600+ database records**

## Data Summary Example (from latest seed)

### Members (100 total)
- **91 Active Members** with unique names like:
  - John Smith 1, Emma Johnson 2, Michael Brown 3, etc.
  - Each with Vietnamese phone numbers (+84...)
  - Each with unique avatar from Dicebear API
  
- **9 Inactive Members** (randomly assigned)

### Games (500 total)
- **Date Range:** October 2023 - January 2026
- **Locations:** 16 different venues (Central Sports Complex, East Side Arena, etc.)
- **Cost Range:** 150,000 - 300,000 VND per court
- **Shuttlecocks:** 1-5 tubes per game (70,000 - 90,000 VND each)
- **Participants:** 4-10 members per game (randomly selected)
- **Payment Status Distribution:**
  - Past games: ~85% paid
  - Future games: ~20% paid
  - Total: ~3,400 game participants across all games

### Personal Events (50 total)
- **Date Range:** October 2024 - April 2026
- **Event Types:** Team dinners, equipment purchases, tournaments, celebrations
- **Cost Range:** 100,000 - 500,000 VND per person
- **Participants:** 5-15 members per event (randomly selected)
- **Payment Status Distribution:**
  - Past events: ~80% paid
  - Future events: ~15% paid
  - Total: ~550 event participants across all events

## Test Scenarios Covered

### Payment Status Testing
- ✅ Fully paid games (Games 1 & 4)
- ⚠️ Partially paid games (Game 2)
- 📅 Unpaid upcoming games (Game 3)
- Custom payment amounts (Game 4)
- Prepaid credits (Game 2 - David)

### Member Testing
- Active members (7)
- Inactive member (1 - Robert Taylor)
- Members with avatars
- Members with phone numbers

### Event Testing
- ✅ Completed personal events with full payment
- ⚠️ Completed events with partial payment
- 📅 Upcoming events with no payments

### Date Range Testing
- Past events (Oct 8, 10, 12, 15)
- Current/Today's event (Oct 17)
- Future events (Oct 20, 25)

## Running the Seed Script

To regenerate this data at any time:

\`\`\`bash
npm run db:seed
\`\`\`

**Note:** Running the seed script will:
1. Clear all existing data (members, games, personal events, participants)
2. Generate fresh random data based on configuration
3. Reset all IDs
4. Take approximately 30-60 seconds to complete

## Customizing the Dataset Size

Edit the configuration at the top of `prisma/seed.ts`:

\`\`\`typescript
const CONFIG = {
  members: 100,              // Total number of members
  games: 500,                // Total number of games
  personalEvents: 50,        // Total number of personal events
  avgParticipantsPerGame: 6, // Average participants per game
  avgParticipantsPerEvent: 8 // Average participants per event
};
\`\`\`

### Performance Testing Recommendations:

- **Small dataset (Testing UI)**: 20 members, 50 games, 10 events
- **Medium dataset (Standard testing)**: 50 members, 200 games, 25 events
- **Large dataset (Performance testing)**: 100 members, 500 games, 50 events (current)
- **Extra large dataset (Stress testing)**: 200 members, 1000 games, 100 events

After editing, run `npm run db:seed` to regenerate with new configuration.

## Data Characteristics

### Random Data Generation
The seed script generates realistic random data including:

- **Member Names**: Combinations from 48 first names and 40 last names
- **Phone Numbers**: Random Vietnamese phone numbers (+84...)
- **Avatars**: Unique avatar URLs using Dicebear API
- **Dates**: Games span 2+ years (Oct 2023 - Jan 2026)
- **Costs**: Realistic Vietnamese pricing (150,000 - 300,000 VND for courts)
- **Payment Status**: 
  - Past games: 85% paid, 15% unpaid
  - Future games: 20% paid, 80% unpaid
  - Events: Similar realistic distribution
- **Locations**: 16 different venues
- **Custom Amounts**: 10% of participants have custom payment amounts
- **Prepaid Credits**: 5% of participants have prepaid amounts

### Data Distribution
- **Active Members**: ~90% active, ~10% inactive
- **Participants per Game**: 4-10 members (randomized)
- **Participants per Event**: 5-15 members (randomized)
- **Payment Patterns**: Realistic based on event timing
- **Date Distribution**: Evenly distributed across date ranges
