import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import './Matching.css';

function Matching() {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      // Get user preferences from their profile
      const userDoc = await getDocs(doc(db, 'users', currentUser.uid));
      const userPreferences = userDoc.data().preferences || {};

      // Query users based on preferences
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('gender', '==', userPreferences.interestedIn),
        where('age', '>=', userPreferences.ageRange.min),
        where('age', '<=', userPreferences.ageRange.max)
      );

      const querySnapshot = await getDocs(q);
      const matches = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) { // Exclude current user
          matches.push({ id: doc.id, ...doc.data() });
        }
      });
      setPotentialMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleLike = async () => {
    try {
      const likedUser = potentialMatches[currentProfile];
      
      // Add to likes collection
      await addDoc(collection(db, 'likes'), {
        userId: currentUser.uid,
        likedUserId: likedUser.id,
        timestamp: new Date()
      });

      // Check if it's a match
      const matchQuery = query(
        collection(db, 'likes'),
        where('userId', '==', likedUser.id),
        where('likedUserId', '==', currentUser.uid)
      );

      const matchSnapshot = await getDocs(matchQuery);
      
      if (!matchSnapshot.empty) {
        // It's a match!
        await addDoc(collection(db, 'matches'), {
          users: [currentUser.uid, likedUser.id],
          timestamp: new Date()
        });
        alert("It's a match!");
      }

      // Move to next profile
      setCurrentProfile(prev => prev + 1);
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handlePass = () => {
    setCurrentProfile(prev => prev + 1);
  };

  if (potentialMatches.length === 0) {
    return <div className="no-matches">No more profiles to show!</div>;
  }

  if (currentProfile >= potentialMatches.length) {
    return <div className="no-matches">You've seen all profiles for now!</div>;
  }

  const currentMatch = potentialMatches[currentProfile];

  return (
    <div className="matching-container">
      <div className="profile-card">
        <img 
          src={currentMatch.photoURL || 'default-avatar.png'} 
          alt="Profile" 
          className="profile-image"
        />
        <div className="profile-info">
          <h2>{currentMatch.displayName}, {currentMatch.age}</h2>
          <p>{currentMatch.bio}</p>
          <p>{currentMatch.location}</p>
        </div>
        <div className="action-buttons">
          <button onClick={handlePass} className="pass-button">
            Pass
          </button>
          <button onClick={handleLike} className="like-button">
            Like
          </button>
        </div>
      </div>
    </div>
  );
}

export default Matching; 