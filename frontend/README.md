# GEU-Connect - Academic Networking Platform

A modern, fully navigable frontend prototype for an academic networking platform built with React.js, Tailwind CSS, and React Router.

## Features

- **Landing Page** - Professional hero section with feature cards
- **Authentication Pages** - Login and Register (UI only, no backend)
- **Dashboard** - Overview with stats, recent activity, and quick actions
- **Profile** - LinkedIn-style profile showcasing with skills and badges
- **Feed** - Interactive post creation with like, comment, and share functionality
- **Projects** - Browse and join academic research projects
- **Forum** - Three-tier discussion forum (Student, Professor, Combined)
- **Rankings** - Leaderboard with reputation points and badges
- **Interviews** - Interview management with upcoming and completed sections

## Tech Stack

- React.js (Functional Components)
- JavaScript (No TypeScript)
- Tailwind CSS
- React Router
- Static dummy data (No backend/API)

## Installation

```bash
cd geu-connect
npm install
```

## Running the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
geu-connect/
├── src/
│   ├── components/        # Reusable components
│   │   ├── PostCard.js
│   │   ├── ProfileHeader.js
│   │   └── ProjectCard.js
│   ├── layout/           # Layout components
│   │   ├── DashboardLayout.js
│   │   ├── Navbar.js
│   │   └── Sidebar.js
│   ├── pages/            # Page components
│   │   ├── Landing.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Profile.js
│   │   ├── Feed.js
│   │   ├── Projects.js
│   │   ├── Forum.js
│   │   ├── Rankings.js
│   │   └── Interviews.js
│   ├── data/             # Static dummy data
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── projects.js
│   │   ├── forums.js
│   │   └── interviews.js
│   ├── App.js
│   └── index.js
```

## Navigation Flow

1. **Landing Page** (`/`) - Start here
2. **Login** (`/login`) or **Register** (`/register`) - Authentication pages
3. After login, access:
   - **Dashboard** (`/dashboard`) - Main overview
   - **My Profile** (`/profile`) - User profile
   - **Feed** (`/feed`) - Activity feed with posts
   - **Projects** (`/projects`) - Research projects
   - **Forum** (`/forum`) - Discussion forums
   - **Rankings** (`/rankings`) - Leaderboard
   - **Interviews** (`/interviews`) - Interview management

## Interactive Features

- **Like/Unlike Posts** - Click the like button to increment/decrement
- **Comment on Posts** - Toggle comments and add new ones
- **Create Posts** - Write and publish new posts in the feed
- **Forum Tabs** - Switch between Student, Professor, and Combined forums
- **Responsive Design** - Works on mobile, tablet, and desktop

## Notes

- This is a frontend prototype only - no backend, authentication, or database
- All data is static and stored in `/src/data/` files
- Authentication pages are visual only and redirect to dashboard on submit
- Perfect for academic evaluation and demonstration purposes

## Team

- Aman Devrani (Team Lead)
- Atharv Bali
- Muskaan Pant
- Anshu Gupta

## License

Academic Project - GEU Phase 1
