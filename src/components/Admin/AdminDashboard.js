import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import './AdminDashboard.css';

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingReports: 0,
    verificationRequests: 0
  });

  useEffect(() => {
    fetchReports();
    fetchVerificationRequests();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(
        collection(db, 'reports'),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const reportData = [];
      snapshot.forEach(doc => {
        reportData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('verification.status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setVerificationRequests(requests);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    }
  };

  const handleVerification = async (userId, status) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'verification.status': status,
        'verification.verifiedAt': status === 'verified' ? new Date() : null
      });
      fetchVerificationRequests();
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const handleReport = async (reportId, action) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: action,
        resolvedAt: new Date()
      });
      fetchReports();
    } catch (error) {
      console.error('Error handling report:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{stats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Reports</h3>
          <p>{stats.pendingReports}</p>
        </div>
        <div className="stat-card">
          <h3>Verification Requests</h3>
          <p>{stats.verificationRequests}</p>
        </div>
      </div>

      <section className="reports-section">
        <h2>Pending Reports</h2>
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <p><strong>Reporter:</strong> {report.reporterId}</p>
              <p><strong>Reported User:</strong> {report.reportedId}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
              <div className="action-buttons">
                <button 
                  onClick={() => handleReport(report.id, 'dismissed')}
                  className="dismiss-button"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => handleReport(report.id, 'action_taken')}
                  className="action-button"
                >
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="verification-section">
        <h2>Verification Requests</h2>
        <div className="verification-list">
          {verificationRequests.map(request => (
            <div key={request.id} className="verification-card">
              <img 
                src={request.verification.idUrl} 
                alt="ID Document" 
                className="verification-image"
              />
              <img 
                src={request.verification.selfieUrl} 
                alt="Selfie" 
                className="verification-image"
              />
              <div className="verification-actions">
                <button 
                  onClick={() => handleVerification(request.id, 'rejected')}
                  className="reject-button"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleVerification(request.id, 'verified')}
                  className="approve-button"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard; 