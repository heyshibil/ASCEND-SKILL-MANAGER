import { ChevronDown } from "lucide-react";
import React from "react";

export const CustomSelect = ({ value, onChange, options, label }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</label>}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 flex items-center justify-between w-full border px-3 h-9 rounded-[var(--radius-md)] cursor-pointer transition-all text-[14px]"
        style={{
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-base)',
          boxShadow: isOpen ? '0 0 0 2px rgba(37,99,235,0.15)' : 'none',
        }}
      >
        <span className="font-medium">{options.find(opt => opt.value === value)?.label || 'Select...'}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <div
        className={`absolute top-[calc(100%+4px)] left-0 w-full rounded-[var(--radius-lg)] z-50 overflow-hidden origin-top transition-all duration-200 ease-out ${isOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-1 pointer-events-none"}`}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className="px-3 py-2 text-[14px] cursor-pointer transition-colors flex items-center"
            style={{
              background: value === opt.value ? 'var(--accent-bg)' : 'transparent',
              color: value === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: value === opt.value ? 500 : 400,
            }}
            onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-raised)'; }}
            onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};