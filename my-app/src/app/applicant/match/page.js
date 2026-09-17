'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApplicantMatchPage() {
  const [openings, setOpenings] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    try {
      const res = await fetch('/api/openings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch job openings');
      setOpenings(data);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    setMessage({ text: '', type: '' });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleApply = async () => {
    const currentJob = openings[currentIndex];
    if (!currentJob) return;

    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingId: currentJob.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setMessage({ text: `Applied to ${currentJob.title}!`, type: 'success' });
      // Move to the next job card automatically after applying
      setTimeout(() => {
        handleNextCard();
      }, 800);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const currentJob = openings[currentIndex];
  const hasMoreJobs = currentIndex < openings.length;

  return (
    <main style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Job Matcher</h2>
        <Link 
          href="/applicant/browse" 
          style={{ padding: '6px 12px', backgroundColor: '#6b7280', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}
        >
          View All List
        </Link>
      </div>

      {message.text && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '6px',
          textAlign: 'center',
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'error' ? '#dc2626' : '#15803d',
          fontWeight: 'bold'
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading available positions...</p>
      ) : !hasMoreJobs ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed #ccc', borderRadius: '12px' }}>
          <h3>🎉 No More Jobs!</h3>
          <p style={{ color: '#666' }}>You've reviewed all active openings for today.</p>
          <button 
            onClick={() => { setCurrentIndex(0); fetchOpenings(); }} 
            style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Start Over
          </button>
        </div>
      ) : (
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          minHeight: '420px'
        }}>
          {/* Card Header & Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '13px', marginBottom: '10px' }}>
              <span>Job {currentIndex + 1} of {openings.length}</span>
              <span>Closes: {new Date(currentJob.dateClose).toLocaleDateString()}</span>
            </div>

            <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '22px' }}>{currentJob.title}</h2>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4b5563', fontWeight: '500' }}>
              📍 {currentJob.company?.location || 'Remote'} &bull; {currentJob.company?.name || 'Company Name'}
            </p>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Description:</h4>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.5', fontSize: '14px' }}>
                {currentJob.desc}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '24px', justifyContent: 'center' }}>
            {/* Red Pass Button */}
            <button
              onClick={handleNextCard}
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                transition: 'transform 0.1s ease',
              }}
            >
              ✖ Pass
            </button>

            {/* Green Apply Button */}
            <button
              onClick={handleApply}
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(34, 197, 94, 0.3)',
                transition: 'transform 0.1s ease',
              }}
            >
              {actionLoading ? 'Applying...' : '✔ Apply'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}