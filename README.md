# UNI-Connect 

**UNI-Connect** is a full-stack academic networking platform designed exclusively for students and professors at Indian Universities. It facilitates collaboration, knowledge sharing, and professional networking within the university community.

---

## Features

### 1. **User Authentication**
- Secure registration and login system
- Email validation (only university emails allowed)
- Role-based access (Student/Professor)
- JWT-based authentication

### 2. **Feed (Social Posts)**
- Create posts with text and multiple images (up to 4)
- Like and comment on posts
- Edit and delete your own posts
- Real-time feed updates
- Image upload with base64 encoding

### 3. **Projects**
- Create and manage research/collaboration projects
- Tech stack tagging
- Project status: Open or Closed
- Join request system with approval workflow
- View requester profiles (posts and projects)
- Schedule interviews with requesters
- Auto-add tech stack skills to user profile
- Edit, close, or delete your own projects

### 4. **Discussion Forums**
- Ask questions with title, description, and tags
- Answer questions from the community
- Mark answers as accepted
- Edit and delete your own questions
- Delete your own answers
- Image support for questions

### 5. **Interview System**
- Schedule interviews with other users
- Accept, decline, or propose new time
- Negotiation workflow for interview timing
- Google Meet integration
- Interview status tracking (Pending, Accepted, Declined, Completed)
- View upcoming and past interviews

### 6. **Profile Management**
- View user profile with reputation points
- Display skills (auto-added from projects)
- View user's posts
- Active projects count

### 7. **Dashboard**
- Welcome screen with user stats
- Quick action buttons
- Recent activity feed
- Progress tracking

---

## Database Collections

### 1. **Users Collection**
**Purpose:** Store user account information and profile data

**Schema:**
```javascript
{
  fullName: String,           // User's full name
  email: String,              // UNI email for example @geu.ac.in
  password: String,           // Hashed password (bcrypt)
  role: String,               // 'Student' or 'Professor'
  reputationPoints: Number,   // User reputation (default: 0)
  skills: [String],           // Array of skills
  activeProjects: [ObjectId], // References to Project collection
  timestamps: true            // createdAt, updatedAt
}
```

**Why:** Central user management, authentication, and profile data storage.

---

### 2. **Posts Collection**
**Purpose:** Store social media posts created by users

**Schema:**
```javascript
{
  user: ObjectId,             // Reference to User who created post
  content: String,            // Post text content
  imageURL: String,           // Legacy single image field
  images: [String],           // Array of base64 image strings
  likes: [{                   // Array of users who liked
    user: ObjectId
  }],
  comments: [{                // Array of comments
    user: ObjectId,
    text: String,
    date: Date
  }],
  createdAt: Date             // Post creation timestamp
}
```

**Why:** Enable social networking features like sharing updates, images, and engaging through likes/comments.

---

### 3. **Projects Collection**
**Purpose:** Store research and collaboration projects

**Schema:**
```javascript
{
  user: ObjectId,             // Project owner (creator)
  title: String,              // Project title
  description: String,        // Project description
  techStack: [String],        // Technologies used
  status: String,             // 'Open' or 'Closed'
  isResearchProject: Boolean, // Research project flag
  joinRequests: [{            // Array of join requests
    user: ObjectId,
    status: String,           // 'pending', 'accepted', 'rejected'
    message: String,
    createdAt: Date
  }],
  members: [ObjectId],        // Accepted project members
  timestamps: true            // createdAt, updatedAt
}
```

**Why:** Facilitate project collaboration, team building, and skill-based matching.

---

### 4. **Forums Collection**
**Purpose:** Store discussion forum questions and answers

**Schema:**
```javascript
{
  user: ObjectId,             // Question author
  title: String,              // Question title
  description: String,        // Question details
  imageURL: String,           // Optional image
  tags: [String],             // Topic tags
  answers: [{                 // Array of answers
    user: ObjectId,
    text: String,
    isAccepted: Boolean,      // Marked as correct answer
    createdAt: Date
  }],
  createdAt: Date             // Question creation timestamp
}
```

**Why:** Enable knowledge sharing, doubt clearing, and community-driven learning.

---

### 5. **Interviews Collection**
**Purpose:** Store interview scheduling and management data

**Schema:**
```javascript
{
  student: ObjectId,          // Interview requester
  interviewer: ObjectId,      // Interview receiver
  title: String,              // Interview topic
  type: String,               // Interview type
  date: Date,                 // Scheduled date
  time: String,               // Scheduled time
  meetingLink: String,        // Google Meet link
  status: String,             // 'Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled'
  proposedDateTime: {         // Alternative time proposal
    date: Date,
    time: String
  },
  proposedBy: ObjectId,       // Who proposed the alternative
  createdAt: Date             // Request creation timestamp
}
```

**Why:** Facilitate professional networking, mentorship, and project discussions through structured interviews.

---

## How Each Functionality Works

### **1. Authentication Flow**
```
User Registration → Email Validation for example @geu.ac.in → Password Hashing (bcrypt) 
→ Store in Users Collection → Return JWT Token

User Login → Email/Password Verification → Compare Hashed Password 
→ Generate JWT Token → Store in localStorage → Access Protected Routes
```

---

### **2. Feed (Posts) Flow**
```
CREATE POST:
User writes content + uploads images → Convert images to base64 
→ Send to backend → Store in Posts Collection → Populate user details 
→ Return to frontend → Display in feed

LIKE POST:
User clicks like → Send POST request with postId 
→ Add userId to likes array → Return updated post

COMMENT:
User writes comment → Send POST request → Add to comments array 
→ Return updated post → Display comment

EDIT POST:
Owner clicks edit → Open modal with existing data → Modify content/images 
→ Send PUT request → Update Posts Collection → Refresh feed

DELETE POST:
Owner clicks delete → Confirm dialog → Send DELETE request 
→ Remove from Posts Collection → Remove from UI
```

---

### **3. Projects Flow**
```
CREATE PROJECT:
User fills form (title, description, techStack, status) 
→ Send POST request → Store in Projects Collection 
→ Auto-add techStack to user's skills → Return project

JOIN REQUEST:
Non-owner clicks "Request to Join" → Send POST request with message 
→ Add to joinRequests array (status: pending) → Notify owner

HANDLE REQUEST:
Owner views requests → Clicks "View Profile" (see user's posts/projects) 
→ Clicks "Schedule Interview" OR "Reject"
→ Update request status OR create Interview document

SCHEDULE INTERVIEW:
Owner fills interview form (date, time, meetLink, topic) 
→ Create Interview document → Auto-accept join request 
→ Both users see interview in Interviews page

CLOSE PROJECT:
Owner clicks close → Confirm dialog → Update status to 'Closed' 
→ Disable join requests → Project still visible

EDIT/DELETE:
Owner clicks edit → Modal with existing data → Update project
Owner clicks delete → Confirm dialog → Remove from collection
```

---

### **4. Discussion Forums Flow**
```
ASK QUESTION:
User fills form (title, description, tags, optional image) 
→ Send POST request → Store in Forums Collection → Display in forum list

ANSWER QUESTION:
User writes answer → Send POST request → Add to answers array 
→ Populate user details → Display under question

MARK AS ACCEPTED:
Question owner clicks "Mark as Accepted" on an answer 
→ Set isAccepted: true → Display green checkmark

EDIT QUESTION:
Owner clicks edit → Modal with existing data → Modify fields 
→ Send PUT request → Update Forums Collection

DELETE QUESTION/ANSWER:
Owner clicks delete → Confirm dialog → Send DELETE request 
→ Remove from collection (question) or answers array (answer)
```

---

### **5. Interview System Flow**
```
SCHEDULE INTERVIEW:
User A sends interview request to User B 
→ Create Interview document (status: Pending, student: A, interviewer: B) 
→ Store date, time, meetLink, title

RECEIVE REQUEST (User B):
View in "Pending Requests" section → Three options:
1. ACCEPT → Update status to 'Accepted' → Move to "Upcoming Interviews"
2. DECLINE → Update status to 'Declined' → Remove from pending
3. PROPOSE NEW TIME → Set proposedDateTime, proposedBy: B → Notify User A

PROPOSED TIME (User A):
See proposed time → Click "Accept Proposed Time" 
→ Update date/time to proposed values → Set status to 'Accepted'

MARK COMPLETE:
After interview → Either party clicks "Mark Complete" 
→ Update status to 'Completed' → Move to "Past Interviews"
```

---

### **6. Skills Auto-Addition Flow**
```
User creates project with techStack: ['React', 'Node.js', 'MongoDB']
→ Backend extracts techStack array 
→ Check user's existing skills 
→ Add new skills (case-insensitive, no duplicates) 
→ Update User document → Display on profile
```

---

### **7. Profile Management Flow**
```
VIEW PROFILE:
Fetch current user data → Fetch user's posts (filter by userId) 
→ Display profile header (name, email, role, reputation, skills) 
→ Display user's posts below

EDIT PROFILE (Removed):
Previously allowed editing fullName and skills
Now removed from UI for simplicity
```

---

## Tech Stack

### **Frontend**
- React.js
- React Router (navigation)
- Tailwind CSS (styling)
- Axios (API calls)
- Context API (state management)

### **Backend**
- Node.js
- Express.js
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)

---

## Project Structure

```
geu-connect/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── projectController.js
│   │   ├── forumController.js
│   │   └── interviewController.js
│   ├── models/           # Database schemas
│   │   ├── User.js
│   │   ├── Posts.js
│   │   ├── Project.js
│   │   ├── Forum.js
│   │   └── Interview.js
│   ├── routes/           # API endpoints
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── forumRoutes.js
│   │   └── interviewRoutes.js
│   ├── middleware/       # Auth middleware
│   │   └── auth.js
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── PostCard.js
│   │   │   ├── ProjectCard.js
│   │   │   ├── ProfileHeader.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/      # Global state
│   │   │   └── AuthContext.js
│   │   ├── pages/        # Main pages
│   │   │   ├── Landing.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Feed.js
│   │   │   ├── Projects.js
│   │   │   ├── Forum.js
│   │   │   ├── Interviews.js
│   │   │   └── Profile.js
│   │   ├── services/     # API service
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### **Prerequisites**
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start backend:
```bash
npm start
```

### **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

---

## Security Features

1. **Email Validation:** Only university assigned emails allowed
2. **Password Hashing:** bcrypt with salt rounds
3. **JWT Authentication:** Secure token-based auth
4. **Protected Routes:** Middleware checks for valid tokens
5. **Input Validation:** Server-side validation for all inputs
6. **CORS Configuration:** Controlled cross-origin requests

---

## API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### **Posts**
- `GET /api/posts` - Get all posts (feed)
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `GET /api/posts/user/:userId` - Get user's posts

### **Projects**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/request` - Request to join
- `PUT /api/projects/:id/requests/:requestId` - Handle join request
- `GET /api/projects/user/:userId` - Get user's projects

### **Forums**
- `GET /api/forum` - Get all questions
- `POST /api/forum` - Ask question
- `PUT /api/forum/:id` - Update question
- `DELETE /api/forum/:id` - Delete question
- `POST /api/forum/:id/answer` - Add answer
- `DELETE /api/forum/:id/answer/:answerId` - Delete answer

### **Interviews**
- `GET /api/interviews` - Get user's interviews
- `POST /api/interviews` - Schedule interview
- `PUT /api/interviews/:id/respond` - Accept/Decline/Propose
- `PUT /api/interviews/:id/accept-proposed` - Accept proposed time
- `PUT /api/interviews/:id/complete` - Mark as complete

---

## User Roles

### **Student**
- Create posts, projects, forum questions
- Join projects, answer questions
- Schedule and participate in interviews
- Build profile with skills and reputation

### **Professor**
- All student features
- Mentor students through interviews
- Guide project collaborations
- Share expertise in forums

---

## Key Workflows

### **Project Collaboration Workflow**
1. Student creates project with tech stack
2. Other students see project and request to join
3. Owner reviews requester's profile (posts/projects)
4. Owner schedules interview to discuss
5. After interview, owner accepts/rejects request
6. Accepted members join project team

### **Interview Negotiation Workflow**
1. User A sends interview request with date/time
2. User B receives request (Pending)
3. User B can: Accept, Decline, or Propose new time
4. If proposed, User A sees new time and can accept
5. Once accepted, both see in Upcoming Interviews
6. After interview, mark as Complete

### **Knowledge Sharing Workflow**
1. Student posts doubt in Discussion Forum
2. Community members provide answers
3. Question owner reviews answers
4. Best answer marked as "Accepted"
5. Future students benefit from archived Q&A

---

## Known Limitations

1. No real-time notifications (future enhancement)
2. No file attachments (only images via base64)
3. No direct messaging between users
4. No email notifications for interview requests
5. Limited search/filter functionality

---

## Future Enhancements

- Real-time chat system
- Push notifications
- Advanced search and filters
- File upload support (PDFs, documents)
- Reputation point system based on contributions
- Project milestone tracking
- Calendar integration for interviews
- Mobile app (React Native)

---

## License

This project is developed for Indian Universities and is intended for educational purposes.

---

## Developer Notes

- All passwords are hashed using bcrypt before storage
- JWT tokens expire after 30 days
- Images are stored as base64 strings (max 50MB request size)
- MongoDB indexes on email field for faster queries
- Populate() used extensively for user references
- CORS enabled for frontend-backend communication

---
Built with ❤️ to empower the educational community through collaboration, learning, and innovation.
---

