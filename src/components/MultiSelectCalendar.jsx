import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MultiSelectCalendar({ selectedDates = [], onChange }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday, ... 6 = Saturday
        // We want Monday to be the first day of the week (0)
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const toggleDate = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0];

        let newSelectedDates;
        if (selectedDates.includes(dateStr)) {
            newSelectedDates = selectedDates.filter(d => d !== dateStr);
        } else {
            newSelectedDates = [...selectedDates, dateStr].sort();
        }

        onChange(newSelectedDates);
    };

    const isSelected = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0];
        return selectedDates.includes(dateStr);
    };

    const renderDays = () => {
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const selected = isSelected(i);
            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => toggleDate(i)}
                    className={`h-10 w-10 text-sm rounded-full flex items-center justify-center transition-all ${selected
                            ? 'bg-blue-600 text-white font-bold shadow-md'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 select-none">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded-lg">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h3 className="text-sm font-bold text-slate-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                    <div key={day} className="text-xs font-semibold text-slate-400">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 place-items-center">
                {renderDays()}
            </div>

            <div className="mt-3 text-xs text-center text-slate-400">
                {selectedDates.length} gün seçildi
            </div>
        </div>
    );
}
