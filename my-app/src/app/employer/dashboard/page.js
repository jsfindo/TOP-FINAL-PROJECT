'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOpenings } from '@/services/apiServices';
import { apiClient } from '@/lib/apiClient';

export default function EmployerDashboardPage() {
  const [openings, setOpenings] = useState([]);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    try {
      const data = await getOpenings();
      setOpenings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch job postings');
    } finally {
      setLoadingOpenings(false);
    }
  };

  const handleSelectOpening = async (opening) => {
    setSelectedOpening(opening);
    setLoadingApplicants(true);
    setApplicants([]);

    try {
      const data = await apiClient(`/api/openings/${opening.id}/applicants`);
      setApplicants(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '26px' }}>Company Dashboard</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Manage active job listings and review incoming candidates.
          </p>
        </div>
        <Link 
          href="/employer/post-job" 
          style={{ 
            padding: '10px 18px', 
            backgroundColor: '#10b981', 
            color: 'white', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          + Post New Position
        </Link>
      </div>

      {error && (
        <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>
          {error}
        </p>
      )}

      {/* Two-Column Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Active Job Listings */}
        <div>
          <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>
            Your Open Positions ({openings.length})
          </h3>

          {loadingOpenings ? (
            <p style={{ color: '#6b7280' }}>Loading position listings...</p>
          ) : openings.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', margin: '0 0 12px 0' }}>No active job listings found.</p>
              <Link href="/employer/post-job" style={{ color: '#10b981', fontWeight: 'bold' }}>
                Create your first posting
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {openings.map((opening) => (
                <div
                  key={opening.id}
                  onClick={() => handleSelectOpening(opening)}
                  style={{
                    padding: '16px',
                    border: selectedOpening?.id === opening.id ? '2px solid #10b981' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedOpening?.id === opening.id ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '18px' }}>{opening.title}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                    {opening.desc}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                    <span>Posted: {new Date(opening.dateStart || Date.now()).toLocaleDateString()}</span>
                    <span>Closes: {new Date(opening.dateClose).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applicant Details Panel */}
        <div>
          <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', color: '#111827' }}>
            Applicant Reviews
          </h3>

          {!selectedOpening ? (
            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
              👈 Select a job posting from the left to view applicants.
            </div>
          ) : loadingApplicants ? (
            <p style={{ color: '#6b7280' }}>Fetching candidates for {selectedOpening.title}...</p>
          ) : applicants.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', margin: 0 }}>
                No applicants submitted yet for <strong>{selectedOpening.title}</strong>.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
                Candidates applied for <strong>{selectedOpening.title}</strong> ({applicants.length}):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#111827' }}>
                      {app.user?.name || 'Applicant'}
                    </h5>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#4b5563' }}>
                      <strong>Email:</strong> {app.user?.email}
                    </p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#4b5563' }}>
                      <strong>Phone:</strong> {app.user?.phone || 'N/A'}
                    </p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#4b5563' }}>
                      <strong>Education:</strong> {app.user?.education || 'N/A'}
                    </p>
                    <p style={{ margin: '3px 0', fontSize: '13px', color: '#4b5563' }}>
                      <strong>Skills:</strong> {app.user?.skills || 'N/A'}
                    </p>
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#9ca3af' }}>
                      Applied on: {new Date(app.createdAt || app.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}