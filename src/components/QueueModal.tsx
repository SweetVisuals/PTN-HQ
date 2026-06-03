import React from 'react';
import { X, RefreshCcw, List, User, Layers, Clock } from 'lucide-react';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountsCount?: number;
  postsCount?: number;
}

export default function QueueModal({ isOpen, onClose, accountsCount = 0, postsCount = 0 }: QueueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md sm:backdrop-blur-[2px]">
      <div className="w-full h-full sm:w-[780px] sm:h-auto bg-[#111113] sm:border border-[#1f1f22] sm:rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-[#1f1f22] gap-4 sm:gap-0 pt-safe">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b388ff]/10 flex items-center justify-center border border-[#b388ff]/20 shadow-sm">
                <List className="h-4 w-4 text-[#b388ff]" />
              </div>
              <h2 className="text-[16px] font-bold text-white tracking-wide">Background Job Queue</h2>
            </div>
            {/* Close button on mobile right aligned in the header row */}
            <button onClick={onClose} className="sm:hidden p-2 text-zinc-400 hover:text-white bg-[#1a1a1c] rounded-full border border-[#27272a] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <button className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1C] hover:bg-[#242427] border border-[#27272a] rounded-md transition-colors text-[11px] font-medium text-white shadow-sm">
              <RefreshCcw className="w-3 h-3" />
              Sync & Calibrate
            </button>
            <button className="flex-shrink-0 flex items-center gap-2 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors">
              <RefreshCcw className="w-3 h-3" />
              Refresh
            </button>
            <div className="hidden sm:block w-[1px] h-4 bg-[#27272a] ml-1"></div>
            {/* Close button on desktop */}
            <button onClick={onClose} className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Stats Row */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#1f1f22] flex items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] font-medium text-zinc-500 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="text-white font-bold">{accountsCount}</span> Accounts
          </div>
          <div className="flex-shrink-0 w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-white font-bold">0</span> Batches
          </div>
          <div className="flex-shrink-0 w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <List className="h-3.5 w-3.5" />
            <span className="text-white font-bold">{postsCount}</span> Posts
          </div>
          <div className="flex-shrink-0 w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[#3b82f6] font-bold">0</span> Pending
          </div>
        </div>

        {/* Empty State Box */}
        <div className="flex-1 sm:flex-none p-4 sm:p-6 bg-[#0c0c0e]">
          <div className="flex flex-col items-center justify-center h-full sm:h-auto sm:py-20 border border-dashed border-[#27272a] rounded-xl bg-[#09090b]">
            <Layers className="h-10 w-10 text-zinc-700 mb-3" />
            <h3 className="text-zinc-400 text-[12px] font-medium tracking-wide">No jobs in the queue</h3>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 bg-[#141416] border-t border-[#1f1f22] pb-safe sm:pb-4">
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono tracking-wide">Jobs run sequentially by account. First account completes before second starts.</p>
        </div>
      </div>
    </div>
  );
}
