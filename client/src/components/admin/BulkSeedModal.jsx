import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { X, UploadCloud } from "lucide-react";
import { adminService } from "../../services/adminServices";
import { toast } from "sonner";

export default function BulkSeedModal({ isOpen, onClose }) {
  const [jsonInput, setJsonInput] = useState('[\n  {   "json": "paste your json here"  }\n]');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBulkSeed = async () => {
    try {
      setLoading(true);
      const parsedData = JSON.parse(jsonInput);

      if (!Array.isArray(parsedData)) {
        throw new Error("Input must be a valid JSON array [ ] of objects.");
      }

      // 2. Dispatch to Backend
      const response = await adminService.createBulkQuestions(parsedData);

      toast.success(response.message || "Bulk seed successful!");

      // If there were hidden validation errors
      if (response.data?.failed > 0) {
          toast.warning(`${response.data.failed} items failed. Check console for details.`);
          console.warn("Bulk Seed Failures:", response.data.errors);
      }

      setJsonInput('[\n  {   "json": "paste your json here"  }\n]')
      onClose();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON format. Check for trailing commas or missing quotes.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to bulk seed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-4xl rounded-[var(--radius-xl)] flex flex-col overflow-hidden" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>

        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
          <div>
            <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Bulk seed JSON</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Paste an array of perfectly formatted question objects.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CodeMirror */}
        <div className="p-6 flex-1 min-h-[400px]">
           <div className="rounded-[var(--radius-lg)] overflow-hidden border h-full font-[var(--font-mono)] text-[14px]" style={{ borderColor: 'var(--border-base)' }}>
            <CodeMirror
              value={jsonInput}
              height="450px"
              extensions={[json()]}
              onChange={(value) => setJsonInput(value)}
              theme="light"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
          <button onClick={onClose} className="px-4 h-9 rounded-[var(--radius-md)] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] transition">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleBulkSeed}
            className="flex items-center gap-2 px-5 h-9 rounded-[var(--radius-md)] text-[14px] font-medium text-white transition bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            {loading ? "Validating array..." : "Validate & seed data"}
          </button>
        </div>
      </div>
    </div>
  );
}
