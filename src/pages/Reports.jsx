import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Download, Filter, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generatePetition } from '../utils/generatePetition';

export default function Reports() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);
    const [processedDate, setProcessedDate] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    useEffect(() => {
        fetchShifts();
        fetchStatus();
    }, [selectedDate]);

    const fetchStatus = async () => {
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const res = await fetch(`/api/reports/status?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setIsProcessed(data.processed);
                setProcessedDate(data.lastProcessedAt);
            }
        } catch (error) {
            console.error('Status check failed:', error);
        }
    };

    const handleCheckBalance = async () => {
        setLoadingBalance(true);
        try {
            const res = await fetch('/api/reports/balance');
            if (res.ok) {
                const data = await res.json();
                setBalance(data.totalBalance);
            } else {
                alert('Bakiye sorgulanamadı.');
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setLoadingBalance(false);
        }
    };

    const handleDownloadPetition = async () => {
        setGeneratingPdf(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            await generatePetition(month, year, shifts);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Dilekçe oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleProcessShifts = async () => {
        let confirmMessage = 'Bu ayın mesailerini işlemek istediğinize emin misiniz?';

        if (isProcessed) {
            const dateStr = processedDate ? new Date(processedDate).toLocaleString('tr-TR') : '';
            confirmMessage = `DİKKAT: Bu ay daha önce ${dateStr} tarihinde işlenmiş!\n\nTekrar işlemek mevcut bakiyeleri yeniden hesaplayıp güncelleyecektir.\n\nDevam etmek istiyor musunuz?`;
        } else {
            confirmMessage += ' Bu işlem mevcut bakiyeleri güncelleyecektir.';
        }

        if (!confirm(confirmMessage)) {
            return;
        }

        setProcessing(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();

            const response = await fetch('/api/reports/process-monthly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`İşlem başarılı! ${data.processedCount} kişinin bakiyesi güncellendi.`);
                fetchStatus(); // Update status
            } else {
                throw new Error(data.error || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('Process error:', error);
            alert(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const response = await fetch(`/api/shifts?month=${month}&year=${year}`);
            if (response.ok) {
                const data = await response.json();
                setShifts(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (increment) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setSelectedDate(newDate);
    };

    const totalHours = shifts.length * 8; // Placeholder estimate
    const uniqueUsers = new Set(shifts.map(s => s.email)).size;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Main Unified Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Header Section */}
                <div className="px-6 py-5 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Title & Date Navigation */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-all shadow-sm shadow-transparent hover:shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-4 font-semibold text-slate-700 min-w-[140px] text-center">
                                {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                            </div>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md transition-all shadow-sm shadow-transparent hover:shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium">Mevcut Bakiye</span>
                            {balance !== null ? (
                                <span className={`font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{balance} Saat</span>
                            ) : (
                                <button
                                    onClick={handleCheckBalance}
                                    disabled={loadingBalance}
                                    className="text-blue-600 hover:text-blue-700 font-bold text-xs"
                                >
                                    {loadingBalance ? '...' : 'Sorgula'}
                                </button>
                            )}
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium">Toplam Kayıt</span>
                            <span className="font-bold text-slate-700">{shifts.length}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium">Personel</span>
                            <span className="font-bold text-slate-700">{uniqueUsers}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium">Toplam Efor</span>
                            <span className="font-bold text-emerald-600">{totalHours}s</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="relative min-h-[400px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {shifts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Calendar className="w-12 h-12 mb-3 opacity-20" />
                            <p>Bu ay için kayıt bulunamadı.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                    <th className="px-6 py-4 font-medium">Personel</th>
                                    <th className="px-6 py-4 font-medium">Tarih</th>
                                    <th className="px-6 py-4 font-medium">Detay</th>
                                    <th className="px-6 py-4 font-medium text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {shifts.map((shift, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100/50">
                                                    {(shift.name || shift.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-700">{shift.name || 'İsimsiz'}</span>
                                                    <span className="text-xs text-slate-400">{shift.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-medium">
                                                    {new Date(shift.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(shift.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-slate-700 line-clamp-1" title={shift.description}>
                                                    {shift.description}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{shift.startTime} - {shift.endTime}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${shift.shiftType === 'weekend'
                                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                                : shift.shiftType === 'holiday'
                                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                {shift.shiftType === 'weekend' ? 'Hafta Sonu' :
                                                    shift.shiftType === 'holiday' ? 'Resmi Tatil' : 'Hafta İçi'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Section */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
                    <span>Toplam {shifts.length} kayıt listeleniyor</span>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 hover:text-slate-700 transition-colors disabled:opacity-50" disabled={shifts.length === 0}>
                            <Download className="w-3.5 h-3.5" />
                            Excel İndir
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                onClick={handleDownloadPetition}
                                disabled={shifts.length === 0 || generatingPdf}
                                className="flex items-center gap-2 hover:text-slate-700 transition-colors disabled:opacity-50"
                            >
                                {generatingPdf ? (
                                    <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FileText className="w-3.5 h-3.5" />
                                )}
                                Dilekçe İndir
                            </button>
                        )}
                        {user?.role === 'admin' && (
                            <button
                                onClick={handleProcessShifts}
                                disabled={shifts.length === 0 || processing}
                                className={`flex items-center gap-2 transition-colors disabled:opacity-50 ${isProcessed
                                    ? 'text-emerald-700 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100/50 px-2 py-1 rounded'
                                    : 'hover:text-slate-700'
                                    }`}
                            >
                                {processing ? (
                                    <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FileText className={`w-3.5 h-3.5 ${isProcessed ? 'text-emerald-600' : ''}`} />
                                )}
                                {processing ? 'İşleniyor...' : isProcessed ? 'Tekrar İşle (İşlendi)' : 'Aylık Mesaileri İşle'}
                            </button>
                        )}
                        {isProcessed && (
                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                ✓ İşlendi
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
