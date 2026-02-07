import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Save } from 'lucide-react';
import MultiSelectCalendar from './MultiSelectCalendar';

export default function LeaveForm({ onSubmit }) {
    const [unit, setUnit] = useState('daily'); // 'daily' | 'hourly'
    const [dates, setDates] = useState([new Date().toISOString().split('T')[0]]); // Default today
    const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [description, setDescription] = useState('');
    const [totalHours, setTotalHours] = useState(0);
    const [loading, setLoading] = useState(false);

    // Calculate total hours whenever inputs change
    useEffect(() => {
        calculateTotal();
    }, [unit, dates, startTime, endTime]);

    const calculateTotal = () => {
        if (unit === 'daily') {
            // 8 hours per day
            setTotalHours(dates.length * 8);
        } else {
            // Calculate format HH:mm difference
            const start = startTime.split(':').map(Number);
            const end = endTime.split(':').map(Number);

            const startMinutes = start[0] * 60 + start[1];
            const endMinutes = end[0] * 60 + end[1];

            let diff = (endMinutes - startMinutes) / 60;
            if (diff < 0) diff = 0; // Prevent negative
            setTotalHours(diff);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            unit,
            dates: unit === 'daily' ? dates : [],
            singleDate: unit === 'hourly' ? singleDate : null,
            startTime: unit === 'hourly' ? startTime : null,
            endTime: unit === 'hourly' ? endTime : null,
            totalHours,
            description
        };

        await onSubmit(payload);
        setLoading(false);
        // Reset form slightly or keep as is? Let's keep for now or parent handles reset
        setDescription('');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                İzin Talebi Oluştur
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Unit Selection */}
                <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setUnit('daily')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${unit === 'daily'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Tam Gün
                    </button>
                    <button
                        type="button"
                        onClick={() => setUnit('hourly')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${unit === 'hourly'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Saatlik
                    </button>
                </div>

                {/* Daily Inputs */}
                {unit === 'daily' && (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Tarihler</label>
                        <MultiSelectCalendar selectedDates={dates} onChange={setDates} />
                        <p className="text-xs text-slate-500">
                            Takvim üzerinden izinli olduğunuz günleri seçiniz.
                        </p>
                    </div>
                )}

                {/* Hourly Inputs */}
                {unit === 'hourly' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                            <input
                                type="date"
                                required
                                value={singleDate}
                                onChange={(e) => setSingleDate(e.target.value)}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                    <textarea
                        rows={3}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="İzin nedeni..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-slate-500">Toplam Süre:</span>
                        <span className="ml-2 font-bold text-slate-900 block sm:inline">
                            {totalHours} Saat
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || totalHours <= 0}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Kaydediliyor...' : 'Talep Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
