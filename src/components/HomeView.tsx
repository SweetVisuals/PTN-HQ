import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Link as LinkIcon, 
  Download, 
  Trash, 
  Save,
  FolderOpen,
  Check,
  Music,
  Type,
  Play,
  GripVertical,
  Scissors,
  Search,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { ImportedAsset, PostizAccount, ScheduledPost } from "../types";

export interface HomeViewProps {
  assets: ImportedAsset[];
  accounts: PostizAccount[];
  scheduledPosts: ScheduledPost[];
  onImportLink: (url: string) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  onQuickLoadToEditor: (asset: ImportedAsset) => void;
  isLoadingAsset: boolean;
  onUpdateAccount: (id: string, updatedFields: any) => Promise<void>;
  onRunAgent: (id: string) => Promise<void>;
  onAddScheduledPost: (post: any) => Promise<void>;
  onTriggerNotification: (message: string, type: 'success' | 'info') => void;
}

const AccountCard: React.FC<{
  acct: PostizAccount;
  onUpdateAccount: (id: string, fields: any) => Promise<void>;
  onRunAgent: (id: string) => Promise<void>;
  onTriggerNotification: (msg: string, type: 'success' | 'info') => void;
}> = ({ acct, onUpdateAccount, onRunAgent, onTriggerNotification }) => {
  const [localTheme, setLocalTheme] = useState(acct.theme || "");
  const [localGoal, setLocalGoal] = useState(acct.goal || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateAccount(acct.id, { theme: localTheme, goal: localGoal });
    setIsSaving(false);
    onTriggerNotification(`Settings updated for ${acct.handle}`, 'success');
  };

  return (
    <div className="bg-[#111113] border border-[#1f1f22] rounded-lg flex flex-col shadow-sm">
      <div className="p-3 flex items-center gap-2.5 border-b border-[#1f1f22]">
        <div className="w-8 h-8 rounded-[10px] overflow-hidden border border-[#27272a] shrink-0">
           <img src={acct.avatar} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-bold text-white truncate">{acct.handle}</h4>
          <p className="text-[9px] text-zinc-500">TikTok Account</p>
        </div>
        <button className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-[#1f1f22] text-zinc-500 hover:text-[#b388ff] transition">
          <FolderOpen className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <label className="text-[8px] uppercase font-medium tracking-widest text-zinc-500 font-mono">Theme</label>
          <input
            type="text"
            value={localTheme}
            onChange={(e) => setLocalTheme(e.target.value)}
            placeholder="e.g. Black luxury"
            className="w-full bg-[#050505] border border-[#27272a] rounded-[6px] px-3 py-1.5 text-[10px] text-zinc-300 focus:border-[#b388ff] focus:ring-1 focus:ring-[#b388ff]/20 focus:outline-none font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[8px] uppercase font-medium tracking-widest text-zinc-500 font-mono">Goal</label>
          <input
            type="text"
            value={localGoal}
            onChange={(e) => setLocalGoal(e.target.value)}
            placeholder="e.g. Promote track"
            className="w-full bg-[#050505] border border-[#27272a] rounded-[6px] px-3 py-1.5 text-[10px] text-zinc-300 focus:border-[#b388ff] focus:ring-1 focus:ring-[#b388ff]/20 focus:outline-none font-mono"
          />
        </div>

        <div className="pt-1 flex flex-col gap-1.5">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#1A1A1C] hover:bg-[#242427] border border-[#27272a] text-zinc-300 text-[10px] font-medium py-1.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="w-3 h-3" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>

          <button 
            onClick={() => onRunAgent(acct.id)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#b388ff]/10 hover:bg-[#b388ff]/20 border border-[#b388ff]/30 text-[#b388ff] font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> 
            Auto Schedule
          </button>
        </div>
      </div>

      <div className="p-2 border-t border-[#1f1f22] bg-[#09090b] rounded-b-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[#1f1f22] flex items-center justify-center border border-[#27272a]">
            <FolderOpen className="w-3 h-3 text-zinc-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storage</div>
          </div>
        </div>
        <div className="text-[9px] text-zinc-600 font-mono pr-1">{Math.floor(Math.random() * 50)} ITEMS</div>
      </div>
    </div>
  );
}

export default function HomeView({
  assets,
  accounts,
  scheduledPosts,
  onImportLink,
  onDeleteAsset,
  onQuickLoadToEditor,
  isLoadingAsset,
  onUpdateAccount,
  onRunAgent,
  onAddScheduledPost,
  onTriggerNotification
}: HomeViewProps) {
  const [leftTab, setLeftTab] = useState<'dashboard' | 'files' | 'accounts' | 'quick' | 'editor'>('dashboard');

  // Triggering load to editor
  const handleQuickLoad = (asset: any) => {
    onQuickLoadToEditor?.(asset);
    setLeftTab('editor');
  };
  const [urlInput, setUrlInput] = useState("");
  const [errorText, setErrorText] = useState("");

  const [songSearch, setSongSearch] = useState("Drake - Nonstop");
  const [isSearchingSong, setIsSearchingSong] = useState(false);
  
  const mockSongs = [
    { title: "Nonstop", artist: "Drake", duration: "3:58" },
    { title: "God's Plan", artist: "Drake", duration: "3:18" },
    { title: "One Dance", artist: "Drake", duration: "2:53" },
    { title: "Jimmy Cooks", artist: "Drake", duration: "3:38" },
    { title: "As It Was", artist: "Harry Styles", duration: "2:47" },
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
    { title: "Starboy", artist: "The Weeknd", duration: "3:50" },
  ];

  const filteredSongs = mockSongs.filter(s => 
    s.title.toLowerCase().includes(songSearch.toLowerCase()) || 
    s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  const [overlays, setOverlays] = useState([{ id: "1", text: "Wait till the end! 🤯" }]);
  const [useTikTokFont, setUseTikTokFont] = useState(true);
  const [useBlackStroke, setUseBlackStroke] = useState(true);
  const [isGeneratingFiles, setIsGeneratingFiles] = useState(false);
  const [quickModeFolder, setQuickModeFolder] = useState<{accountName: string, folderName: string} | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    // Support bulk URLs by splitting on commas or newlines
    const urls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    
    for (const u of urls) {
      if (!u.includes("tiktok.com")) {
        setErrorText("Provide target TikTok videoclip links only.");
        setTimeout(() => setErrorText(""), 4000);
        return;
      }
    }

    try {
      setErrorText("");
      for (const u of urls) {
        await onImportLink(u);
      }
      setUrlInput("");
    } catch (err: any) {
      setErrorText(err.message || "Failed to parse reference clip");
    }
  };

  const getPlatformLabel = (url: string) => {
    if (url.includes("tiktok")) return "TIKTOK";
    return "CLIP";
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-[50%] flex flex-col border-r border-[#1C1C1F] bg-[#09090b]">
        
        {/* Sub Navigation */}
        <div className="h-11 border-b border-[#1C1C1F] flex items-center px-4 gap-5 shrink-0 bg-[#0c0c0e]">
          <button 
            onClick={() => setLeftTab('dashboard')}
            className={`h-full flex items-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              leftTab === 'dashboard' ? 'border-[#b388ff] text-[#b388ff]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setLeftTab('files')}
            className={`h-full flex items-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              leftTab === 'files' ? 'border-[#b388ff] text-[#b388ff]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Files
          </button>
          <button 
            onClick={() => setLeftTab('accounts')}
            className={`h-full flex items-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              leftTab === 'accounts' ? 'border-[#b388ff] text-[#b388ff]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Accounts
          </button>
          <button 
            onClick={() => setLeftTab('quick')}
            className={`h-full flex items-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              leftTab === 'quick' ? 'border-[#b388ff] text-[#b388ff]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-[12px] h-[12px] shrink-0 border border-current rounded-[3px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[7px] h-[7px]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </span>
              Quick Mode
            </div>
          </button>
          <button 
            onClick={() => setLeftTab('editor')}
            className={`h-full flex items-center text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ml-auto ${
              leftTab === 'editor' ? 'border-[#b388ff] text-[#b388ff]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Editor <Sparkles className="w-3 h-3 ml-1.5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {leftTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="bg-[#111113] border border-[#1f1f22] rounded-lg p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen className="h-3.5 w-3.5 text-[#b388ff]" />
                    Reference Analysis via DeepSeek AI
                  </h3>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Upload content references to automatically extract the stylistic intent, target psychology, and compositional structure.
                </div>
                <div className="border border-dashed border-[#27272a] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#1C1C1F]/50 transition-colors bg-[#0c0c0e]">
                  <ImageIcon className="w-6 h-6 text-zinc-600 mb-2" />
                  <p className="text-[11px] font-medium text-white mb-1">Click to Upload Reference</p>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase">MP4, JPG, PNG supported</p>
                </div>
                
                {/* Mocked Analysis Result */}
                <div className="mt-4 p-4 bg-[#09090b] border border-[#27272a] rounded-md space-y-3">
                  <div className="flex gap-2 items-center text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    <Check className="w-3.5 h-3.5" /> Analysis Complete
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-zinc-300">
                    <div className="bg-[#111113] p-3 rounded-md border border-[#1f1f22]">
                      <span className="text-[#b388ff] font-bold block mb-1">Aim / Goal</span>
                      High-retention short-form storytelling aimed at driving top-of-funnel conversion.
                    </div>
                    <div className="bg-[#111113] p-3 rounded-md border border-[#1f1f22]">
                      <span className="text-[#b388ff] font-bold block mb-1">Target Psychology</span>
                      Curiosity gap hook, fast-paced pacing (new frame every 1.5s), nostalgic vaporwave aesthetic.
                    </div>
                    <div className="bg-[#111113] p-3 rounded-md border border-[#1f1f22]">
                      <span className="text-[#b388ff] font-bold block mb-1">Pacing & Structure</span>
                      0-3s hook with bold text overlay. 3-8s problem introduction. 8-15s solution + CTA.
                    </div>
                    <div className="bg-[#111113] p-3 rounded-md border border-[#1f1f22]">
                      <span className="text-[#b388ff] font-bold block mb-1">Audio Profile</span>
                      Trending lo-fi / phonk beat with distinct bass drops timed to visual transitions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {leftTab === 'files' && (
            <div className="space-y-4">
              
              {/* Asset Scraper & Downloader */}
              <div className="bg-[#111113] border border-[#1f1f22] rounded-lg p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-[#b388ff]" />
                    Asset Scraper
                  </h3>
                  <div className="flex gap-2 text-[9px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> YouTube</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Pinterest</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> TikTok</span>
                  </div>
                </div>

                <form onSubmit={handleImport} className="space-y-2.5">
                  <textarea
                    rows={2}
                    placeholder="Paste bulk URLs from TikTok, Pinterest, or YouTube, separated by commas or newlines..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-md p-2.5 text-[11px] text-zinc-300 focus:outline-none focus:border-[#4c3a73] transition-colors resize-none placeholder:text-zinc-600 font-mono"
                  />
                  {errorText && (
                    <p className="text-[10px] text-rose-500">{errorText}</p>
                  )}
                  <div className="flex justify-between items-center bg-[#09090b]/50 p-1.5 rounded-md border border-[#1f1f22]/50">
                    <button className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5 hover:text-white transition px-1">
                      <div className="w-3 h-3 border border-zinc-600 rounded-[3px] flex items-center justify-center"><Check className="w-2 h-2 opacity-0 hover:opacity-100" /></div>
                      Select All
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingAsset || !urlInput.trim()}
                      className="bg-[#b388ff] hover:bg-[#a67ceb] disabled:bg-[#1f1f22] disabled:text-zinc-600 text-[#1f1635] font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-[4px] transition-colors flex items-center gap-2"
                    >
                      {isLoadingAsset ? 'Scraping...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Grid of Extracted Files */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
                {assets.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-[10px] uppercase tracking-widest text-zinc-600 font-mono">No assets downloaded.</div>
                ) : (
                  assets.map(asset => (
                    <div key={asset.id} className="group bg-[#111113] border border-[#1f1f22] rounded-md overflow-hidden flex flex-col hover:border-[#3e2376] hover:shadow-[0_0_15px_rgba(179,136,255,0.05)] transition-all cursor-pointer" onClick={() => onQuickLoadToEditor(asset)}>
                      <div className="aspect-square relative bg-[#050505] overflow-hidden">
                        <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100" alt="" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none rounded-t-md"></div>
                      </div>
                      <div className="p-2 border-t border-[#1f1f22]">
                        <h4 className="text-[9px] font-medium text-zinc-300 uppercase truncate font-mono tracking-wider">{asset.title || 'Untitled'}</h4>
                        <div className="text-[8px] text-zinc-600 mt-0.5 uppercase font-mono tracking-widest">{Math.floor(Math.random() * 200)} ITEMS</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {leftTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:gap-4">
              {accounts.map(acct => (
                <AccountCard 
                  key={acct.id} 
                  acct={acct} 
                  onUpdateAccount={onUpdateAccount} 
                  onRunAgent={onRunAgent} 
                  onTriggerNotification={onTriggerNotification} 
                />
              ))}
            </div>
          )}

          {leftTab === 'quick' && !quickModeFolder && (
            <div className="space-y-6">
              {accounts.map(acct => (
                <div key={acct.id} className="bg-[#111113] border border-[#1f1f22] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#1f1f22] flex gap-3 items-center bg-[#0c0c0e]">
                    <div className="w-10 h-10 rounded-md relative overflow-hidden bg-zinc-800">
                      <img src={acct.avatar} alt={acct.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 right-0 bg-[#b388ff] p-0.5 rounded-tl">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1f1635" strokeWidth="3" className="w-[8px] h-[8px]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">{acct.name}</h3>
                      <p className="text-[9px] text-zinc-500 font-mono tracking-wider">{acct.categories?.length || 1} LINKED FOLDER</p>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {/* Dummy folders for now based on categories or a default */}
                    {(acct.categories && acct.categories.length > 0 ? acct.categories : ['BLUE']).map(folder => (
                      <div key={folder} className="flex items-center justify-between bg-[#09090b] border border-[#27272a] rounded-md p-3 group hover:border-[#3e2376] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#111113] border border-[#1f1f22] flex items-center justify-center text-zinc-600 group-hover:text-[#b388ff] group-hover:border-[#b388ff]/30 transition-colors">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{folder}</h4>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-[8px] border border-[#27272a] px-1 rounded text-zinc-500 font-mono">FOLDER</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{Math.floor(Math.random() * 500) + 50} ASSETS</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setQuickModeFolder({ accountName: acct.name, folderName: folder })}
                          className="bg-[#b388ff] text-[#1f1635] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-[4px] hover:bg-[#a67ceb] transition-colors flex items-center gap-2"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[10px] h-[10px]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          Launch Quick Mode
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {leftTab === 'quick' && quickModeFolder && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1f1f22]">
                <button 
                  onClick={() => setQuickModeFolder(null)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Quick Mode: {quickModeFolder.folderName}</h2>
                  <p className="text-[9px] text-zinc-500 font-mono tracking-wider">BATCH POST TO {quickModeFolder.accountName} ACCOUNT</p>
                </div>
              </div>

              {/* Wizard Content */}
              <div className="space-y-6">
                
                {/* Template & Slides */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><FolderOpen className="w-3 h-3" /> Template Title</label>
                    <input type="text" defaultValue="Can You Rotate?" className="w-full bg-[#111113] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:outline-none focus:border-[#4c3a73]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Slides Per Post</label>
                    <input type="number" defaultValue="3" className="w-full bg-[#111113] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:outline-none focus:border-[#4c3a73]" />
                  </div>
                </div>

                {/* Schedule Start */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3 h-3" /> Batch Schedule Start</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input type="date" defaultValue="2026-06-03" className="w-full bg-[#111113] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:outline-none focus:border-[#4c3a73] [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                    <div className="flex-1 relative">
                      <input type="time" defaultValue="18:00" className="w-full bg-[#111113] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:outline-none focus:border-[#4c3a73] [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>
                    <div className="flex-1 bg-[#111113] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:border-[#4c3a73] flex justify-between items-center">
                      <span className="text-zinc-500 font-mono">INTERVAL (HRS)</span>
                      <span>4</span>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg> Social Hashtags</label>
                  <div className="bg-[#111113] border border-[#27272a] rounded-lg p-3 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {['tiktok', 'viral', 'city', 'night', 'cars', 'london', 'music'].map(tag => (
                        <span key={tag} className="bg-[#1f1f22] border border-[#27272a] rounded-[4px] px-2 py-1 text-[9px] text-zinc-300 flex items-center gap-1 hover:bg-[#27272a] cursor-pointer">
                          {tag} <span className="text-zinc-500">×</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Add hashtag (e.g. #fyp)..." className="flex-1 bg-[#09090b] border border-[#27272a] rounded-[4px] px-3 py-2 text-[10px] text-white focus:outline-none focus:border-[#4c3a73] font-mono" />
                      <button className="bg-[#1f1f22] text-zinc-300 text-[9px] font-bold uppercase tracking-wider px-4 rounded-[4px] hover:bg-[#27272a] transition-colors border border-[#27272a]">Add</button>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Output Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['SQUARE (1:1)', 'PORTRAIT (9:16)', 'STORY (9:16)', 'LANDSCAPE (16:9)'].map(ratio => (
                      <div key={ratio} className={`border ${ratio.includes('PORTRAIT') ? 'border-[#b388ff] bg-[#b388ff]/5' : 'border-[#27272a] bg-[#111113] hover:border-[#3e2376]'} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center`}>
                        <div className={`w-4 h-6 border-2 ${ratio.includes('PORTRAIT') ? 'border-[#b388ff] bg-[#b388ff]/20' : 'border-zinc-600 bg-[#1f1f22]'} rounded-[2px]`}></div>
                        <span className={`text-[8px] font-bold font-mono tracking-wider ${ratio.includes('PORTRAIT') ? 'text-[#b388ff]' : 'text-zinc-500'}`}>{ratio}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Dynamic Replacements */}
                <div className="space-y-4">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Type className="w-3 h-3" /> Text Dynamic Replacement</label>
                  
                  {[
                    { id: 1, original: 'Original: "Chill... its just a song..."', text: 'Chill... its just a song...' },
                    { id: 2, original: 'Original: "I don\'t care... TURN IT UP!"', text: 'I don\'t care... TURN IT UP!!' },
                  ].map(rep => (
                    <div key={rep.id} className="relative pt-3">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#09090b] px-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest z-10">Replacement Selection {rep.id}</div>
                      <div className="bg-[#111113] border border-[#27272a] rounded-lg p-4 space-y-2 mt-1">
                        <div className="text-[9px] text-zinc-500 italic">{rep.original}</div>
                        <textarea rows={2} defaultValue={rep.text} className="w-full bg-[#09090b] border border-[#27272a] rounded-[4px] p-2.5 text-[11px] text-white focus:outline-none focus:border-[#4c3a73] resize-none" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submitting Action */}
                <div className="pt-4 flex justify-end gap-3 border-t border-[#1f1f22]">
                  <button onClick={() => setQuickModeFolder(null)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">Cancel</button>
                  <button 
                    onClick={() => {
                      setIsGeneratingFiles(true);
                      setTimeout(() => {
                        setIsGeneratingFiles(false);
                        setQuickModeFolder(null); // Return to accounts view
                        onTriggerNotification?.(`Successfully scheduled batch for ${quickModeFolder.folderName}!`, "success");
                      }, 3000);
                    }}
                    disabled={isGeneratingFiles}
                    className="bg-[#b388ff] text-[#1f1635] text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-[4px] hover:bg-[#a67ceb] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingFiles ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[10px] h-[10px]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    )}
                    {isGeneratingFiles ? "Starting Batch..." : "Start Quick Batch"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {leftTab === 'editor' && (
            <div className="space-y-4">
              <div className="bg-[#111113] border border-[#1f1f22] rounded-lg p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Manual Editor</h3>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Edit asset video, audio, and text properties.</p>
                </div>
              </div>

              {/* Tracks Section */}
              <div className="space-y-3">
                
                {/* Visual Video Track */}
                <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <ImageIcon className="w-3.5 h-3.5" /> Reference Video
                  </div>
                  <div className="h-10 bg-[#141416] border border-[#27272a] rounded-md relative flex items-center overflow-hidden">
                     {/* Timeline grid lines */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwdjEwMGgxVjBIMHoiIGZpbGw9IiMzZjNmNDYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-20"></div>
                     
                     {/* Active track block */}
                     <div className="absolute left-6 right-12 h-full bg-[#3f3f46]/30 border-x border-[#52525b] flex items-center group cursor-ew-resize">
                        <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center"><GripVertical className="w-2 h-2 text-zinc-400" /></div>
                        <div className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis px-4 text-[9px] text-zinc-300 font-mono">
                          {assets.length > 0 ? assets[0].title : 'IMG_4821.mov'}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center"><GripVertical className="w-2 h-2 text-zinc-400" /></div>
                     </div>
                  </div>
                </div>

                {/* Audio Track */}
                <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-lg p-3 space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <Music className="w-3.5 h-3.5" /> Audio Track (Spotify/TikTok/YT)
                      </div>
                      <button className="text-[9px] text-zinc-500 hover:text-white transition uppercase font-mono">Browse library</button>
                    </div>
                    
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          placeholder="Search artist/song, or paste YouTube/TikTok link..." 
                          className="w-full bg-[#050505] border border-[#27272a] rounded-[6px] pl-8 pr-3 py-1.5 text-[10px] text-zinc-300 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 focus:outline-none font-mono placeholder:text-zinc-600"
                          value={songSearch}
                          onChange={(e) => {
                            setSongSearch(e.target.value);
                            setIsSearchingSong(true);
                          }}
                          onFocus={() => setIsSearchingSong(true)}
                          onBlur={() => setTimeout(() => setIsSearchingSong(false), 200)}
                        />
                        {isSearchingSong && songSearch && filteredSongs.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#111113] border border-[#27272a] rounded-md shadow-xl z-50 max-h-40 overflow-y-auto">
                            {filteredSongs.map((song, idx) => (
                              <div 
                                key={idx} 
                                className="px-3 py-2 flex items-center justify-between hover:bg-[#1f1f22] cursor-pointer border-b border-[#1f1f22] last:border-0"
                                onClick={() => {
                                  setSongSearch(`${song.artist} - ${song.title}`);
                                  setIsSearchingSong(false);
                                }}
                              >
                                <div>
                                  <div className="text-[10px] text-white font-medium">{song.title}</div>
                                  <div className="text-[9px] text-zinc-500">{song.artist}</div>
                                </div>
                                <div className="text-[9px] font-mono text-zinc-600">{song.duration}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (songSearch.includes('youtube.com') || songSearch.includes('youtu.be') || songSearch.includes('tiktok.com')) {
                             onTriggerNotification?.("Extracting MP3 from URL...", "info");
                             setTimeout(() => {
                               setSongSearch("Extracted: " + songSearch.split('/').pop());
                               onTriggerNotification?.("Audio extracted and loaded!", "success");
                             }, 3000);
                          }
                        }}
                        className="px-3 bg-[#111113] border border-[#27272a] text-zinc-300 rounded-[6px] text-[10px] font-bold tracking-wider hover:bg-[#1f1f22] hover:text-white whitespace-nowrap transition-colors uppercase"
                      >
                        Convert MP3
                      </button>
                    </div>
                  </div>

                  <div className="h-10 bg-[#141416] border border-[#27272a] rounded-md relative flex items-center overflow-hidden">
                     <div className="absolute left-10 right-4 h-full bg-emerald-500/10 border-x border-emerald-500/30 flex items-center group cursor-ew-resize">
                        <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center bg-emerald-500/10"><GripVertical className="w-2 h-2 text-emerald-400/50" /></div>
                        <div className="flex-1 px-4 flex items-center gap-[2px] opacity-40">
                           {Array.from({length: 40}).map((_, i) => (
                             <div key={i} className="w-1 bg-emerald-400 rounded-full" style={{ height: `${Math.max(10, Math.random() * 80)}%` }}></div>
                           ))}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center bg-emerald-500/10"><GripVertical className="w-2 h-2 text-emerald-400/50" /></div>
                     </div>
                  </div>
                </div>

                {/* Text Overlay Track */}
                <div className="bg-[#0c0c0e] border border-[#1f1f22] rounded-lg p-3 space-y-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                        <Type className="w-3.5 h-3.5" /> Text Overlays
                      </div>
                      <button 
                        onClick={() => setOverlays([...overlays, { id: Date.now().toString(), text: "New Caption..." }])}
                        className="text-[9px] text-sky-400 hover:text-sky-300 transition uppercase font-mono"
                      >
                        + Add Layer
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                       {overlays.map((overlay, index) => (
                          <div key={overlay.id} className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add engaging caption..." 
                              className="flex-1 bg-[#050505] border border-[#27272a] rounded-[6px] px-3 py-1.5 text-[10px] text-zinc-300 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/10 focus:outline-none placeholder:text-zinc-600"
                              value={overlay.text}
                              onChange={e => {
                                const newOverlays = [...overlays];
                                newOverlays[index].text = e.target.value;
                                setOverlays(newOverlays);
                              }}
                            />
                            {overlays.length > 1 && (
                              <button 
                                onClick={() => setOverlays(overlays.filter(o => o.id !== overlay.id))}
                                className="px-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                       ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-[9px]">
                       <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer hover:text-zinc-200">
                          <input 
                            type="checkbox" 
                            checked={useTikTokFont} 
                            onChange={e => setUseTikTokFont(e.target.checked)}
                            className="accent-sky-500" 
                          />
                          TikTok Sans Font
                       </label>
                       <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer hover:text-zinc-200">
                          <input 
                            type="checkbox" 
                            checked={useBlackStroke}
                            onChange={e => setUseBlackStroke(e.target.checked)}
                            className="accent-sky-500" 
                          />
                          2px Black Stroke
                       </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {overlays.map((overlay, idx) => (
                       <div key={overlay.id} className="h-8 bg-[#141416] border border-[#27272a] rounded-md relative flex items-center overflow-hidden">
                          <div 
                             className="absolute h-full bg-sky-500/10 border-x border-sky-500/30 flex items-center group cursor-ew-resize"
                             style={{ left: `${idx * 15 + 10}%`, right: `${100 - (idx * 15 + 10 + 30)}%` }}
                          >
                             <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center bg-sky-500/10"><GripVertical className="w-2 h-2 text-sky-400/50" /></div>
                             <div className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis px-4 text-[9px] text-sky-300 font-mono font-bold">
                               {overlay.text || "Add text..."}
                             </div>
                             <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex flex-col justify-center items-center bg-sky-500/10"><GripVertical className="w-2 h-2 text-sky-400/50" /></div>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Phone View Center */}
      <div className="w-[50%] bg-[#050505] flex items-center justify-center relative border-b border-[#1C1C1F]">
        

        {/* The Mockup Frame */}
        <div className="relative w-[240px] h-[500px] bg-[#0c0c0e] rounded-[36px] shadow-2xl border-[8px] border-[#141416] overflow-hidden flex flex-col justify-center items-center">
          
          {/* Notch / Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-[#141416] rounded-b-[14px] z-20 flex justify-center items-end pb-[4px]">
            <div className="w-[30px] h-[3px] rounded-full bg-white/5"></div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80px] h-[3px] bg-white/20 rounded-full z-20"></div>

          {assets.length === 0 || leftTab === 'quick' ? (
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 rounded border border-[#27272a] bg-[#111113] flex items-center justify-center mx-auto text-zinc-600 shadow-sm cursor-pointer hover:bg-[#1f1f22] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
              <h3 className="text-[10px] font-medium text-zinc-400 tracking-wide font-mono uppercase">Preview Unavailable</h3>
              <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest px-8">Select images to preview</p>
            </div>
          ) : (
            <div className="absolute inset-0 bg-zinc-900">
              <video
                src={assets[0].videoUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                autoPlay
                loop
                muted
                playsInline
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
               
               {leftTab === 'editor' && overlays.map((overlay, index) => (
                 <div 
                   key={overlay.id}
                   className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none w-[90%] text-center"
                   style={{ top: `${40 + (index * 15)}%` }}
                 >
                   <span 
                     className="text-white font-bold text-[18px] leading-tight" 
                     style={{ 
                       fontFamily: useTikTokFont ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                       WebkitTextStroke: useBlackStroke ? '1.5px black' : 'none',
                       paintOrder: 'stroke fill',
                       textShadow: useBlackStroke ? 'none' : '0 2px 10px rgba(0,0,0,0.5)'
                     }}
                   >
                     {overlay.text}
                   </span>
                 </div>
               ))}

               <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3.5 z-10 pointer-events-none">
                 <div className="w-9 h-9 rounded-full bg-zinc-800 border-[1.5px] border-white flex items-center justify-center overflow-hidden relative shadow-md">
                    <img src={assets[0].thumbnail} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="flex flex-col items-center gap-0.5 shadow-sm">
                   <div className="p-2 bg-black/20 rounded-full"><svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
                   <span className="text-[9px] text-white font-medium drop-shadow-md">1.2M</span>
                 </div>
               </div>
               <div className="absolute bottom-4 left-3 right-14 px-1 flex flex-col gap-1 z-10 drop-shadow-md">
                 <div className="text-white">
                   <h3 className="text-[12px] font-bold tracking-tight">@ptnmgmt</h3>
                   <p className="text-[10px] line-clamp-2 pr-2 text-zinc-200 mt-0.5">Learn how I save 20 hours a week using AI. Link in bio! 🚀</p>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
