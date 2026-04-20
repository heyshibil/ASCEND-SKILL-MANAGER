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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      {/* Container Animation */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all transform scale-100 opacity-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bulk Seed JSON</h2>
            <p className="text-sm text-slate-500 mt-1">Paste an array of perfectly formatted question objects.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* CodeMirror IDE Space */}
        <div className="p-6 flex-1 min-h-[400px]">
           <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-full font-mono text-sm">
            <CodeMirror
              value={jsonInput}
              height="450px"
              extensions={[json()]}
              onChange={(value) => setJsonInput(value)}
              theme="light"
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition">
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={handleBulkSeed} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition
            ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"}`}
          >
            <UploadCloud className="w-4 h-4" />
            {loading ? "Validating Array..." : "Validate & Seed Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
