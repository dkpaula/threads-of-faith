# Threads of Faith

A Christian blog application built with the MERN stack (MongoDB, Express, React, Node.js).

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Setup Instructions](#setup-instructions)
5. [Folder Structure](#folder-structure)
6. [Code Explanation](#code-explanation)
7. [Challenges Faced](#challenges-faced)
8. [Future Improvements](#future-improvements)

## Project Overview
Threads of Faith is a blog platform designed for sharing Christian content. It features user authentication, blog post creation and management, and a responsive design with a maroon/gold color palette reflecting the Christian theme.

## Features
- User authentication (register, login, logout)
- Create, read, update, and delete blog posts
- Responsive design with Bootstrap
- Protected routes for authenticated users
- Custom styling with Christian-themed colors and fonts (Playfair Display and Lora)
- Bible verse display on homepage

## Technologies Used
- **Frontend**: React, React Router, Bootstrap, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Other**: Axios, bcrypt, multer (for image uploads)

## Setup Instructions

```bash
# 1. Clone the Repository
git clone https://github.com/dkpaula/threads-of-faith.git
cd threads-of-faith

# 2. Install Backend Dependencies
cd backend
npm install

# 3. Configure Backend Environment
# Create a .env file in the backend directory with:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/threadsoffaith
JWT_SECRET=your_secure_jwt_secret_key
PORT=4001

# 4. Install Frontend Dependencies
cd ../frontend
npm install

# 5. Start the Backend Server
# In the backend directory
npm start

# 6. Start the Frontend Development Server (in a new terminal)
# In the frontend directory
npm start
```

## Folder Structure

### Backend
```
backend/
├── config/               # Configuration files
│   └── db.js             # MongoDB connection setup
├── controllers/          # Request handlers
│   ├── authController.js # Authentication logic
│   └── postController.js # Blog post CRUD operations
├── middleware/           # Custom middleware
│   └── authMiddleware.js # JWT verification
├── models/               # Mongoose schemas
│   ├── Post.js           # Blog post model
│   └── User.js           # User model
├── routes/               # API routes
│   ├── authRoutes.js     # Login/register endpoints
│   └── postRoutes.js     # Blog post endpoints
├── uploads/              # Uploaded images storage
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── server.js             # Main application entry point
```

### Frontend
```
frontend/
├── public/               # Static files
│   ├── images/           # Image assets
│   └── index.html        # HTML template
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   ├── BlogPosts.js  # Blog listing component
│   │   ├── CreatePost.js # Post creation form
│   │   ├── EditPost.js   # Post editing form
│   │   ├── HomePage.js   # Landing page
│   │   ├── Login.js      # Login form
│   │   ├── Navbar.js     # Navigation bar
│   │   ├── Register.js   # Registration form
│   │   └── SinglePost.js # Individual post view
│   ├── services/         # API service functions
│   ├── styles/           # Component-specific styles
│   ├── App.css           # Global styles
│   ├── App.js            # Main component with routes
│   ├── index.js          # Application entry point
│   └── UserContext.js    # Authentication context
└── package.json          # Dependencies and scripts
```

## Code Explanation

### Backend

#### API Routes
The backend uses Express.js to define RESTful API endpoints:

- **Authentication Routes**: Handle user registration and login
  - `/api/auth/register`: Creates new user accounts with hashed passwords
  - `/api/auth/login`: Validates credentials and issues JWT tokens

- **Blog Post Routes**: Manage CRUD operations for blog posts
  - GET `/api/posts`: Retrieves all posts with pagination
  - POST `/api/posts`: Creates a new blog post
  - GET `/api/posts/:id`: Fetches a specific post by ID
  - PUT `/api/posts/:id`: Updates an existing post (restricted to author)
  - DELETE `/api/posts/:id`: Removes a post (restricted to author)

#### Database Models
MongoDB models using Mongoose ODM:

- **User Model**: Stores user account information
  - Email and password (hashed using bcrypt)
  - Timestamps for account creation
  - Methods for password comparison

- **Post Model**: Represents blog content
  - Title, content fields for blog text
  - Reference to author (User model)
  - Timestamps for creation and updates
  - Optional image URL field for featured images

#### Authentication Middleware
Protects routes requiring login:
  - Extracts JWT token from request headers
  - Verifies token validity and decodes user information
  - Attaches user ID to request object for downstream handlers
  - Rejects unauthorized requests with 401 status

### Frontend

#### React Components
The frontend uses React with functional components and hooks:

- **App.js**: Central component managing routing
  - Uses React Router for navigation
  - Implements protected routes based on authentication state
  - Renders global layout elements like Navbar and Footer

- **HomePage**: Landing page with featured content
  - Displays welcome message with Bible verse
  - Shows featured blog posts
  - Includes custom banner with Threads of Faith branding

- **BlogPosts**: Main content listing
  - Fetches posts from API on component mount
  - Renders list of posts with title, excerpt, and author
  - Implements pagination for large post collections

- **Authentication Components**:
  - Login and Register forms with validation
  - Styled consistently with site's maroon/gold theme
  - Error handling for authentication failures

#### State Management
- **UserContext**: Global authentication state
  - Manages current user information across components
  - Provides login/logout functions to components
  - Persists authentication state across page refreshes using localStorage
  - Includes JWT token management for API requests

- **Component-level State**: Local state for UI interactions
  - Form inputs and validation
  - Loading states during API calls
  - UI toggles for modals, dropdowns, etc.

## Challenges Faced

### Port Conflicts
One of the significant challenges we encountered was port conflict issues when running the backend server. Sometimes the port 4001 would remain occupied even after stopping the application, causing the server to fail on restart.

**Solution**: We implemented a utility script to identify and kill processes using the required port. This ensured that we could reliably restart the server during development.

### Authentication State Management
Initially, we faced issues with authentication state not being consistent across the application. Users would appear logged in on some pages but not others, especially after page refreshes.

**Solution**: We centralized authentication management using React Context API in our UserContext component. This provided a global state that persisted across routes and page refreshes by leveraging localStorage.

### UI Design Customization
Adapting the standard Bootstrap components to match our Christian-themed color palette proved challenging. The default Bootstrap components didn't align with our vision for the site's aesthetic.

**Solution**: We created custom CSS overrides in component-specific style files and incorporated web fonts (Playfair Display and Lora) to achieve the desired look and feel that resonated with the Christian theme.

### Image Handling
Implementing image uploads for blog posts initially resulted in storage and retrieval issues, with images not displaying correctly after being uploaded.

**Solution**: We configured Multer middleware to handle multipart form data and set up a dedicated uploads directory with proper path resolution to ensure images were stored and served correctly.

## Future Improvements
- Comment functionality for blog posts
- User profiles with avatars
- Categories and tags for blog posts
- Search functionality
- Social media sharing
- Enhanced rich text editor for post creation
- Email notification system for new posts
- Prayer request submission form
- Community discussion forums
