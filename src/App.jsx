import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AddShiftForm from './components/AddShiftForm';
import RecentShifts from './components/RecentShifts';

import Reports from './pages/Reports';
import LeaveTracking from './pages/LeaveTracking'; // New import
import { Clock, LogOut } from 'lucide-react';

function App() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [shifts, setShifts] = useState([]);
    const [loadingShifts, setLoadingShifts] = useState(false);

    // Fetch shifts on mount
    useEffect(() => {
        if (user) {
            fetchShifts();
        }
    }, [user]);



    const fetchShifts = async (limit = 5) => {
        try {
            setLoadingShifts(true);
            const res = await fetch(`/api/shifts?limit=${limit}`);
            if (res.ok) {
                const data = await res.json();
                setShifts(data);
            }
        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            setLoadingShifts(false);
        }
    };

    const handleAddShift = async (newShiftData) => {
        try {
            const res = await fetch('/api/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShiftData)
            });

            if (res.ok) {
                await fetchShifts(); // Refresh list
                alert('Mesai başarıyla kaydedildi!');
            } else {
                const err = await res.json();
                alert(err.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error adding shift:', error);
            alert('Bağlantı hatası.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Nav */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-200">
                            <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            Circa - Mesai Takip
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard'
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Mesai Takip
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'permissions'
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                İzin Takip
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports'
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Raporlar
                            </button>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                            <div className="text-sm font-bold text-slate-700 hidden sm:block">
                                {user?.email}
                            </div>
                            <a
                                href="https://wildtype.app"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                title="Apex'e Dön"
                            >
                                <LogOut className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-1">
                            <AddShiftForm onSubmit={handleAddShift} />
                        </div>

                        {/* Right Column: List */}
                        <div className="lg:col-span-2">
                            <RecentShifts shifts={shifts} onViewAll={() => fetchShifts(50)} />
                        </div>
                    </div>
                )}

                {activeTab === 'permissions' && (
                    <LeaveTracking />
                )}

                {activeTab === 'reports' && (
                    <Reports />
                )}

            </main>
        </div>
    )
}

export default App
