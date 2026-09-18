'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/apiServices';

export default function ApplicantSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    education: '',
    desc: '',
    experience: '',
    skills: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Replaced raw fetch with centralized helper
      await registerUser(formData);
      router.push('/applicant/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Create Applicant Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="password" name="password" placeholder="Password *" value={formData.password} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} style={{ padding: '8px' }} />
        <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} style={{ padding: '8px' }} />
        <textarea name="desc" placeholder="Bio / Summary" value={formData.desc} onChange={handleChange} style={{ padding: '8px' }} />
        <textarea name="experience" placeholder="Work Experience" value={formData.experience} onChange={handleChange} style={{ padding: '8px' }} />
        <input type="text" name="skills" placeholder="Skills (comma-separated)" value={formData.skills} onChange={handleChange} style={{ padding: '8px' }} />

        <button type="submit" style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Already have an account? <Link href="/applicant/login">Log in</Link>
      </p>
    </main>
  );
}