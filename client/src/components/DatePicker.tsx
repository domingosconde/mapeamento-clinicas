import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/calendar.css";

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: Date;
  disabled?: (date: Date) => boolean;
}

export default function DatePicker({
  onDateSelect,
  minDate,
  maxDate,
  selectedDate,
  disabled,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(selectedDate || new Date());

  const handleDateChange = (newDate: any) => {
    if (Array.isArray(newDate)) {
      setDate(newDate[0]);
      onDateSelect(newDate[0]);
    } else if (newDate instanceof Date) {
      setDate(newDate);
      onDateSelect(newDate);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (minDate && date < minDate) return true;
    // Disable future dates beyond maxDate
    if (maxDate && date > maxDate) return true;
    // Disable Sundays
    if (date.getDay() === 0) return true;
    // Custom disable function
    if (disabled && disabled(date)) return true;
    return false;
  };

  const tileDisabled = ({ date }: { date: Date }) => isDateDisabled(date);

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Selecione uma Data
      </h3>

      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange as any}
          value={date}
          minDate={minDate}
          maxDate={maxDate}
          tileDisabled={tileDisabled}
          locale="pt-BR"
          className="react-calendar"
          prevLabel={<ChevronLeft className="w-4 h-4" />}
          nextLabel={<ChevronRight className="w-4 h-4" />}
        />
      </div>

      {date && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Data Selecionada:</strong>
          </p>
          <p className="text-lg font-semibold text-blue-600 mt-1">
            {date.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <span className="text-green-600">✓</span> Domingos não estão disponíveis
        </p>
        <p className="flex items-center gap-2">
          <span className="text-green-600">✓</span> Apenas datas futuras podem ser selecionadas
        </p>
      </div>
    </Card>
  );
}
