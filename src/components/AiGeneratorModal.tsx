import React, { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, Lightbulb } from 'lucide-react';
import { PosterConfig } from '../types';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: Partial<PosterConfig>) => void;
}

const EXAMPLE_PROMPTS = [
  'Generate UPSC Mains weekly test syllabus for Geography, Polity, and Ethics',
  'Lakshya JEE 6-day class schedule with Physics, Chemistry, Maths & Doubt slots',
  'Yakeen NEET 2026 minor test syllabus for Electrostatics and Organic Chemistry',
  'PW Vidyapeeth offline batch timetable for Kota Center 5 days'
];

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyData
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-poster-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server error: ${res.status}`);
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }

      if (json.data) {
        const { batchName, title, startDate, endDate, tableData, type, syllabusType } = json.data;
        const numRows = tableData && tableData.length > 0 ? tableData.length : 4;
        const numCols = tableData && tableData.length > 0 && tableData[0]?.length > 0 ? tableData[0].length : 2;
        const finalTableData = tableData && tableData.length > 0 
          ? tableData 
          : Array.from({ length: numRows }, () => Array(numCols).fill(''));

        onApplyData({
          batchName: batchName || 'PW ACADEMIC ANNOUNCEMENT',
          title: title || 'TEST SYLLABUS',
          startDate: startDate || '',
          endDate: endDate || '',
          tableData: finalTableData,
          numRows,
          numCols,
          type: type || 'syllabus',
          syllabusType: syllabusType || 'Long'
        });

        onClose();
        setPrompt('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong while generating data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 text-slate-800 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl">
            <Sparkles className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Gemini AI Poster Generator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Describe your timetable or syllabus requirement in plain text
            </p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a 5-day timetable for NEET Revision with Physics, Organic Chemistry and Biology lectures..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none font-medium"
          />

          {error && (
            <p className="text-xs text-red-700 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Example Quick Prompts */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Example Prompts:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(ex)}
                className="text-left text-xs bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-slate-700 p-2.5 rounded-xl transition-colors truncate font-medium"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Poster Data...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 fill-slate-950" />
                <span>Generate & Fill</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
