# 🛍️ Projects Marketplace

A marketplace for buying and selling development projects built with Next.js 16, Prisma v7, and Neon PostgreSQL.

## 📚 Documentation

| Document                                           | Purpose                                                    |
| -------------------------------------------------- | ---------------------------------------------------------- |
| **[DATABASE_GUIDE.md](./DATABASE_GUIDE.md)**       | 📘 Complete beginner-friendly guide to the database schema |
| **[PRISMA_SETUP.md](./PRISMA_SETUP.md)**           | 📗 Quick setup instructions for Neon + Prisma              |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**     | 📙 Daily commands and code snippets cheat sheet            |
| **[FIXES_SUMMARY.md](./FIXES_SUMMARY.md)**         | ✅ Summary of recent fixes (S3, migrations)                |
| **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** | 🧪 Step-by-step testing guide                              |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables (copy and edit .env)
# Add DATABASE_URL, AWS credentials, Google OAuth, etc.

# 3. Setup database
npx prisma migrate dev
npx prisma generate

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Features

- ✅ **Google OAuth** authentication via NextAuth v5
- ✅ **Project Listings** with images, pricing, and tech stack
- ✅ **S3 File Storage** for thumbnails, screenshots, and ZIP files
- ✅ **Seller Dashboard** to manage projects
- ✅ **Public Marketplace** for browsing projects
- ✅ **Order Tracking** (ready for Razorpay integration)
- ✅ **Full Type Safety** with TypeScript and Prisma

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript 5
- **Database:** Neon PostgreSQL (cloud)
- **ORM:** Prisma v7 with migrations
- **Authentication:** NextAuth v5 (Google OAuth)
- **Storage:** AWS S3
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

## 📊 Database Schema

8 interconnected tables:

- **User** - User accounts with roles
- **Account** - OAuth providers
- **Session** - Login sessions
- **Project** - Marketplace listings
- **ProjectImage** - Multiple screenshots
- **Order** - Purchase records
- **Payment** - Transaction details
- **VerificationToken** - Email verification

See [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) for detailed explanations.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
