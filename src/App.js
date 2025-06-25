import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract/PoapContract';
import AdminDashboard from './AdminDashboard';
import ClaimPage from './ClaimPage';

function getPoapContract(providerOrSigner) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

function App() {
  const [wallet, setWallet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventTitle: '',
    recipient: '',
    tokenURI: '',
    role: '',
    expiry: ''
  });
  const [validationAddress, setValidationAddress] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (!window.ethereum) {
      return setStatus('🔌 Install MetaMask');
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return setStatus('🦊 Please install MetaMask');

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 10200n) {
        return setStatus('⚠️ Please switch to Chiado network (ID 10200)');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);

      const contract = getPoapContract(provider);
      const contractOwner = await contract.owner();
      setOwner(contractOwner);
      setStatus('✅ Connected successfully');
    } catch (err) {
      console.error(err);
      setStatus(`❌ Connection failed: ${err.reason || err.message}`);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const convertToUnix = (dateString) => {
    const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const mintPOAP = async () => {
    if (!wallet) return setStatus('Connect your wallet');
    if (!form.recipient || !form.tokenURI || !form.eventTitle || !form.role || !form.expiry) {
      return setStatus('❌ All fields are required');
    }

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.mintBadge(
        form.recipient.trim(),
        form.tokenURI.trim(),
        form.eventTitle.trim(),
        form.role.trim(),
        convertToUnix(form.expiry)
      );

      setStatus('🌐 Minting POAP...');
      await tx.wait();

      const tokenId = (await contract.nextTokenId()) - 1n;
      setStatus(`✅ Mint successful! Token ID: ${tokenId.toString()}`);
    } catch (err) {
      console.error(err);
      setStatus(`❌ Transaction failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateStudent = async () => {
    if (!validationAddress) return setStatus('Please enter an address to validate');

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.validateStudent(validationAddress.trim());
      setStatus('🌐 Validating attendees...');
      await tx.wait();
      setStatus(`✅ Student ${validationAddress} validated!`);
      setValidationAddress('');
    } catch (err) {
      console.error(err);
      setStatus(`❌ Validation failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={styles.container}>
            <h1>POAP Minting DApp</h1>
            <button onClick={connectWallet} style={styles.button}>
              {wallet ? 'Reconnect Wallet' : '🔌 Connect Wallet'}
            </button>
            <p><strong>Connected:</strong> {wallet || 'Not connected'}</p>
            <p><strong>Contract Owner:</strong> {owner}</p>

            {wallet === owner && (
              <div style={styles.card}>
                <h2>Validate Attendees</h2>
                <input
                  style={styles.input}
                  placeholder="Student address"
                  value={validationAddress}
                  onChange={(e) => setValidationAddress(e.target.value)}
                />
                <button onClick={validateStudent} style={styles.button} disabled={loading}>
                  {loading ? 'Validating...' : 'Validate Attendees'}
                </button>
              </div>
            )}

            <div style={styles.card}>
              <h2>Mint POAP</h2>
              <label>Event Title</label>
              <input name="eventTitle" style={styles.input} value={form.eventTitle} onChange={handleChange} />

              <label>Recipient Address</label>
              <input name="recipient" style={styles.input} value={form.recipient} onChange={handleChange} />

              <label>Token URI (IPFS)</label>
              <input name="tokenURI" style={styles.input} value={form.tokenURI} onChange={handleChange} />

              <label>Role</label>
              <input name="role" style={styles.input} value={form.role} onChange={handleChange} />

              <label>Expiry Date</label>
              <input name="expiry" type="datetime-local" style={styles.input} value={form.expiry} onChange={handleChange} />

              <button onClick={mintPOAP} style={styles.button} disabled={loading}>
                {loading ? 'Minting...' : 'Mint POAP'}
              </button>
            </div>

            {status && <p style={styles.status}>{status}</p>}
          </div>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/claim" element={<ClaimPage />} />
      </Routes>
    </Router>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    outline: 'none',
    ':focus': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      background: 'rgba(255, 255, 255, 1)'
    },
    '::placeholder': {
      color: '#94a3b8',
      fontWeight: '400'
    }
  },
  
  button: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    width: '100%',
    marginBottom: '1.5rem',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(255, 107, 107, 0.3)',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 30px rgba(255, 107, 107, 0.4)',
      background: 'linear-gradient(135deg, #ff5252, #ff9800)'
    },
    ':active': {
      transform: 'translateY(-1px)'
    }
  },
  
  status: {
    marginTop: '1.5rem',
    fontWeight: '600',
    fontSize: '14px',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    textAlign: 'center'
  },
  
  card: {
    border: 'none',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1.5rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
    }
  }
};

export default App;
