// src/pages/Mint.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import usePoapContract from '../hooks/usePoapContract';
import QrReader from 'react-qr-scanner';

export default function Mint() {
  const [recipient, setRecipient] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [txHash, setTxHash] = useState('');
  const [connectedWallet, setConnectedWallet] = useState('');
  const [scanQR, setScanQR] = useState(false);
  const contract = usePoapContract();

  useEffect(() => {
    async function getConnectedWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet(accounts[0]);
        setRecipient(accounts[0]);
      }
    }
    getConnectedWallet();
  }, []);

  const handleMint = async () => {
    if (!ethers.utils.isAddress(recipient)) {
      alert('Invalid wallet address');
      return;
    }

    try {
      const tx = await contract.mintPOAP(recipient, ipfsUrl);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (error) {
      console.error('Minting error:', error);
    }
  };

  const handleScan = (data) => {
    if (data) {
      setRecipient(data.text);
      setScanQR(false);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mint POAP</h2>
      <input
        type="text"
        placeholder="Recipient Wallet Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="IPFS Metadata URL"
        value={ipfsUrl}
        onChange={(e) => setIpfsUrl(e.target.value)}
      />
      <br />
      <button onClick={handleMint}>Mint POAP</button>
      <button onClick={() => setScanQR(!scanQR)} style={{ marginLeft: '10px' }}>
        {scanQR ? 'Close QR Scanner' : 'Scan QR'}
      </button>
      <br />
      {scanQR && (
        <div style={{ width: '300px', marginTop: '10px' }}>
          <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} />
        </div>
      )}
      {txHash && (
        <div>
          <p>Transaction Hash:</p>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">{txHash}</a>
        </div>
      )}
    </div>
  );
}
