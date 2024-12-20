import React, { useState } from 'react';
import { ImageService } from '../../services/ImageService';
import './ImageUpload.css';

function ImageUpload({ onUploadComplete, type = 'profile' }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    setError(null);
    const file = event.target.files[0];
    
    try {
      // Validate file
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      setUploading(true);
      const uploadTask = ref(storage, `images/${type}/${Date.now()}_${file.name}`);
      
      // Monitor upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        }
      );

      const url = await uploadTask;
      onUploadComplete(url);
    } catch (error) {
      setError(error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        id="image-upload-input"
      />
      <label htmlFor="image-upload-input" className="upload-button">
        {uploading ? 'Uploading...' : 'Choose Image'}
      </label>
      {uploading && (
        <div className="upload-progress">
          <div 
            className="progress-bar"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUpload; 