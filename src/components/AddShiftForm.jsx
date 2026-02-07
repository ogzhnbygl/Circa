import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function AddShiftForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        shiftType: 'weekday', // weekday, weekend, holiday
        startTime: '09:00',
        endTime: '17:00',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Mesai Ekle</h2>
                <button className="text-slate-400 hover:text-slate-600">
                    <Calendar className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* DATE */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">TARIH</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium"
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                </div>

                {/* SHIFT TYPE */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">MESAI TIPI</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, shiftType: 'weekday' })}
                            className={`h-10 rounded-lg text-sm font-semibold transition-all ${formData.shiftType === 'weekday'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Hafta İçi
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, shiftType: 'weekend' })}
                            className={`h-10 rounded-lg text-sm font-semibold transition-all ${formData.shiftType === 'weekend'
                                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Hafta Sonu
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, shiftType: 'holiday' })}
                            className={`h-10 rounded-lg text-sm font-semibold transition-all ${formData.shiftType === 'holiday'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Resmi Tatil
                        </button>
                    </div>
                </div>

                {/* TIME RANGE */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">BAŞLANGIÇ SAATİ</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium appearance-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">BITIŞ SAATİ</label>
                        <div className="relative">
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 font-medium appearance-none"
                            />
                        </div>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">AÇIKLAMA</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Bugün neler yaptınız?"
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 resize-none"
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span className="text-xl font-light">+</span>
                    <span>Kaydet</span>
                </button>
            </form>
        </div>
    );
}
