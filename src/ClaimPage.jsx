import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function ClaimPage() {
  const [searchParams] = useSearchParams();
  const [eventInfo, setEventInfo] = useState(null);
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const key = searchParams.get('key'); // or 'eventId' depending on your setup

  useEffect(() => {
    if (!key) {
      setStatus('Invalid or missing claim key');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`http://10.193.111.129:5000/api/validate-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid claim key');
        if (data.success) {
          setEventInfo({ eventTitle: 'POAP Event', expiry: Date.now() / 1000 + 3600 }); // Or use real event data if available
        } else {
          setStatus('Invalid or expired key');
        }

      } catch (err) {
        console.error(err);
        setStatus(err.message || 'Failed to fetch event data');
      }
    };

    fetchData();
  }, [key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) return setStatus('Enter your wallet address');

    try {
      setLoading(true);
      const res = await fetch('http://10.193.111.129:5000/api/submit-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, wallet }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStatus('✅ Wallet submitted! You will be minted shortly.');
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🎟️ Claim Your POAP</h2>
      {eventInfo ? (
        <>
          <p><strong>Event:</strong> {eventInfo.eventTitle}</p>
          <p><strong>Role:</strong> {eventInfo.role}</p>
          <p><strong>Expires:</strong> {new Date(eventInfo.expiry * 1000).toLocaleString()}</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Wallet Address"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '1rem 2rem' }}>
              {loading ? 'Submitting...' : 'Submit Wallet'}
            </button>
          </form>
        </>
      ) : (
        <p>{status || '🔄 Loading event data...'}</p>
      )}
      {status && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}
export default ClaimPage;
