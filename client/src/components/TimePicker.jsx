import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

const TimePicker = ({ label, value, onChange }) => {
  // Initialize state from props
  const [isOpen, setIsOpen] = useState(false);

  const parseTime = (val) => {
    if (!val) return { h: 12, m: 0, p: "AM", mode: "hours" };
    const [hStr, mStr] = val.split(":");
    let hVal = parseInt(hStr);
    const isPm = hVal >= 12;
    if (hVal > 12) hVal -= 12;
    if (hVal === 0) hVal = 12;
    return { h: hVal, m: parseInt(mStr), p: isPm ? "PM" : "AM" };
  };

  const initial = parseTime(value);
  const [mode, setMode] = useState("hours");
  const [hour, setHour] = useState(initial.h);
  const [minute, setMinute] = useState(initial.m);
  const [period, setPeriod] = useState(initial.p);
  const clockRef = useRef(null);

  // Sync when value prop changes (if external update happens)
  useEffect(() => {
    if (value) {
      const { h, m, p } = parseTime(value);
      setHour(h);
      setMinute(m);
      setPeriod(p);
    }
  }, [value]);

  const handleClockClick = (e) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate angle
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) + Math.PI / 2; // Shift so up is 0
    if (angle < 0) angle += 2 * Math.PI;

    const degrees = (angle * 180) / Math.PI;

    if (mode === "hours") {
      let selected = Math.round(degrees / 30);
      if (selected === 0) selected = 12;
      setHour(selected);
      setMode("minutes"); // Auto advance
    } else {
      let selected = Math.round(degrees / 6);
      if (selected === 60) selected = 0;
      setMinute(selected);
    }
  };

  const handleSave = () => {
    // Convert back to 24h string "HH:mm"
    let h = hour;
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const hStr = h.toString().padStart(2, "0");
    const mStr = minute.toString().padStart(2, "0");
    onChange(`${hStr}:${mStr}`);
    setIsOpen(false);
  };

  // Render numbers
  const renderNumbers = () => {
    const nums = [];
    const count = mode === "hours" ? 12 : 12; // Draw 12 main points for both
    const step = 30; // 360 / 12

    for (let i = 1; i <= count; i++) {
      const deg = i * step - 90; // -90 to start at 12 o'clock
      const rad = (deg * Math.PI) / 180;
      const radius = 100; // inner radius text
      const cx = 128 + radius * Math.cos(rad);
      const cy = 128 + radius * Math.sin(rad);

      let text = i;
      if (mode === "minutes")
        text = (i === 12 ? 0 : i * 5).toString().padStart(2, "0");

      const isSelected =
        mode === "hours"
          ? text == hour
          : parseInt(text) === minute ||
            (minute > (i - 1) * 5 && minute < i * 5 && i * 5 - minute < 3); // simple approximation for minutes highlighting

      nums.push(
        <text
          key={i}
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-sm font-bold pointer-events-none select-none ${isSelected ? "fill-white" : "fill-gray-600"}`}
        >
          {text}
        </text>,
      );
    }
    return nums;
  };

  // Needle Rotation
  const getRotation = () => {
    if (mode === "hours") return (hour % 12) * 30; // 30 deg per hour
    return minute * 6; // 6 deg per minute
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full border rounded-lg px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-brand-blue cursor-pointer hover:bg-gray-50 bg-white"
      >
        <Clock className="w-4 h-4 text-gray-500" />
        <span className={`${value ? "text-gray-900" : "text-gray-400"} whitespace-nowrap`}>
          {value
            ? `${hour}:${minute.toString().padStart(2, "0")} ${period}`
            : label || "Select Time"}
        </span>
      </div>

      {isOpen && (
        <React.Fragment>
          <div
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[70] bottom-full mb-2 p-4 bg-white rounded-xl shadow-xl border border-gray-100 w-[280px] animate-in zoom-in-95 duration-200 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
            {/* Header / Inputs */}
            <div className="flex justify-center items-center gap-2 mb-4">
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (val > 12) val = 12;
                  if (val < 1) val = 1;
                  setHour(val);
                }}
                className="w-16 h-16 text-3xl font-bold text-center bg-gray-50 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none"
              />
              <span className="text-3xl font-bold text-gray-300 pb-1">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minute.toString().padStart(2, "0")}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  if (val > 59) val = 59;
                  if (val < 0) val = 0;
                  setMinute(val);
                }}
                className="w-16 h-16 text-3xl font-bold text-center bg-gray-50 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none"
              />
              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={() => setPeriod("AM")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${period === "AM" ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                >
                  AM
                </button>
                <button
                  onClick={() => setPeriod("PM")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${period === "PM" ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default TimePicker;
