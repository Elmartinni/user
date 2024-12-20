import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const user = auth.currentUser;

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/dashboard">Dating App</Link>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/matching" 
          className={location.pathname === '/matching' ? 'active' : ''}
        >
          Discover
        </Link>
        <Link 
          to="/matches" 
          className={location.pathname === '/matches' ? 'active' : ''}
        >
          Matches
        </Link>
        <Link 
          to="/notifications" 
          className={location.pathname === '/notifications' ? 'active' : ''}
        >
          Notifications
        </Link>
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
        >
          Profile
        </Link>
        <Link 
          to="/preferences" 
          className={location.pathname === '/preferences' ? 'active' : ''}
        >
          Settings
        </Link>
      </div>

      <div className="nav-profile">
        <img 
          src={user?.photoURL || '/default-avatar.png'} 
          alt="Profile" 
          className="nav-avatar"
        />
      </div>
    </nav>
  );
}

export default Navigation; 