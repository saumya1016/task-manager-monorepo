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
import WorkspaceManagePage from './pages/WorkspaceManagePage'; // ✅ ADDED THIS
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

        {/* ✅ FEEDBACK ROUTE */}
        <Route path="/feedback" element={<FeedbackView />} />

        {/* ProjectBoard handles the actual board view */}
        <Route path="/board/:id" element={<ProjectBoard />} />
        
        {/* ✅ NEW: WORKSPACE MANAGEMENT ROUTE */}
        {/* This allows viewing member details and admin actions on a dedicated page */}
        <Route path="/workspace/:id/manage" element={<WorkspaceManagePage />} />

        {/* Support the Join Link */}
        <Route path="/join/:id" element={<JoinBoard />} />

        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;