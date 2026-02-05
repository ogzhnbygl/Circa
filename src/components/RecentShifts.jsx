import React from 'react';
import { Clock } from 'lucide-react';

export default function RecentShifts({ shifts = [] }) {

    // Format date helper: "05 OCT" styling
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Turkish month abbreviation manually map if needed, or use toLocaleDateString
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase();
        return { day, month };
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Son Hareketler</h2>
                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">Tümünü Gör</button>
            </div>

            <div className="space-y-4">
                {shifts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Henüz hiç mesai kaydı girmediniz.
                    </div>
                ) : (
                    shifts.map((shift, index) => {
                        const { day, month } = formatDate(shift.date);
                        const isWeekend = shift.shiftType === 'weekend';

                        return (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                {/* Date Box */}
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg flex-shrink-0 ${isWeekend ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <span className="text-xs font-bold opacity-80">{month}</span>
                                    <span className="text-xl font-bold leading-none">{day}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {shift.userName && (
                                        <div className="text-xs font-bold text-blue-600 mb-0.5">{shift.userName}</div>
                                    )}
                                    <h3 className="font-bold text-slate-800 truncate">{shift.description || 'Mesai'}</h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm font-medium">
                                        <Clock className="w-3.5 h-3.5 opacity-70" />
                                        <span>{shift.startTime} - {shift.endTime}</span>
                                    </div>
                                </div>

                                {/* Tag */}
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isWeekend
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {isWeekend ? 'Hafta Sonu' : 'Hafta İçi'}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
