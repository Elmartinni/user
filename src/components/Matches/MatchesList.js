import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './MatchesList.css';

function MatchesList() {
  const [matches, setMatches] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('users', 'array-contains', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const matchPromises = querySnapshot.docs.map(async (doc) => {
        const matchData = doc.data();
        const otherUserId = matchData.users.find(id => id !== currentUser.uid);
        
        // Get other user's profile
        const userDoc = await getDocs(doc(db, 'users', otherUserId));
        const userData = userDoc.data();

        return {
          id: doc.id,
          ...matchData,
          otherUser: {
            id: otherUserId,
            ...userData
          }
        };
      });

      const matchesWithProfiles = await Promise.all(matchPromises);
      setMatches(matchesWithProfiles);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <div className="matches-container">
      <h2>Your Matches</h2>
      <div className="matches-grid">
        {matches.map((match) => (
          <Link 
            to={`/chat/${match.id}`} 
            key={match.id}
            className="match-card"
          >
            <img 
              src={match.otherUser.photoURL || 'default-avatar.png'} 
              alt={match.otherUser.displayName}
              className="match-avatar"
            />
            <div className="match-info">
              <h3>{match.otherUser.displayName}</h3>
              <p>{match.otherUser.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MatchesList; 