import React from "react";
import { X, LogOut, Settings, FolderOpen, List, Home, Calendar } from "lucide-react";
import { PostizAccount } from "../../types";

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: PostizAccount[];
  assetsCount: number;
  scheduledPostsCount: number;
}

export default function MobileSidebar({ isOpen, onClose, accounts, assetsCount, scheduledPostsCount }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-[85%] max-w-sm h-full bg-[#050505] border-r border-[#1C1C1F] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="p-4 border-b border-[#1C1C1F] flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-md bg-[#111113] border border-[#27272a] flex items-center justify-center">
               <span className="text-[#b388ff] font-bold text-lg">P</span>
             </div>
             <div>
               <h2 className="text-sm font-bold text-white uppercase tracking-widest">PTN HQ</h2>
               <p className="text-[10px] text-zinc-500 font-mono">v2.0.0 Mobile</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 active:text-white rounded-full bg-[#111113] border border-[#27272a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Profile</h3>
            <div className="bg-[#111113] border border-[#27272a] rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">ptnmgmt</h4>
                <p className="text-[10px] text-[#b388ff] font-mono">Pro Plan</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <FolderOpen className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-bold text-white">{assetsCount}</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Assets</span>
              </div>
              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col items-center justify-center gap-1">
                <List className="w-5 h-5 text-[#b388ff]" />
                <span className="text-sm font-bold text-[#b388ff]">{scheduledPostsCount}</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Scheduled</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Accounts</h3>
            <div className="space-y-2">
              {accounts.map(acct => (
                <div key={acct.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#111113] transition-colors">
                  <img src={acct.avatar} alt="" className="w-8 h-8 rounded-md object-cover border border-[#27272a]" />
                  <span className="text-xs font-bold text-zinc-300">{acct.handle}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-[#1C1C1F] space-y-2">
          <button className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-zinc-400 bg-[#111113] border border-[#27272a] rounded-lg active:bg-[#1f1f22]">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
