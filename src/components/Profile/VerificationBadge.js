import React from 'react';
import './VerificationBadge.css';

function VerificationBadge({ status }) {
  const getBadgeText = () => {
    switch (status) {
      case 'verified':
        return '✓ Verified';
      case 'pending':
        return '⋯ Pending Verification';
      default:
        return '○ Not Verified';
    }
  };

  return (
    <div className={`verification-badge ${status}`}>
      {getBadgeText()}
    </div>
  );
}

export default VerificationBadge; 