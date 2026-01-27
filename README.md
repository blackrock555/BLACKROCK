# BLACKROCK - Investment Platform

A production-ready, multi-user investment dashboard built with Next.js 14, TypeScript, Tailwind CSS, MongoDB, and NextAuth.

> **IMPORTANT DISCLAIMER:** This is a simulated investment platform for demonstration and educational purposes only. No real funds, guaranteed returns, or actual trading is involved. Do not use this for real financial transactions.

## Features

- **Authentication**: Email/password and Google OAuth via NextAuth
- **User Dashboard**: Balance tracking, performance charts, profit sharing
- **Deposit/Withdrawal**: Multi-step flows with admin approval
- **KYC Verification**: Document upload and admin review
- **Affiliate System**: Referral links with tiered rewards
- **Admin Panel**: User management, transaction approval, audit logs
- **Profit Sharing**: Automated daily profit distribution (Vercel Cron)
- **Mobile-First**: Responsive design with collapsible sidebar

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account for SMTP (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BLACKROCK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/blackrock

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email (optional - for email verification)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM="BLACKROCK <noreply@blackrock.com>"
   ```

4. **Seed the database** (optional)
   ```bash
   npx ts-node scripts/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Test Accounts

After running the seed script:

| Email | Password | Role | Balance |
|-------|----------|------|---------|
| admin@blackrock.com | Admin123! | Admin | $0 |
| john@test.com | User123! | User | $1,500 |
| jane@test.com | User123! | User | $5,000 |
| charlie@test.com | User123! | User | $15,000 |

## Project Structure

```
BLACKROCK/
├── app/
│   ├── (public)/           # Public routes (landing, auth)
│   ├── (app)/              # Protected user routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Sidebar, TopBar, etc.
│   ├── dashboard/          # Dashboard components
│   └── branding/           # Logo component
├── lib/
│   ├── db/                 # Database connection & models
│   ├── auth/               # NextAuth configuration
│   ├── email/              # Email templates
│   ├── validators/         # Zod schemas
│   └── utils/              # Helper functions
├── types/                  # TypeScript types
└── scripts/                # Seed and utility scripts
```

## Profit Share Tiers

| Deposit Balance | Daily Rate |
|----------------|-----------|
| < $100         | 4%        |
| $100 - $999    | 5%        |
| >= $1,000      | 6%        |

*Note: These are simulated rates for demonstration purposes.*

## Referral Rewards

| Total Referrals | Reward per Referral |
|-----------------|---------------------|
| 0 - 9           | $5                  |
| 10 - 19         | $8                  |
| 20 - 29         | $9                  |
| 30+             | $10                 |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

The `vercel.json` includes cron job configuration for daily profit sharing.

### Other Platforms

For non-Vercel deployments, set up an external cron job to call:
```
GET /api/cron/profit-share
Authorization: Bearer YOUR_CRON_SECRET
```

## Security Notes

- All passwords are hashed with bcrypt (12 rounds)
- Rate limiting on authentication endpoints
- Role-based access control for admin routes
- Input validation with Zod
- CSRF protection via NextAuth
- Audit logging for admin actions

## Contributing

This is a demo project. Contributions are welcome for educational purposes.

## License

MIT License - See LICENSE file for details.

---

Built with Next.js and deployed on Vercel.
