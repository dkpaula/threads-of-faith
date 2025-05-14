// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './components/Login';
import Register from './components/Register';
import BlogPosts from './components/BlogPosts';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import SinglePost from './components/SinglePost';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import { UserContext } from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const { user, logout } = useContext(UserContext);
  const isAuthenticated = !!user;

  return (
    <Router>
      <Navbar />

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/blogposts" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/blogposts" />} />
          <Route path="/blogposts" element={isAuthenticated ? <BlogPosts /> : <Navigate to="/login" />} />
          <Route path="/createpost" element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />} />
          <Route path="/post/:id" element={isAuthenticated ? <SinglePost /> : <Navigate to="/login" />} />
          <Route path="/edit/:id" element={isAuthenticated ? <EditPost /> : <Navigate to="/login" />} />
          <Route path="/logout" element={<LogoutRoute logout={logout} />} />
        </Routes>
      </Container>

      <footer className="footer mt-5 py-3 bg-light">
        <Container className="text-center">
          <span className="text-muted">© 2025 Threads of Faith. All rights reserved.</span>
        </Container>
      </footer>
    </Router>
  );
}

// Simple component to handle logout
function LogoutRoute({ logout }) {
  logout();
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  return <Navigate to="/" />;
}

export default App;