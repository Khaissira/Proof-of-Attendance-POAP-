import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

export default function AdminEventPage() {
    const [searchParams] = useSearchParams();
    const eventKey = searchParams.get('eventKey');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minting, setMinting] = useState({}); // {id: true/false}

    useEffect(() => {
        const fetchAddresses = async () => {
            const res = await fetch(/api/submitted - addresses ? eventKey = $:{eventKey});
            const data = await res.json();
            if (res.ok) {
                setAddresses(data.addresses);
            }
            setLoading(false);
        };
        if (eventKey) fetchAddresses();
    }, [eventKey]);

    const handleMint = async (wallet, id) => {
        setMinting((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch('/api/mint-poap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet, eventKey }),
            });
            const data = await res.json();
            alert(data.message || 'Mint complete');
        } catch (err) {
            alert('Minting failed');
        }
        setMinting((prev) => ({ ...prev, [id]: false }));
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Submitted Addresses</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <p>No addresses submitted yet.</p>
                    ) : (
                        addresses.map(({ id, wallet_address, timestamp }) => (
                            <Card key={id}>
                                <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                        <p className="font-mono">{wallet_address}</p>
                                        <p className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={() => handleMint(wallet_address, id)}
                                            disabled={minting[id]}
                                        >
                                            {minting[id] ? 'Minting...' : 'Mint POAP'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigator.clipboard.writeText(wallet_address)}
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}