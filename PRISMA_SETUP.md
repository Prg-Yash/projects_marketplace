# Prisma + Neon Database Setup

This project uses [Prisma](https://www.prisma.io/) as the ORM and [Neon](https://neon.tech/) PostgreSQL as the cloud database.

## Setup Instructions

### 1. Get your Neon Database Connection String

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or select an existing one
3. Copy your connection string from the dashboard
4. It should look like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### 2. Configure Environment Variables

Update your `.env` file with your Neon connection strings:

```env
DATABASE_URL="your-neon-connection-string"
DIRECT_URL="your-neon-direct-connection-string"
```

> **Note:** For Neon, both `DATABASE_URL` and `DIRECT_URL` can be the same connection string.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Push Database Schema

To sync your Prisma schema with your Neon database:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name init
```

### 5. View Your Database

Open Prisma Studio to view and edit your data:

```bash
npx prisma studio
```

## Usage in Your Code

Import and use the Prisma client in your Next.js app:

```typescript
import prisma from "@/lib/prisma";

// Example: Fetch all projects
const projects = await prisma.project.findMany();

// Example: Create a new user
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
  },
});
```

## Available Scripts

- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma db pull` - Pull schema from existing database

## Schema

The initial schema includes two models:

- **User**: Stores user information
- **Project**: Stores marketplace projects with author relationship

You can modify the schema in `prisma/schema.prisma` and run migrations to update your database.
