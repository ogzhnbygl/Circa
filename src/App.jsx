import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth, getApexUrl, isPreviewHost } from './context/AuthContext';
import AddShiftForm from './components/AddShiftForm';
import RecentShifts from './components/RecentShifts';
import Reports from './pages/Reports';
import LeaveTracking from './pages/LeaveTracking';
import { Clock, LogOut, LayoutGrid } from 'lucide-react';

function Navigation() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-200">
                        <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        Circa - Mesai Takip
                        {isPreviewHost() && (
                            <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                                Test Ortamı
                            </span>
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to="/"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Mesai Takip
                        </Link>
                        <Link
                            to="/permissions"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/permissions'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            İzin Takip
                        </Link>
                        <Link
                            to="/reports"
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/reports'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Raporlar
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                        <div className="text-sm font-bold text-slate-700 hidden sm:block">
                            {user?.email}
                        </div>
                        <a
                            href={getApexUrl()}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Apex Ana Ekrana Dön"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </a>
                        <button
                            type="button"
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Çıkış Yap"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

function MainDashboard({ shifts, handleAddShift, fetchShifts }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <AddShiftForm onSubmit={handleAddShift} />
            </div>
            <div className="lg:col-span-2">
                <RecentShifts shifts={shifts} onViewAll={() => fetchShifts(50)} />
            </div>
        </div>
    );
}

function App() {
    const { user } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loadingShifts, setLoadingShifts] = useState(false);

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
                await fetchShifts();
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
        <BrowserRouter>
            <div className="min-h-screen bg-slate-50 font-sans">
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<MainDashboard shifts={shifts} handleAddShift={handleAddShift} fetchShifts={fetchShifts} />} />
                        <Route path="/permissions" element={<LeaveTracking />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
