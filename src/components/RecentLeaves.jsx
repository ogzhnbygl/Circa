import React from 'react';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function RecentLeaves({ leaves, onViewAll, isAdmin, onApprove }) {

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    };

    const formatListDates = (dates) => {
        if (!dates || dates.length === 0) return '';
        if (dates.length === 1) return formatDate(dates[0]);
        return `${dates.length} Gün (${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])})`;
    };

    const getStatusBadge = (leave) => {
        const { status, _id } = leave;
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" /> Onaylandı
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3" /> Reddedildi
                    </span>
                );
            default:
                const isActionable = isAdmin && onApprove;
                return (
                    <span
                        onClick={(e) => {
                            if (isActionable) {
                                e.stopPropagation();
                                onApprove(_id);
                            }
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${isActionable ? 'cursor-pointer hover:bg-yellow-200 transition-colors' : ''}`}
                        title={isActionable ? 'Onaylamak için tıklayın' : ''}
                    >
                        <AlertCircle className="w-3 h-3" /> Bekliyor
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Son İzin Hareketleri</h2>
                <button onClick={onViewAll} className="text-blue-600 text-sm font-semibold hover:text-blue-700">Tümünü Gör</button>
            </div>

            <div className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                        Henüz izin kaydı bulunmuyor.
                    </div>
                ) : (
                    leaves.map((leave) => (
                        <div key={leave._id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${leave.unit === 'daily' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                        <div className="flex flex-col">
                                            {leave.name && <span className="text-xs font-bold text-blue-600">{leave.name}</span>}
                                            <span className="text-sm font-medium text-slate-900">
                                                {leave.unit === 'daily' ? 'Tam Gün İzin' : 'Saatlik İzin'}
                                            </span>
                                        </div>
                                        {getStatusBadge(leave)}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {leave.unit === 'daily'
                                                ? formatListDates(leave.dates)
                                                : `${formatDate(leave.singleDate)} (${leave.startTime} - ${leave.endTime})`
                                            }
                                        </span>
                                    </div>

                                    {leave.description && (
                                        <p className="text-sm text-slate-600 mt-1 pl-4 border-l-2 border-slate-200">
                                            {leave.description}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-bold text-slate-900">
                                        {leave.totalHours} Saat
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {formatDate(leave.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
