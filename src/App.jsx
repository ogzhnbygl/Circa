import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AddShiftForm from './components/AddShiftForm';
import RecentShifts from './components/RecentShifts';
import Reports from './pages/Reports';
import { Clock } from 'lucide-react';

function App() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [shifts, setShifts] = useState([]);
    const [loadingShifts, setLoadingShifts] = useState(false);

    // Fetch shifts on mount
    React.useEffect(() => {
        if (user) {
            fetchShifts();
        }
    }, [user]);

    const fetchShifts = async () => {
        try {
            setLoadingShifts(true);
            const res = await fetch('/api/shifts');
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
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-200">
                                <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                Circa - Mesai Takip
                            </h1>
                        </div>
                        <nav className="hidden md:flex gap-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Raporlar
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">{user?.role}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
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
                            <RecentShifts shifts={shifts} />
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <Reports />
                )}

            </main>
        </div>
    )
}

export default App
