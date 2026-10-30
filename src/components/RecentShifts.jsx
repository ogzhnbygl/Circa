import React, { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';

export default function RecentShifts({ shifts = [], currentUser, onDeleteShift, onViewAll }) {
    const [deletingId, setDeletingId] = useState(null);

    // Format date helper without UTC midnight timezone shift
    const formatDate = (dateString) => {
        const safeStr = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
            ? `${dateString}T00:00:00`
            : dateString;
        const date = new Date(safeStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase();
        const year = date.getFullYear();
        return { day, month, year };
    };

    const handleDeleteClick = async (shiftId) => {
        if (!onDeleteShift || !shiftId) return;
        setDeletingId(shiftId);
        try {
            await onDeleteShift(shiftId);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Son Hareketler</h2>
                <button type="button" onClick={onViewAll} className="text-blue-600 text-sm font-semibold hover:text-blue-700">Tümünü Gör</button>
            </div>

            <div className="space-y-4">
                {shifts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Henüz hiç mesai kaydı girmediniz.
                    </div>
                ) : (
                    [...shifts].sort((a, b) => {
                        const dateA = new Date(a.createdAt || a.date);
                        const dateB = new Date(b.createdAt || b.date);
                        return dateB - dateA;
                    }).map((shift, index) => {
                        const { day, month, year } = formatDate(shift.date);
                        const isWeekend = shift.shiftType === 'weekend';
                        const isHoliday = shift.shiftType === 'holiday';

                        let dateBoxClass = 'bg-blue-50 text-blue-600';
                        if (isWeekend) dateBoxClass = 'bg-orange-50 text-orange-600';
                        if (isHoliday) dateBoxClass = 'bg-rose-50 text-rose-600';

                        let tagClass = 'bg-blue-100 text-blue-700';
                        let tagText = 'Hafta İçi';

                        if (isWeekend) {
                            tagClass = 'bg-orange-100 text-orange-700';
                            tagText = 'Hafta Sonu';
                        } else if (isHoliday) {
                            tagClass = 'bg-rose-100 text-rose-700';
                            tagText = 'Resmi Tatil';
                        }

                        const canDelete = Boolean(
                            onDeleteShift &&
                            shift._id &&
                            (currentUser?.role === 'admin' || (currentUser?.email && shift.email === currentUser.email))
                        );

                        return (
                            <div key={shift._id || index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                {/* Date Box */}
                                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg flex-shrink-0 ${dateBoxClass}`}>
                                    <span className="text-[10px] font-bold opacity-80 leading-none">{month} '{String(year).slice(-2)}</span>
                                    <span className="text-xl font-bold leading-none mt-0.5">{day}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {shift.name && (
                                        <div className="text-xs font-bold text-blue-600 mb-0.5">{shift.name}</div>
                                    )}
                                    <h3 className="font-bold text-slate-800 truncate">{shift.description || 'Mesai'}</h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm font-medium">
                                        <Clock className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                                        <span>{shift.startTime} - {shift.endTime}</span>
                                    </div>
                                </div>

                                {/* Tag & Delete */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${tagClass}`}>
                                        {tagText}
                                    </div>
                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(shift._id)}
                                            disabled={deletingId === shift._id}
                                            aria-label="Mesai kaydını sil"
                                            title="Mesai kaydını sil"
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
