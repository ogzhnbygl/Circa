import React, { useState, useEffect } from 'react';
import LeaveForm from '../components/LeaveForm';
import RecentLeaves from '../components/RecentLeaves';

export default function LeaveTracking() {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTimeOffs();
    }, []);

    const fetchTimeOffs = async (limit = 10) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/time-offs?limit=${limit}`);
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
            const res = await fetch('/api/time-offs', {
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-1">
                <LeaveForm onSubmit={handleCreateTimeOff} />
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-2">
                <RecentLeaves leaves={timeOffs} onViewAll={() => fetchTimeOffs(50)} />
            </div>
        </div>
    );
}
