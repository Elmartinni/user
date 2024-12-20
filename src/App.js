import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Matching from './components/Matching/Matching';
import MatchesList from './components/Matches/MatchesList';
import Chat from './components/Chat/Chat';
import Notifications from './components/Notifications/Notifications';
import UserPreferences from './components/UserPreferences/UserPreferences';
import Navigation from './components/Layout/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Navigation /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="matching" element={<Matching />} />
              <Route path="matches" element={<MatchesList />} />
              <Route path="chat/:matchId" element={<Chat />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="preferences" element={<UserPreferences />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;