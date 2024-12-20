import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import './UserBlock.css';

function UserBlock({ userId, onBlock }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  const handleBlock = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for blocking');
      return;
    }

    setLoading(true);
    try {
      // Add to blocked users collection
      await setDoc(doc(db, `users/${currentUser.uid}/blocked`, userId), {
        reason,
        timestamp: new Date(),
      });

      // Remove any existing matches
      await deleteDoc(doc(db, 'matches', `${currentUser.uid}_${userId}`));
      await deleteDoc(doc(db, 'matches', `${userId}_${currentUser.uid}`));

      // Create a report
      await setDoc(doc(collection(db, 'reports')), {
        reporterId: currentUser.uid,
        reportedId: userId,
        reason,
        timestamp: new Date(),
        status: 'pending'
      });

      onBlock && onBlock();
      alert('User has been blocked and reported');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error blocking user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="block-container">
      <h3>Block User</h3>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Please provide a reason for blocking this user..."
        className="block-reason"
      />
      <button 
        onClick={handleBlock} 
        disabled={loading}
        className="block-button"
      >
        {loading ? 'Processing...' : 'Block User'}
      </button>
    </div>
  );
}

export default UserBlock; 