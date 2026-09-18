'use client';

import Link from 'next/link';

export default function ApplicantHomePage() {
  const features = [
    {
      title: 'Job Matcher',
      description: 'Swipe through tailored job recommendations one by one.',
      icon: '🔥',
      href: '/applicant/match',
      buttonText: 'Start Matching',
      primary: true,
    },
    {
      title: 'Browse Openings',
      description: 'Explore all currently available job listings in a clean list view.',
      icon: '📋',
      href: '/applicant/browse',
      buttonText: 'Browse All',
    },
    {
      title: 'Search Jobs',
      description: 'Search for specific positions by job title, skill, or keyword.',
      icon: '🔍',
      href: '/applicant/search',
      buttonText: 'Search Now',
    },
    {
      title: 'My Applications',
      description: 'Track the status and history of jobs you have applied to.',
      icon: '📄',
      href: '/applicant/applications',
      buttonText: 'View Applications',
    },
    {
      title: 'My Profile',
      description: 'Manage your personal details, resume summary, and experience.',
      icon: '👤',
      href: '/applicant/profile',
      buttonText: 'View Profile',
    },
  ];

  return (
    <main style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Welcome Banner */}
      <div 
        style={{ 
          backgroundColor: '#0070f3', 
          color: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,112,243,0.2)'
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Welcome Back! 👋</h1>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          Ready to find your next opportunity? Choose a feature below to get started.
        </p>
      </div>

      {/* Grid of Key Features */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '20px' 
        }}
      >
        {features.map((item) => (
          <div 
            key={item.title} 
            style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '10px', 
              padding: '24px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '20px' }}>{item.title}</h3>
              <p style={{ margin: '0 0 20px 0', color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                {item.description}
              </p>
            </div>

            <Link 
              href={item.href}
              style={{
                display: 'inline-block',
                textAlign: 'center',
                padding: '10px 16px',
                backgroundColor: item.primary ? '#0070f3' : '#f3f4f6',
                color: item.primary ? 'white' : '#1f2937',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
            >
              {item.buttonText} →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}