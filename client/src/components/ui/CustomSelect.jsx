import { ChevronDown } from "lucide-react";
import React from "react";


export const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 flex items-center justify-between w-full bg-white border text-slate-800 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm shadow-sm hover:border-indigo-400 ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-300'}`}
      >
        <span className="font-medium">{options.find(opt => opt.value === value)?.label || 'Select...'}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`} />
      </div>
      
      <div className={`absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-slate-200/80 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 overflow-hidden origin-top transition-all duration-200 ease-out ${isOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2 pointer-events-none"}`}>
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center ${
              value === opt.value 
                ? "bg-indigo-50/80 text-indigo-700 font-semibold border-l-2 border-indigo-500 pl-2.5" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent pl-2.5"
            }`}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};