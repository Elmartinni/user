import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './UserPreferences.css';

function UserPreferences() {
  const currentUser = auth.currentUser;
  const [preferences, setPreferences] = useState({
    interestedIn: 'everyone',
    ageRange: {
      min: 18,
      max: 50
    },
    distance: 50,
    lookingFor: ['friendship', 'relationship'],
    dealBreakers: [],
    interests: []
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().preferences) {
        setPreferences(userDoc.data().preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        preferences
      }, { merge: true });
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleInterestAdd = (interest) => {
    if (!preferences.interests.includes(interest)) {
      setPreferences(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const handleInterestRemove = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="preferences-container">
      <h2>Dating Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Interested In</label>
          <select
            value={preferences.interestedIn}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              interestedIn: e.target.value
            }))}
          >
            <option value="everyone">Everyone</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>

        <div className="form-group">
          <label>Age Range</label>
          <div className="age-range">
            <input
              type="number"
              min="18"
              max="100"
              value={preferences.ageRange.min}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                ageRange: {
                  ...prev.ageRange,
                  min: parseInt(e.target.value)
                }
              }))}
            />
            <span>to</span>
            <input
              type="number"
              min="18"
              max="100"
              value={preferences.ageRange.max}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                ageRange: {
                  ...prev.ageRange,
                  max: parseInt(e.target.value)
                }
              }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Maximum Distance (km)</label>
          <input
            type="range"
            min="1"
            max="100"
            value={preferences.distance}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              distance: parseInt(e.target.value)
            }))}
          />
          <span>{preferences.distance} km</span>
        </div>

        <div className="form-group">
          <label>Looking For</label>
          <div className="checkbox-group">
            {['friendship', 'relationship', 'casual', 'marriage'].map(option => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={preferences.lookingFor.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences(prev => ({
                        ...prev,
                        lookingFor: [...prev.lookingFor, option]
                      }));
                    } else {
                      setPreferences(prev => ({
                        ...prev,
                        lookingFor: prev.lookingFor.filter(item => item !== option)
                      }));
                    }
                  }}
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Interests</label>
          <div className="interests-container">
            <div className="interests-input">
              <input
                type="text"
                placeholder="Add an interest"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInterestAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="interests-tags">
              {preferences.interests.map(interest => (
                <span key={interest} className="interest-tag">
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleInterestRemove(interest)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="save-preferences">
          Save Preferences
        </button>
      </form>
    </div>
  );
}

export default UserPreferences; 