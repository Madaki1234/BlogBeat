# Blog Application

A full-stack blog application with Node.js MVC backend, MongoDB, and React frontend featuring authentication, pagination, and interactive features.

## Features

- User authentication with secure password hashing
- Blog post creation, editing, and deletion
- Comment system with threaded replies
- Post liking functionality
- Category filtering
- Responsive design
- Rich text editor for content creation
- SEO-friendly metadata

## Technology Stack

- **Frontend**: React, TailwindCSS, shadcn/ui, React Query
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Passport.js with session-based auth
- **Content Editing**: TipTap rich text editor
- **Build Tools**: Vite, TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (for production) or the application will use an in-memory MongoDB for development

### Development Mode

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   This will run the application in development mode with an in-memory MongoDB database.

### Production Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secure_session_secret
   ```
4. Build and start the application in production mode:
   ```bash
   # Using the script
   ./start-production.sh
   
   # Or manually
   npm run build
   NODE_ENV=production node dist/index.js
   ```

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions
- `/server` - Backend Node.js application
  - `/models` - Mongoose models
  - `/controllers` - Request handlers
  - `/db.ts` - Database connection setup
  - `/auth.ts` - Authentication setup
  - `/storage.ts` - Data access layer

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Application environment | development |
| MONGODB_URI | MongoDB connection string | N/A (uses in-memory MongoDB in development) |
| SESSION_SECRET | Secret key for session encryption | dev-blog-secret-key (only in development) |
| PORT | Server port | 5000 |

## License

MIT