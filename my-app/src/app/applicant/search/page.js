'use client';

import { useState } from 'react';
import Link from 'next/link';
import { applyToJob } from '@/services/apiServices';
import { apiClient } from '@/lib/apiClient';

export default function SearchOpeningsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setMessage({ text: '', type: '' });

    try {
      // Replaced raw fetch with centralized apiClient
      const data = await apiClient(`/api/openings/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(data);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (openingId) => {
    try {
      // Replaced raw fetch with centralized helper
      await applyToJob(openingId);
      setMessage({ text: 'Successfully applied!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Search Jobs</h2>
        <Link 
          href="/applicant/browse" 
          style={{ padding: '8px 16px', backgroundColor: '#4b5563', color: 'white', borderRadius: '4px', textDecoration: 'none' }}
        >
          📋 Browse All
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Search by job title or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Search
        </button>
      </form>

      {message.text && (
        <p style={{ color: message.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
          {message.text}
        </p>
      )}

      {loading && <p>Searching positions...</p>}

      {!loading && hasSearched && results.length === 0 && (
        <p>No job openings found matching "{searchTerm}".</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map((job) => (
          <div 
            key={job.id} 
            style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0' }}>{job.title}</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4b5563' }}>
                  <strong>Company:</strong> {job.company?.name || 'N/A'} | <strong>Location:</strong> {job.company?.location || 'Remote'}
                </p>
              </div>
              <button
                onClick={() => handleApply(job.id)}
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
                Apply Now
              </button>
            </div>
            <p style={{ margin: '10px 0', fontSize: '14px', color: '#374151' }}>{job.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}