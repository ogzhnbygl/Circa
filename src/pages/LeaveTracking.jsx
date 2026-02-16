import React, { useState, useEffect } from 'react';
import LeaveForm from '../components/LeaveForm';
import RecentLeaves from '../components/RecentLeaves';

import { useAuth } from '../context/AuthContext';

export default function LeaveTracking() {
    const { user } = useAuth();
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTimeOffs();
    }, []);

    const fetchTimeOffs = async (limit = 10) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/leaves?limit=${limit}`);
            if (res.ok) {
                const data = await res.json();
                setTimeOffs(data);
            }
        } catch (error) {
            console.error('Error fetching time-offs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTimeOff = async (payload) => {
        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchTimeOffs();
                alert('İzin talebi başarıyla oluşturuldu!');
            } else {
                const err = await res.json();
                alert(err.error || 'Hata oluştu.');
            }
        } catch (error) {
            console.error('Error creating time-off:', error);
            alert('Bağlantı hatası.');
        }
    };

    const [userBalance, setUserBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/leaves/balance');
                if (res.ok) {
                    const data = await res.json();
                    setUserBalance(data.totalBalance || 0);
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };
        fetchBalance();
    }, []);

    const handleApproveLeave = async (id) => {
        if (!confirm('Bu izin talebini onaylamak ve bakiyeden düşmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            const res = await fetch('/api/leaves/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                fetchTimeOffs(); // Refresh list
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Approval Error:', error);
            alert(error.message || 'Onaylama işlemi başarısız oldu.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-1">
                <LeaveForm onSubmit={handleCreateTimeOff} />
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-2">
                <RecentLeaves
                    leaves={timeOffs}
                    onViewAll={() => fetchTimeOffs(50)}
                    isAdmin={user?.role === 'admin'}
                    onApprove={handleApproveLeave}
                    user={user}
                    userBalance={userBalance}
                />
            </div>
        </div>
    );
}
