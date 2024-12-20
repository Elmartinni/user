import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-profile">
          <img 
            src={user?.photoURL || 'default-avatar.png'} 
            alt="Profile" 
            className="nav-avatar"
          />
          <span>{user?.displayName || 'User'}</span>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/dashboard" className="nav-link active">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </nav>

      <main className="dashboard-content">
        <h1>Welcome, {user?.displayName || 'User'}!</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Email Status</h3>
            <p>{user?.emailVerified ? 'Verified' : 'Not Verified'}</p>
          </div>
          <div className="stat-card">
            <h3>Last Login</h3>
            <p>{new Date(user?.metadata?.lastSignInTime).toLocaleDateString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 