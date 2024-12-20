import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, orderBy, addDoc, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './Chat.css';
import { EncryptionService } from '../../services/EncryptionService';
import UserPresence from '../Presence/UserPresence';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

function Chat({ matchId, otherUser }) {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId || !otherUser) {
      console.error('Missing required props');
      return;
    }
    setLoading(false);
  }, [matchId, otherUser]);

  if (loading) return <div>Loading...</div>;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [encryptionKey] = useState(() => {
    const storedKey = localStorage.getItem(`chat_key_${matchId}`);
    if (storedKey) return storedKey;
    
    const newKey = EncryptionService.generateKey();
    localStorage.setItem(`chat_key_${matchId}`, newKey);
    return newKey;
  });

  useEffect(() => {
    // Subscribe to messages
    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    const typingRef = doc(db, `matches/${matchId}/typing/${currentUser.uid}`);
    
    const cleanup = async () => {
      try {
        await setDoc(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error cleaning up typing indicator:', error);
      }
    };

    return () => cleanup();
  }, [matchId, currentUser.uid]);

  const [setTypingStatus] = useState(() => 
    debounce(async (isTyping) => {
      try {
        const typingRef = doc(db, `matches/${matchId}/typing/${currentUser.uid}`);
        await setDoc(typingRef, {
          isTyping,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    }, 500)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const encryptedMessage = EncryptionService.encryptMessage(newMessage, encryptionKey);
      await addDoc(collection(db, 'messages'), {
        matchId,
        senderId: currentUser.uid,
        text: encryptedMessage,
        timestamp: new Date(),
        encrypted: true
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMessageInput = (e) => {
    setNewMessage(e.target.value);
    setTypingStatus(e.target.value.length > 0);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img 
          src={otherUser.photoURL || 'default-avatar.png'} 
          alt={otherUser.displayName} 
          className="chat-avatar"
        />
        <div className="user-info">
          <h3>{otherUser.displayName}</h3>
          <UserPresence userId={otherUser.id} />
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => {
          const decryptedText = message.encrypted 
            ? EncryptionService.decryptMessage(message.text, encryptionKey)
            : message.text;
          
          return (
            <div 
              key={message.id}
              className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
            >
              <p>{decryptedText}</p>
              <span className="timestamp">
                {message.timestamp.toDate().toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageInput}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat; 