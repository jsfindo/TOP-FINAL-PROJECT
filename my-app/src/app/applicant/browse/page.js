'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BrowseOpeningsPage() {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

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
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (openingId) => {
    setApplyingId(openingId);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setMessage({ text: 'Successfully applied to job!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Browse Job Openings</h2>
        <Link 
          href="/applicant/search" 
          style={{ padding: '8px 16px', backgroundColor: '#4b5563', color: 'white', borderRadius: '4px', textDecoration: 'none' }}
        >
          🔍 Search Jobs
        </Link>
      </div>

      {message.text && (
        <p style={{ color: message.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p>Loading openings...</p>
      ) : openings.length === 0 ? (
        <p>No open positions available at the moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {openings.map((job) => (
            <div 
              key={job.id} 
              style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#111827' }}>{job.title}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4b5563' }}>
                    <strong>Company:</strong> {job.company?.name || 'N/A'} | <strong>Location:</strong> {job.company?.location || 'Remote'}
                  </p>
                </div>
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applyingId === job.id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>

              <p style={{ margin: '10px 0', fontSize: '14px', color: '#374151' }}>{job.desc}</p>
              
              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '15px' }}>
                <span>Posted: {new Date(job.dateStart).toLocaleDateString()}</span>
                <span>Closes: {new Date(job.dateClose).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}