Threads of Faith - MERN Stack Blog
Term Paper Documentation
Author: Danna Paula Llagas
Course: 2nd Year - BS Information Technology

1. Project Overview
Threads of Faith is a full-stack blog application built with the MERN stack that allows users to create, read, update, and delete blog posts, as well as interact with them through comments and likes.
•	Main Features
•	User authentication (register, login, logout)
•	Create, edit, and delete blog posts
•	Rich text editor with image upload
•	Comment on posts with edit/delete functionality
•	Like/unlike posts
•	Mobile-responsive design
•	Category and tag filtering
•	User-friendly interface

2. Technologies Used
Backend
•	MongoDB - NoSQL database
•	Express.js - Web framework for Node.js
•	Node.js - JavaScript runtime
•	Mongoose - MongoDB object modeling
•	JWT - JSON Web Tokens for authentication
•	Multer - File upload middleware
•	Bcrypt - Password hashing
Frontend
•	React - Frontend library
•	React Router - Navigation
•	React Bootstrap - UI components
•	Axios - HTTP client
•	React Quill - Rich text editor
•	Bootstrap 5 - CSS framework
•	JWT-decode - JWT token parsing
•	DOMPurify - HTML sanitization
 
3. Setup Instructions
Prerequisites
•	Node.js (v14.0.0 or higher)
•	npm (v6.0.0 or higher)
•	MongoDB account (for database connection)
•	Git
Installation Steps
Clone the Repository
git clone https://github.com/dkpaula/threads-of-faith.git
cd threads-of-faith
Install Backend Dependencies
cd backend
npm install
Configure Backend Environment
Create a .env file in the backend directory with the following variables:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mern-blog
JWT_SECRET=JWT_SECRET=Gq8Xz#1FpYjM9m$uYn3mKmQy&uP8ZzHv7fF$8G4vY%9s
Install Frontend Dependencies
cd ../frontend
npm install
Start the Application
•	Start the backend server:
# In the backend directory
npm start
•	Start the frontend development server:
# In the frontend directory
npm start
Access the Application
•	Backend API will be running at: http://localhost:4001
•	Frontend will be accessible at: http://localhost:3000
Troubleshooting
•	If port 4001 is already in use, you can change it in the .env file
•	Ensure MongoDB connection string is correct with proper credentials

4. Folder Structures

Backend
backend/
├── config/               
│   └── db.js             
├── controllers/          
│   ├── authController.js 
│   └── postController.js 
├── middleware/           
│   └── authMiddleware.js 
├── models/               
│   ├── Post.js           
│   └── User.js           
├── routes/               
│   ├── authRoutes.js     
│   └── postRoutes.js    
├── .env                  
├── package.json          
└── server.js             
 
Frontend
frontend/
├── public/               
│   ├── images/           
│   └── index.html        
├── src/                  
│   ├── components/       
│   │   ├── BlogPosts.js  
│   │   ├── CreatePost.js 
│   │   ├── EditPost.js   
│   │   ├── HomePage.js   
│   │   ├── Login.js      
│   │   ├── Navbar.js     
│   │   ├── Register.js   
│   │   └── SinglePost.js 
│   ├── App.css           
│   ├── App.js            
│   ├── index.js          
│   └── UserContext.js    
├── package.json          
└── .env                  



5. Code Explanation
BACKEND
API Routes
•	Authentication Routes (authRoutes.js):
o	POST /api/auth/register:
Creates new user accounts. It checks for unique email addresses, hashes passwords using bcrypt, and returns a JWT token upon successful registration.
o	POST /api/auth/login:
Verifies user credentials by comparing hashed passwords and issues a JWT token for authenticated sessions.
•	Blog Post Routes (postRoutes.js):
o	GET /api/posts:
Retrieves all blog posts with optional filtering and pagination. This route is protected using authentication middleware.
o	POST /api/posts:
Creates a new blog post, associating it with the currently authenticated user.
o	GET /api/posts/:id:
Fetches a specific blog post using its MongoDB ObjectId.
o	PUT /api/posts/:id:
Updates a blog post if the current user is its original author.
o	DELETE /api/posts/:id:
Deletes a blog post if the current user is authorized.

Database Models
•	User Model (User.js):
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

o	Stores email and hashed password.
o	Uses Mongoose pre-save middleware to hash the password before saving.
o	Provides methods for comparing password hashes during login.

•	Post Model (Post.js):
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
o	Stores blog post data.
o	Links posts to users via the author field.
o	Tracks when the post was created and last updated.

Middleware
•	Authentication Middleware (authMiddleware.js):
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
o	Extracts JWT from the Authorization header.
o	Verifies its validity using a secret key.
o	Attaches user ID to the request object for downstream access control.
o	Blocks unauthorized requests.
 
FRONTEND
React Components
•	App.js:
function App() {
  const { user } = useContext(UserContext);
  return (
    <Router>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/blogposts" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/blogposts" />} />
          <Route path="/blogposts" element={user ? <BlogPosts /> : <Navigate to="/login" />} />
          <Route path="/createpost" element={user ? <CreatePost /> : <Navigate to="/login" />} />
          <Route path="/post/:id" element={user ? <SinglePost /> : <Navigate to="/login" />} />
          <Route path="/edit/:id" element={user ? <EditPost /> : <Navigate to="/login" />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
}
o	Defines routes using React Router.
o	Protects specific routes based on login state using <Navigate />.

•	BlogPosts.js:
function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4001/api/posts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  return (
    <div className="blog-posts">
      {loading ? <Spinner /> : (
        posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))
      )}
    </div>
  );
}
o	Fetches all blog posts from the backend.
o	Uses a loading spinner until data is ready.
o	Maps post data into PostCard components.

•	CreatePost.js:
function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      navigate('/blogposts');
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Content</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={10} 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
        />
      </Form.Group>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" type="submit">Create Post</Button>
    </Form>
  );
}
o	Renders a form to create a new blog post.
o	Uses form validation and error handling.
o	Makes an authenticated API call to submit the post.


State Management
•	UserContext.js:
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    const response = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.email);
      setUser({ email: data.email });
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };
  
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setUser({ email: userEmail });
    }
  }, []);
  
  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
o	Provides app-wide authentication state.
o	Stores and retrieves login data using localStorage.
o	Supplies login and logout functions for child components.
 

6. Challenges Faced
1.	Port Conflicts
Multiple server instances occasionally attempted to run on the same port, resulting in connection errors and application crashes.
Solution: Implemented proper environment variable configuration and created a utility script (kill-server.sh) to detect and terminate processes using commonly occupied ports (e.g., 3000, 4000).
2.	Mobile API Connection
Mobile devices on different networks experienced connectivity issues due to hardcoded API URLs.
Solution: Added dynamic API URL detection that identifies whether the client is accessing from the same machine or a different device, enabling seamless external connectivity.
3.	Comment Deletion
The initial implementation used outdated MongoDB methods for removing comment subdocuments.
Solution: Updated the logic to use the current pull() method in Mongoose, ensuring compatibility and proper subdocument management.
4.	React Hook Dependencies
ESLint flagged missing dependencies in useEffect hooks, which could lead to subtle and hard-to-diagnose bugs.
Solution: Refactored the components to correctly use useCallback and included all necessary dependencies in each hook.

7. Future Improvements
•	User Profiles
Implement customizable profiles with avatars, display names, and biographical information.
•	Notifications
Add a notification system for interactions such as comments, likes, and replies.
•	Advanced Search
Develop filtering and sorting options based on tags, relevance, date, and popularity.
•	Dark Mode
Provide theme-switching functionality with support for dark mode.
•	Threaded Comments
Enable nested replies to improve comment structure and conversation flow.
•	Social Sharing
Integrate social media sharing options for platforms like Facebook, Twitter, and LinkedIn.
•	Bookmark Feature
Allow users to save posts to a personal reading list for future reference.
•	Content Drafts
Support creating drafts and scheduling posts for future publication.
•	Admin Dashboard
Build a dedicated administrative panel for content moderation, user management, and analytics. 

8. Screenshots
10. Development Photos
 
