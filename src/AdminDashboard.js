import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCode } from 'react-qrcode-logo';

export default function AdminDashboard() {
  const [eventKey, setEventKey] = useState('abc123');
  const [addresses, setAddresses] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState('');
  const [claimUrl, setClaimUrl] = useState('');
  const [qrEventId, setQrEventId] = useState('');

  useEffect(() => {
    if (eventKey) fetchSubmittedWallets();
  }, [eventKey]);

  async function fetchSubmittedWallets() {
    try {
      setStatus('🔄 Fetching submitted addresses...');
      const res = await axios.get(`http://10.193.111.129:5000/api/submitted-addresses?eventKey=${eventKey}`);
      setAddresses(res.data.addresses || []);
      setStatus(`✅ Loaded ${res.data.addresses?.length || 0} submissions.`);
    } catch (err) {
      setStatus('❌ Failed to load submitted addresses.');
    }
  }

  async function handleMint(wallet) {
    try {
      setLoading(wallet);
      setStatus(`⏳ Minting POAP for ${wallet}...`);

      const res = await axios.post('http://localhost:5000/api/mint-poap', {
        wallet,
        eventKey,
      });

      setStatus(`✅ Successfully minted POAP! Tx: ${res.data.txHash}`);
    } catch (err) {
      setStatus(`❌ Mint failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading('');
    }
  }

  async function generateQR() {
    try {
      setStatus('⏳ Generating claim QR...');
      const res = await axios.post('http://10.193.111.129:5000/api/generate-claim-link', {
        event_id: eventKey,
        expiry_minutes: 60,
      });
      setClaimUrl(res.data.claim_url);
      setQrEventId(eventKey);
      setStatus('✅ QR code generated!');
    } catch (err) {
      setStatus(`❌ Failed to generate QR: ${err.response?.data?.error || err.message}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin POAP Dashboard</h1>

      <label className="block mb-2">
        Event Key:
        <input
          value={eventKey}
          onChange={(e) => setEventKey(e.target.value)}
          className="ml-2 border p-1 rounded"
        />
      </label>

      <div className="mb-4">
        <button
          onClick={generateQR}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Generate QR for Event
        </button>
      </div>

      {claimUrl && (
        <div className="mb-6">
          <p className="text-sm mb-2">Scan this QR to claim for event: <strong>{qrEventId}</strong></p>
          <QRCode value={claimUrl} size={200} />
          <p className="text-xs mt-2 break-words text-gray-500">{claimUrl}</p>
        </div>
      )}

      {status && <p className="mb-4 text-blue-600 text-sm">{status}</p>}

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Wallet</th>
            <th className="p-2 text-left">Timestamp</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((entry, idx) => {
            const wallet = entry.wallet || entry.wallet_address;
            const timestamp = new Date(entry.timestamp).toLocaleString();

            return (
              <tr key={idx} className="border-t">
                <td className="p-2 font-mono">{wallet}</td>
                <td className="p-2 text-gray-500">{timestamp}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleMint(wallet)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading === wallet}
                  >
                    {loading === wallet ? 'Minting...' : 'Validate + Mint'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
