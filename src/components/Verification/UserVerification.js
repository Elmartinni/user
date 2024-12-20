import React, { useState } from 'react';
import { storage, db, auth } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import './UserVerification.css';

function UserVerification() {
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG or PNG image.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      validateFile(file);
      const path = `verification/${currentUser.uid}/${type}_${Date.now()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idImage || !selfieImage) {
      alert('Please upload both ID and selfie images');
      return;
    }

    setLoading(true);
    try {
      const [idUrl, selfieUrl] = await Promise.all([
        handleImageUpload(idImage, 'id'),
        handleImageUpload(selfieImage, 'selfie')
      ]);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        verification: {
          status: 'pending',
          idUrl,
          selfieUrl,
          submittedAt: new Date(),
        }
      });

      alert('Verification documents submitted successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error submitting verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h2>Account Verification</h2>
      <p className="verification-info">
        To verify your account, please provide:
        <ul>
          <li>A clear photo of your government-issued ID</li>
          <li>A selfie of you holding your ID</li>
        </ul>
      </p>

      <form onSubmit={handleSubmit} className="verification-form">
        <div className="upload-section">
          <h3>ID Document</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIdImage(e.target.files[0])}
            className="file-input"
          />
          {idImage && <p className="file-name">{idImage.name}</p>}
        </div>

        <div className="upload-section">
          <h3>Selfie with ID</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelfieImage(e.target.files[0])}
            className="file-input"
          />
          {selfieImage && <p className="file-name">{selfieImage.name}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading || !idImage || !selfieImage}
          className="submit-button"
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}

export default UserVerification; 