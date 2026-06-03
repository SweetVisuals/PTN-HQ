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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="w-[780px] bg-[#111113] border border-[#1f1f22] rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1f1f22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#b388ff]/10 flex items-center justify-center border border-[#b388ff]/20 shadow-sm">
              <List className="h-4 w-4 text-[#b388ff]" />
            </div>
            <h2 className="text-[16px] font-bold text-white tracking-wide">Background Job Queue</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1C] hover:bg-[#242427] border border-[#27272a] rounded-md transition-colors text-[11px] font-medium text-white shadow-sm">
              <RefreshCcw className="w-3 h-3" />
              Sync & Calibrate
            </button>
            <button className="flex items-center gap-2 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors">
              <RefreshCcw className="w-3 h-3" />
              Refresh
            </button>
            <div className="w-[1px] h-4 bg-[#27272a] ml-1"></div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Stats Row */}
        <div className="px-6 py-4 border-b border-[#1f1f22] flex items-center gap-5 text-[11px] font-medium text-zinc-500">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="text-white font-bold">{accountsCount}</span> Accounts
          </div>
          <div className="w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-white font-bold">0</span> Batches
          </div>
          <div className="w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex items-center gap-2">
            <List className="h-3.5 w-3.5" />
            <span className="text-white font-bold">{postsCount}</span> Posts
          </div>
          <div className="w-[1px] h-3 bg-[#27272a]"></div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[#3b82f6] font-bold">0</span> Pending
          </div>
        </div>

        {/* Empty State Box */}
        <div className="p-6 bg-[#0c0c0e]">
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#27272a] rounded-xl bg-[#09090b]">
            <Layers className="h-10 w-10 text-zinc-700 mb-3" />
            <h3 className="text-zinc-400 text-[12px] font-medium tracking-wide">No jobs in the queue</h3>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141416] border-t border-[#1f1f22]">
          <p className="text-[10px] text-zinc-500 font-mono tracking-wide">Jobs run sequentially by account. First account completes before second starts.</p>
        </div>
      </div>
    </div>
  );
}
