import React, { useEffect, useState } from 'react';
import { PresenceService } from '../../services/PresenceService';
import './UserPresence.css';

function UserPresence({ userId }) {
  const [presenceStatus, setPresenceStatus] = useState('offline');
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    const unsubscribe = PresenceService.getUserPresence(userId, (status) => {
      setPresenceStatus(status.state);
      setLastSeen(status.lastChanged?.toDate());
    });

    return () => unsubscribe();
  }, [userId]);

  const getLastSeenText = () => {
    if (presenceStatus === 'online') return 'Online';
    if (!lastSeen) return 'Offline';
    
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Last seen ${days} days ago`;
    if (hours > 0) return `Last seen ${hours} hours ago`;
    if (minutes > 0) return `Last seen ${minutes} minutes ago`;
    return 'Just now';
  };

  return (
    <div className={`presence-indicator ${presenceStatus}`}>
      <span className="presence-dot"></span>
      <span className="presence-text">{getLastSeenText()}</span>
    </div>
  );
}

export default UserPresence; 