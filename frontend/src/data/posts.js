export const posts = [
  {
    id: 1,
    userId: 2,
    userName: "Dr. Priya Sharma",
    userRole: "Professor",
    userAvatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=3b82f6&color=fff",
    timestamp: "2 hours ago",
    content: "Excited to announce a new research opportunity in Machine Learning! Looking for 2-3 motivated students to collaborate on a project involving NLP and sentiment analysis. Prerequisites: Python, basic ML knowledge. Comment below if interested!",
    likes: 24,
    reposts: 5,
    comments: [
      {
        id: 1,
        userName: "Aman Devrani",
        userAvatar: "https://ui-avatars.com/api/?name=Aman+Devrani&background=1e40af&color=fff",
        content: "Very interested! I have experience with NLP from my previous project.",
        timestamp: "1 hour ago"
      },
      {
        id: 2,
        userName: "Atharv Bali",
        userAvatar: "https://ui-avatars.com/api/?name=Atharv+Bali&background=6366f1&color=fff",
        content: "Would love to join! Can I schedule a meeting to discuss?",
        timestamp: "45 minutes ago"
      }
    ]
  },
  {
    id: 2,
    userId: 1,
    userName: "Aman Devrani",
    userRole: "Student",
    userAvatar: "https://ui-avatars.com/api/?name=Aman+Devrani&background=1e40af&color=fff",
    timestamp: "5 hours ago",
    content: "Just completed my full-stack project on student management system using MERN stack! Learned a lot about authentication, state management, and deployment. Happy to help anyone working on similar projects. 🚀",
    image: "https://via.placeholder.com/600x300/1e40af/ffffff?text=MERN+Stack+Project",
    likes: 42,
    reposts: 8,
    comments: [
      {
        id: 1,
        userName: "Muskaan Pant",
        userAvatar: "https://ui-avatars.com/api/?name=Muskaan+Pant&background=8b5cf6&color=fff",
        content: "Congratulations! Would you mind sharing the GitHub repo?",
        timestamp: "3 hours ago"
      }
    ]
  },
  {
    id: 3,
    userId: 4,
    userName: "Muskaan Pant",
    userRole: "Student",
    userAvatar: "https://ui-avatars.com/api/?name=Muskaan+Pant&background=8b5cf6&color=fff",
    timestamp: "1 day ago",
    content: "Looking for team members for an upcoming hackathon! Need backend developers and someone good with APIs. Theme is EdTech. DM if interested!",
    likes: 18,
    reposts: 3,
    comments: []
  }
];
