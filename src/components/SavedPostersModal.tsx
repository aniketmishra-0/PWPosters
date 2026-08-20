import React from 'react';
import { SavedPoster, PosterConfig } from '../types';
import { FolderOpen, X, Trash2, Calendar, FileCheck, ArrowRight } from 'lucide-react';

interface SavedPostersModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPosters: SavedPoster[];
  onLoadPoster: (config: PosterConfig) => void;
  onDeletePoster: (id: string) => void;
  onClearAll: () => void;
}

export const SavedPostersModal: React.FC<SavedPostersModalProps> = ({
  isOpen,
  onClose,
  savedPosters,
  onLoadPoster,
  onDeletePoster,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Posters History</h2>
              <p className="text-xs text-slate-500 font-medium">
                Quickly switch between your stored timetables and test syllabi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Items List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {savedPosters.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileCheck className="w-10 h-10 mx-auto opacity-30 text-purple-600" />
              <p className="text-sm font-bold text-slate-700">No saved posters yet</p>
              <p className="text-xs text-slate-500">
                Click "Save Poster to Local Storage" in the configuration panel to save your work.
              </p>
            </div>
          ) : (
            savedPosters.map((poster) => (
              <div
                key={poster.id}
                className="bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-xl p-4 flex items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        poster.config.type === 'syllabus'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : poster.config.type === 'announcement'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {poster.config.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {poster.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 truncate">
                    {poster.config.title || 'Untitled Poster'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {poster.createdAt}
                    </span>
                    <span>
                      {poster.config.numRows} × {poster.config.numCols} Grid
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPoster(poster.config);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePoster(poster.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                    title="Delete saved item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedPosters.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">{savedPosters.length} poster(s) saved</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all saved posters? This cannot be undone.')) {
                  onClearAll();
                }
              }}
              className="text-slate-500 hover:text-red-600 font-bold transition-colors"
            >
              Clear all saved history
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
