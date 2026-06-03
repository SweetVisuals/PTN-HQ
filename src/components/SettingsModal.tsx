import React, { useState } from 'react';
import { Settings, X, Key, CheckCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

export default function SettingsModal({ isOpen, onClose, onSave, currentApiKey = "" }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div 
        className="bg-[#0c0c0e] w-full max-w-md border border-[#1f1f22] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1f1f22] bg-[#050505]">
          <div className="flex items-center gap-2 text-white">
            <Settings className="w-4 h-4 text-[#b388ff]" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Key className="w-3.5 h-3.5" /> Postiz API Key
            </label>
            <input 
              type="password"
              placeholder="Enter your Postiz API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#050505] border border-[#27272a] rounded-[6px] px-3 py-2 text-[11px] text-white focus:outline-none focus:border-[#b388ff] font-mono placeholder:text-zinc-600 transition-colors"
            />
            <p className="text-[9px] text-zinc-500">
              Your API key is stored locally in your browser and is never sent to our servers.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-[#1f1f22] bg-[#050505] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-[#b388ff] text-[#1f1635] text-[10px] font-bold uppercase tracking-wider rounded-[4px] hover:bg-[#a67ceb] transition-colors"
          >
            {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : null}
            {isSaved ? 'Saved' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
