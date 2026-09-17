'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployerSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    desc: '',
    websitelink: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/signup/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      router.push('/employer/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Register Employer Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" name="name" placeholder="Company Name *" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="email" name="email" placeholder="Company Email *" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="text" name="location" placeholder="Location *" value={formData.location} onChange={handleChange} required style={{ padding: '8px' }} />
        <textarea name="desc" placeholder="Company Description" value={formData.desc} onChange={handleChange} style={{ padding: '8px' }} />
        <input type="url" name="websitelink" placeholder="Website Link (https://...)" value={formData.websitelink} onChange={handleChange} style={{ padding: '8px' }} />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register Company
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Already registered? <Link href="/employer/login">Log in</Link>
      </p>
    </main>
  );
}