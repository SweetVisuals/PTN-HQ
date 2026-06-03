import React, { useState } from "react";
import { X, ChevronRight, Check, Image as ImageIcon, Type, FolderOpen } from "lucide-react";
import { PostizAccount } from "../../types";

interface WizardProps {
  accounts: PostizAccount[];
  onTriggerNotification: (msg: string, type: 'success'|'info') => void;
  onClose: () => void;
}

export default function MobileQuickModeWizard({ accounts, onTriggerNotification, onClose }: WizardProps) {
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<PostizAccount | null>(null);
  
  // Wizard state
  const [templateTitle, setTemplateTitle] = useState("Can You Rotate?");
  const [slidesCount, setSlidesCount] = useState("3");
  const [replacement1, setReplacement1] = useState("Chill... its just a song...");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step === 1 && !selectedAccount) {
      onTriggerNotification("Please select an account first", "info");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleLaunch = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onTriggerNotification(`Batch scheduled for ${selectedAccount?.name}`, "success");
      onClose();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="h-14 bg-[#050505] border-b border-[#1C1C1F] flex items-center px-4 shrink-0 relative">
        <button onClick={onClose} className="absolute left-4 p-2 text-zinc-400">
          <X className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-white uppercase tracking-widest">
          Quick Mode Wizard
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#1C1C1F] flex w-full">
        <div className="h-full bg-[#b388ff] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Select Account</h2>
              <p className="text-sm text-zinc-500">Which account will receive this batch of generated content?</p>
            </div>
            
            <div className="space-y-3">
              {accounts.map(acct => (
                <div 
                  key={acct.id}
                  onClick={() => setSelectedAccount(acct)}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                    selectedAccount?.id === acct.id 
                      ? 'bg-[#b388ff]/10 border-[#b388ff]' 
                      : 'bg-[#111113] border-[#27272a]'
                  }`}
                >
                  <img src={acct.avatar} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-base">{acct.name}</h3>
                    <p className="text-xs text-zinc-500">{acct.handle}</p>
                  </div>
                  {selectedAccount?.id === acct.id && (
                    <Check className="w-6 h-6 text-[#b388ff]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Template Setup</h2>
              <p className="text-sm text-zinc-500">Configure the slides and layout for the batch.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" /> Template Title
                </label>
                <input 
                  type="text" 
                  value={templateTitle}
                  onChange={e => setTemplateTitle(e.target.value)}
                  className="w-full bg-[#111113] border border-[#27272a] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#b388ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Slides Count
                </label>
                <input 
                  type="number" 
                  value={slidesCount}
                  onChange={e => setSlidesCount(e.target.value)}
                  className="w-full bg-[#111113] border border-[#27272a] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#b388ff]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Dynamic Replacements</h2>
              <p className="text-sm text-zinc-500">Final text adjustments for your templates.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-4 h-4" /> Replacement Text 1
                </label>
                <textarea 
                  rows={3}
                  value={replacement1}
                  onChange={e => setReplacement1(e.target.value)}
                  className="w-full bg-[#111113] border border-[#27272a] rounded-lg p-4 text-sm text-white focus:outline-none focus:border-[#b388ff] resize-none"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-4 bg-[#050505] border-t border-[#1C1C1F]">
        {step < 3 ? (
          <button 
            onClick={handleNext}
            className="w-full bg-[#b388ff] text-[#1f1635] font-bold text-sm uppercase tracking-widest p-4 rounded-xl flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleLaunch}
            disabled={isGenerating}
            className="w-full bg-[#b388ff] text-[#1f1635] font-bold text-sm uppercase tracking-widest p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? "Processing..." : "Launch Batch"} 
            {!isGenerating && <Check className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
