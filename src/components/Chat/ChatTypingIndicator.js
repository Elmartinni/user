import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import './ChatTypingIndicator.css';

function ChatTypingIndicator({ matchId, userId }) {
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const typingRef = doc(db, `matches/${matchId}/typing/${userId}`);
    return onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsTyping(data.isTyping && Date.now() - data.timestamp < 3000);
      }
    });
  }, [matchId, userId]);

  return isTyping ? (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  ) : null;
}

export default ChatTypingIndicator; 