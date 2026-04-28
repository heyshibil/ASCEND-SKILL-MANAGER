import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning'
}) {
  if (!isOpen) return null;

  const iconBg = type === "danger" ? "var(--danger-bg)" : "var(--warning-bg)";
  const iconColor = type === "danger" ? "var(--danger)" : "var(--warning)";
  const btnBg = type === "danger" ? "var(--danger)" : "var(--warning)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-[var(--radius-xl)] p-6 w-full max-w-[480px] relative" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: iconBg }}
          >
            {type === "danger" ? (
              <Trash2 className="w-5 h-5" style={{ color: iconColor }} />
            ) : (
              <AlertTriangle className="w-5 h-5" style={{ color: iconColor }} />
            )}
          </div>
          <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-2">{title}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] px-2 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors border"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-base)', background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-raised)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 h-9 rounded-[var(--radius-md)] text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: btnBg }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
