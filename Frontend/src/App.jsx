import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProjectBoard from './pages/ProjectBoard';
import ProfilePage from './pages/ProfilePage'; 
import Dashboard from './pages/Dashboard';
import JoinBoard from './pages/JoinBoard'; 
import MyTasks from './pages/MyTasks';
import FeedbackView from './components/FeedbackView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard is the main hub */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/mytasks" element={<MyTasks />} />

        {/* ✅ 2. ADD THE FEEDBACK ROUTE */}
        <Route path="/feedback" element={<FeedbackView />} />

        {/* ProjectBoard handles the actual board view */}
        <Route path="/board/:id" element={<ProjectBoard />} />
        
        {/* Support the Join Link */}
        <Route path="/join/:id" element={<JoinBoard />} />

        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;