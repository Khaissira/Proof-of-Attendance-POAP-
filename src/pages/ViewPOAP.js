// src/pages/ViewPOAP.js
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import PoapContract from '../contract/PoapContract';
import { contractAddress } from '../contract/PoapContract';

export default function ViewPOAP() {
  const { address, isConnected } = useAccount();
  const [poaps, setPoaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchPoaps();
    }
  }, [isConnected]);

  const fetchPoaps = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, PoapContract.abi, signer);

      const balance = await contract.balanceOf(address);
      const fetchedPoaps = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);

        const response = await fetch(tokenURI);
        const metadata = await response.json();

        fetchedPoaps.push({
          tokenId: tokenId.toString(),
          ...metadata
        });
      }

      setPoaps(fetchedPoaps);
    } catch (err) {
      console.error('Error fetching POAPs:', err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your POAPs</h2>
      {!isConnected && <p>Please connect your wallet to view POAPs.</p>}
      {loading && <p>Loading your POAPs...</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {poaps.map((poap) => (
          <div key={poap.tokenId} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
            <img src={`https://ipfs.io/ipfs/${poap.image.replace('ipfs://', '')}`} alt={poap.name} style={{ width: '100%', borderRadius: '10px' }} />
            <h4>{poap.name}</h4>
            <p>{poap.description}</p>
            <small>Token ID: {poap.tokenId}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
