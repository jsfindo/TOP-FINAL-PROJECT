'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmployerDashboardPage() {
  const [openings, setOpenings] = useState([]);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState('');

  // Fetch all job openings when page loads
  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    try {
      const res = await fetch('/api/openings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load openings');
      setOpenings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOpenings(false);
    }
  };

  // Fetch applicants for a specific job opening when clicked
  const handleSelectOpening = async (opening) => {
    setSelectedOpening(opening);
    setLoadingApplicants(true);
    setApplicants([]);

    try {
      const res = await fetch(`/api/openings/${opening.id}/applicants`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch applicants');
      setApplicants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingApplicants(false);
    }
  };

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Employer Dashboard</h2>
        <Link 
          href="/employer/post-job" 
          style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          + Post New Job
        </Link>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Job Openings List */}
        <div>
          <h3>Job Openings</h3>
          {loadingOpenings ? (
            <p>Loading job postings...</p>
          ) : openings.length === 0 ? (
            <p>No job openings found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {openings.map((opening) => (
                <div
                  key={opening.id}
                  onClick={() => handleSelectOpening(opening)}
                  style={{
                    padding: '15px',
                    border: selectedOpening?.id === opening.id ? '2px solid #10b981' : '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedOpening?.id === opening.id ? '#f0fdf4' : 'white',
                  }}
                >
                  <h4 style={{ margin: '0 0 5px 0' }}>{opening.title}</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{opening.desc}</p>
                  <span style={{ fontSize: '12px', color: '#888', display: 'block', marginTop: '8px' }}>
                    Closes: {new Date(opening.dateClose).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Applicants Details */}
        <div>
          <h3>Applicant Details</h3>
          {!selectedOpening ? (
            <p style={{ color: '#666' }}>Click a job opening on the left to view applicants.</p>
          ) : loadingApplicants ? (
            <p>Loading applicants...</p>
          ) : applicants.length === 0 ? (
            <p>No applicants for <strong>{selectedOpening.title}</strong> yet.</p>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: '#555' }}>
                Showing candidates for <strong>{selectedOpening.title}</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#fafafa' }}
                  >
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.user.name}</h5>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}><strong>Email:</strong> {app.user.email}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}><strong>Phone:</strong> {app.user.phone || 'N/A'}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}><strong>Education:</strong> {app.user.education || 'N/A'}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}><strong>Skills:</strong> {app.user.skills || 'N/A'}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#777' }}>
                      Applied on: {new Date(app.date).toLocaleDateString()}
                    </p>
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