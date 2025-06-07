# Badminton Manager

## Overview
Badminton Manager is a fullstack web application built with Next.js and Node.js, designed to manage badminton game records and member information. The application allows users to add or remove members, record game details, and track payments for game costs.

## Features
- **Member Management**: Add or remove members from the system.
- **Game History**: Record details of each game day, including costs and participants.
- **Fee Calculation**: Automatically calculate and share costs among members.
- **Payment Tracking**: Track which members have paid their fees.
- **Admin Login**: Secure login for admin users to manage members and game records.

## Project Structure
```
badminton-manager
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── members
│   │   │   └── page.tsx
│   │   ├── history
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── api
│   │       ├── auth
│   │       │   └── route.ts
│   │       ├── members
│   │       │   └── route.ts
│   │       └── games
│   │           └── route.ts
│   ├── components
│   │   ├── MemberForm.tsx
│   │   ├── GameForm.tsx
│   │   ├── GameRecord.tsx
│   │   └── Layout.tsx
│   ├── lib
│   │   ├── db.ts
│   │   └── auth.ts
│   └── types
│       └── index.ts
├── prisma
│   ├── schema.prisma
│   └── migrations
├── public
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd badminton-manager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Configure your database connection in `prisma/schema.prisma`.
   - Run migrations:
     ```
     npx prisma migrate dev
     ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage
- Navigate to `/login` to access the admin login page.
- Use the `/members` page to manage member information.
- Visit the `/history` page to record game details and view past games.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.