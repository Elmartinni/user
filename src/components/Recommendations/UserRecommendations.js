import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { RecommendationService } from '../../services/RecommendationService';
import './UserRecommendations.css';

function UserRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const matches = await RecommendationService.getRecommendations(
        currentUser.uid,
        currentUser.matchPreferences
      );
      setRecommendations(matches);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading recommendations...</div>;
  }

  return (
    <div className="recommendations-container">
      <h2>Recommended Matches</h2>
      <div className="recommendations-grid">
        {recommendations.map(user => (
          <div key={user.id} className="recommendation-card">
            <div className="recommendation-image">
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt={user.displayName}
              />
              {user.verification?.status === 'verified' && (
                <span className="verified-badge">✓</span>
              )}
            </div>
            <div className="recommendation-info">
              <h3>{user.displayName}, {user.age}</h3>
              <p>{user.location?.city}</p>
              <div className="common-interests">
                {user.interests.slice(0, 3).map(interest => (
                  <span key={interest} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
              <div className="match-score">
                Match Score: {Math.round(user.score)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserRecommendations; 