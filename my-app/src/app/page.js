import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Job Portal</h1>
      <p>Select an option below to log in to your portal.</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <Link 
          href="/applicant/login"
          style={{ padding: '12px 24px', backgroundColor: '#0070f3', color: 'white', borderRadius: '5px', textDecoration: 'none' }}
        >
          Applicant Login
        </Link>

        <Link 
          href="/employer/login"
          style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', borderRadius: '5px', textDecoration: 'none' }}
        >
          Employer Login
        </Link>
      </div>
    </main>
  );
}