# PromptGuy - AI Prompt Sharing Platform

A modern social platform for sharing and discovering AI prompts. Built with Next.js 14, TypeScript, Tailwind CSS, and Clerk authentication.

## Features

- 🔐 **Authentication**: Secure user authentication with Clerk
- 📝 **Post Creation**: Create and share AI prompts with metadata
- 🔍 **Feed & Discovery**: Browse prompts with search and filtering
- ❤️ **Interactions**: Like, bookmark, and share prompts
- 👥 **Social Features**: Follow users and get personalized feeds
- 🔔 **Notifications**: Real-time notifications for interactions
- 📱 **Mobile-First**: Responsive design optimized for all devices
- 🎨 **Modern UI**: Clean interface with dark/light mode support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Database**: Prisma ORM with dual database support (Supabase + MongoDB)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Database (PostgreSQL for Supabase or MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd promptguy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Database (choose one)
   DATABASE_TYPE=supabase
   DATABASE_URL=your_database_url
   
   # Supabase (if using Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # MongoDB (if using MongoDB)
   MONGODB_URI=your_mongodb_uri
   MONGODB_DB_NAME=your_database_name
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses Prisma ORM with the following main entities:

- **Users**: User profiles and authentication data
- **Posts**: AI prompts with metadata (model, purpose, tags)
- **Interactions**: Likes, bookmarks, shares, and follows
- **Notifications**: User notifications for interactions

## API Routes

- `GET/POST /api/posts` - Fetch and create posts
- `POST /api/interactions/like` - Like/unlike posts
- `POST /api/interactions/bookmark` - Bookmark/unbookmark posts
- `POST /api/interactions/follow` - Follow/unfollow users
- `GET/PATCH /api/notifications` - Manage notifications

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/                # API routes
│   ├── create/             # Post creation page
│   ├── dashboard/          # User dashboard
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── Feed.tsx            # Main feed component
│   ├── Navbar.tsx          # Navigation bar
│   └── NotificationCenter.tsx
├── lib/                    # Utility functions
│   ├── db/                 # Database clients
│   └── utils.ts            # Helper functions
└── prisma/                 # Database schema
    └── schema.prisma
```

## Key Features Implementation

### Dynamic Feed Algorithm
The feed uses a pluggable ranking system with featured sections:
- Most Popular This Week
- Trending in specific categories
- Latest posts

### Search & Filtering
- Full-text search across titles and content
- Filter by AI model and purpose
- Sort by popularity, recency, and engagement

### Real-time Interactions
- Like/unlike posts with instant UI updates
- Bookmark system for saving posts
- Follow system for personalized feeds
- Share functionality with external links

### Notification System
- Real-time notifications for likes, bookmarks, and follows
- Notification center with read/unread status
- System notifications for featured content

## Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment variables**

3. **Deploy to your preferred platform**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.