'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await apiClient('/api/applications/me');
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to load submitted applications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Submitted Applications</h2>
        <Link 
          href="/applicant/home" 
          style={{ padding: '8px 16px', backgroundColor: '#4b5563', color: 'white', borderRadius: '4px', textDecoration: 'none' }}
        >
          🏠 Home
        </Link>
      </div>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {loading ? (
        <p>Loading your applications...</p>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <h3>No applications yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>You have not submitted any job applications yet.</p>
          <Link 
            href="/applicant/browse" 
            style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map((app) => (
            <div 
              key={app.id} 
              style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>{app.opening?.title || 'Job Opening'}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4b5563' }}>
                    <strong>Company:</strong> {app.opening?.company?.name || 'N/A'} | <strong>Location:</strong> {app.opening?.company?.location || 'Remote'}
                  </p>
                </div>
                <span 
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: app.status === 'ACCEPTED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                    color: app.status === 'ACCEPTED' ? '#15803d' : app.status === 'REJECTED' ? '#dc2626' : '#b45309'
                  }}
                >
                  {app.status || 'PENDING'}
                </span>
              </div>

              {app.opening?.desc && (
                <p style={{ margin: '10px 0', fontSize: '14px', color: '#374151' }}>{app.opening.desc}</p>
              )}

              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                Applied on: {new Date(app.createdAt || app.dateSubmitted).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}