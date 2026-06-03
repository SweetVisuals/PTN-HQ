import React, { useState } from "react";
import { X, Play, Music, GripVertical, Check } from "lucide-react";
import { ImportedAsset, PostizAccount } from "../../types";

interface EditorProps {
  asset: ImportedAsset;
  accounts: PostizAccount[];
  onClose: () => void;
  onTriggerNotification: (msg: string, type: 'success' | 'info') => void;
}

export default function MobileEditorPreview({ asset, accounts, onClose, onTriggerNotification }: EditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.id || "");
  const [overlayText, setOverlayText] = useState("Wait till the end! 🤯");
  const [isRendering, setIsRendering] = useState(false);

  const handleRender = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      onTriggerNotification("Manual video rendered successfully!", "success");
      onClose();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="h-14 bg-[#050505] border-b border-[#1C1C1F] flex items-center px-4 shrink-0 relative">
        <button onClick={onClose} className="absolute left-4 p-2 text-zinc-400">
          <X className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-white uppercase tracking-widest">
          Editor Preview
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Video Preview */}
        <div className="relative w-full aspect-[9/16] bg-black max-h-[50vh] flex items-center justify-center">
          <img src={asset.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Overlay Text Preview */}
          <div className="absolute top-1/4 left-0 w-full text-center px-4">
            <span className="text-white font-bold text-2xl drop-shadow-xl tiktok-sans-text">{overlayText}</span>
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 m-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>

        {/* Editor Controls */}
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Text Overlay</h3>
            <input 
              type="text" 
              value={overlayText}
              onChange={e => setOverlayText(e.target.value)}
              className="w-full bg-[#111113] border border-[#27272a] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#b388ff]"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Audio Selection</h3>
            <div className="bg-[#111113] border border-[#27272a] rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center">
                <Music className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Trending Phonk Beat</p>
                <p className="text-[10px] text-zinc-500 font-mono">0:35 • Extracted from TikTok</p>
              </div>
              <button className="px-3 py-1 bg-[#1f1f22] text-xs font-bold text-white rounded uppercase">Change</button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Account</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {accounts.map(acct => (
                <div 
                  key={acct.id}
                  onClick={() => setSelectedAccount(acct.id)}
                  className={`flex-shrink-0 flex items-center gap-2 p-2 pr-4 rounded-full border transition-colors ${
                    selectedAccount === acct.id 
                      ? 'bg-[#b388ff]/10 border-[#b388ff]' 
                      : 'bg-[#111113] border-[#27272a]'
                  }`}
                >
                  <img src={acct.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <span className="text-xs font-bold text-white">{acct.handle}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Render Action */}
      <div className="p-4 bg-[#050505] border-t border-[#1C1C1F]">
        <button 
          onClick={handleRender}
          disabled={isRendering}
          className="w-full bg-[#b388ff] text-[#1f1635] font-bold text-sm uppercase tracking-widest p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRendering ? "Rendering..." : "Render & Schedule"}
          {!isRendering && <Check className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
