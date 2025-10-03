# DrawBoard - Collaborative Whiteboard

A powerful, real-time collaborative whiteboard application built with modern web technologies. Create, share, and collaborate on visual ideas with your team or students.

## ✨ Features

- **Real-time Collaboration**: Multiple users can draw simultaneously with live cursors
- **Drawing Tools**: Comprehensive set of tools including shapes, arrows, text, and freehand drawing
- **Room-based Sessions**: Create private rooms or join public drawing sessions
- **Export Options**: Save your work as PNG, SVG, or JSON
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure sign-in with Google OAuth and manual registration

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, WebSocket
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Fly.io

## 📦 Project Structure

```
client/          # Next.js frontend application
server/          # Backend services
  ├── http-backend/    # REST API server
  ├── ws-backend/      # WebSocket server
  ├── database/        # Prisma database schema
  └── zod-validation/  # Shared validation schemas
```

## 🌐 Live Demo

Visit [https://sketchhub.fly.dev](https://sketchhub.fly.dev) to try the live application.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.
