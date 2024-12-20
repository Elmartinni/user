import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile, updatePassword, deleteUser, sendEmailVerification } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // User data states
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
    phoneNumber: '',
    address: '',
    bio: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    },
    theme: 'light',
    notifications: {
      email: true,
      push: true
    }
  });
  
  // Password change states
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfileData(prev => ({
          ...prev,
          ...userDoc.data()
        }));
      }
    } catch (err) {
      setError('Error fetching user data');
    }
  };

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL });
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        photoURL
      }, { merge: true });

      setProfileData(prev => ({ ...prev, photoURL }));
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      setError('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: profileData.displayName
      });

      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user, passwords.newPassword);
      setSuccess('Password updated successfully!');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser(user);
        navigate('/');
      } catch (err) {
        setError('Error deleting account');
      }
    }
  };

  // Handle email verification
  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification(user);
      setSuccess('Verification email sent!');
    } catch (err) {
      setError('Error sending verification email');
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="profile-sections">
        {/* Profile Picture Section */}
        <section className="profile-section">
          <h3>Profile Picture</h3>
          <div className="profile-picture">
            <img 
              src={profileData.photoURL || 'default-avatar.png'} 
              alt="Profile" 
            />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={loading}
            />
          </div>
        </section>

        {/* Basic Information Section */}
        <section className="profile-section">
          <h3>Basic Information</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  displayName: e.target.value
                }))}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  phoneNumber: e.target.value
                }))}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  bio: e.target.value
                }))}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </section>

        {/* Social Links Section */}
        <section className="profile-section">
          <h3>Social Links</h3>
          <div className="form-group">
            <label>Twitter</label>
            <input
              type="url"
              value={profileData.socialLinks.twitter}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  twitter: e.target.value
                }
              }))}
            />
          </div>
          {/* Add similar inputs for LinkedIn and GitHub */}
        </section>

        {/* Password Change Section */}
        <section className="profile-section">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
              />
            </div>
            {/* Add inputs for new password and confirm password */}
            <button type="submit" disabled={loading}>
              Change Password
            </button>
          </form>
        </section>

        {/* Account Settings Section */}
        <section className="profile-section">
          <h3>Account Settings</h3>
          
          {!user.emailVerified && (
            <div className="verification-section">
              <p>Email not verified</p>
              <button onClick={handleVerifyEmail}>
                Send Verification Email
              </button>
            </div>
          )}

          <div className="theme-section">
            <label>Theme</label>
            <select
              value={profileData.theme}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                theme: e.target.value
              }))}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="notification-section">
            <label>
              <input
                type="checkbox"
                checked={profileData.notifications.email}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    email: e.target.checked
                  }
                }))}
              />
              Email Notifications
            </label>
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="profile-section danger-zone">
          <h3>Danger Zone</h3>
          <button 
            onClick={handleDeleteAccount}
            className="delete-account-btn"
          >
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}

export default Profile; 