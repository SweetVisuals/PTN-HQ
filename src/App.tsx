import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Home as HomeIcon,
  LogOut,
  List as ListIcon,
  Zap,
  Bell,
  MessageSquare,
  LayoutGrid,
  Sparkles,
  Cpu,
  Database,
  Settings
} from "lucide-react";
import HomeView from "./components/HomeView";
import CalendarView from "./components/CalendarView";
import { ImportedAsset, PostizAccount, PostizConfig, ScheduledPost } from "./types";
import QueueModal from "./components/QueueModal";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // SHARED LIFECYCLE STATES
  const [assets, setAssets] = useState<ImportedAsset[]>([]);
  const [accounts, setAccounts] = useState<PostizAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [postizConfig, setPostizConfig] = useState<PostizConfig>({
    endpoint: "https://api.postiz.com/v1",
    apiKey: "",
    useRealPostiz: false
  });

  // UI States
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isScrapingLink, setIsScrapingLink] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoadingAssets(true);
      const resAssets = await fetch("/api/imported-assets");
      const dataAssets = await resAssets.json();
      setAssets(dataAssets);
      const resAcct = await fetch("/api/postiz/accounts");
      const dataAcct = await resAcct.json();
      setAccounts(dataAcct.accounts);
      setPostizConfig(dataAcct.config);
      const resSched = await fetch("/api/scheduled-posts");
      const dataSched = await resSched.json();
      setScheduledPosts(dataSched);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const triggerNotification = (message: string, type: 'success' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImportLink = async (url: string) => {
    setIsScrapingLink(true);
    try {
      const res = await fetch("/api/import-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (!res.ok) throw new Error("Parser failed");
      const data = await res.json();
      if (data.success) {
        setAssets(prev => [data.asset, ...prev]);
        triggerNotification(`Downloaded: "${data.asset.title}"`, "success");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to parse link", "info");
      throw err;
    } finally {
      setIsScrapingLink(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/imported-assets/${id}`, { method: "DELETE" });
      if (res.ok) setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAccount = async (id: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/postiz/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
      }
    } catch (err) {
      console.error("Account strategy update failed: ", err);
    }
  };

  const handleRunAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/postiz/accounts/${id}/run-agent`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setScheduledPosts(prev => [...prev, ...data.posts]);
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, agentLogs: data.logs } : a));
        triggerNotification(`Automated posts scheduled for 9AM, 1PM, 5PM, 9PM!`, "success");
      }
    } catch (err) {
      console.error("DeepSeek failure: ", err);
      triggerNotification("DeepSeek delegation failed", "info");
    }
  };

  const handleAddScheduledPost = async (payload: any) => {
    try {
      const res = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) setScheduledPosts(prev => [...prev, data.post]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePostSchedule = async (id: string, newDate: string) => {
    try {
      const res = await fetch(`/api/scheduled-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDate })
      });
      const data = await res.json();
      if (data.success) {
        setScheduledPosts(prev => prev.map(p => p.id === id ? { ...p, scheduledAt: newDate } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/scheduled-posts/${id}`, { method: "DELETE" });
      if (res.ok) setScheduledPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const quickLoadToEditor = (asset: ImportedAsset) => {
    triggerNotification(`Opened "${asset.title}"!`, "success");
  };

  return (
    <div style={{ transform: "scale(0.8)", transformOrigin: "top left", width: "125vw", height: "125vh" }} className="absolute text-zinc-200 flex flex-col font-sans antialiased selection:bg-purple-500/20 selection:text-purple-400 overflow-hidden bg-[#09090B]">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs w-full bg-[#1A1A1C] text-white rounded shadow-xl border border-[#333] p-4 flex items-start gap-3 animate-slide-in">
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {notification.type === 'success' ? "Operation Success" : "System Alert"}
            </p>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Minimalist Header */}
      <header className="bg-[#050505] shrink-0 flex flex-col w-full z-20">
        {/* Top Row */}
        <div className="h-10 flex items-center justify-between px-4 border-b border-[#1C1C1F]">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-5">
            <div className="w-6 h-6 rounded-sm border border-zinc-800 flex items-center justify-center shrink-0 shadow-sm bg-[#111113]">
              <Sparkles className="w-3 h-3 text-[#b388ff]" />
            </div>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-2.5 h-7 text-[10px] font-medium rounded-md transition-all uppercase tracking-wider ${
                  activeTab === 'home' ? 'text-white bg-[#111113] border border-[#1f1f22]' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <HomeIcon className="w-3 h-3" /> Home
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-1.5 px-2.5 h-7 text-[10px] font-medium rounded-md transition-all uppercase tracking-wider ${
                  activeTab === 'calendar' ? 'text-white bg-[#111113] border border-[#1f1f22]' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <CalendarIcon className="w-3 h-3" /> Calendar
              </button>
            </nav>
          </div>

          {/* Right: Queue & Profile */}
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsQueueModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 h-6 bg-[#1f1635] text-[#b388ff] text-[9px] font-medium uppercase tracking-widest rounded-md hover:bg-[#2a1d47] transition border border-[#3e2376]/50"
             >
               <ListIcon className="w-2.5 h-2.5" /> Queue
               <span className="bg-[#b388ff] text-[#1f1635] text-[8px] font-bold px-1 py-0.5 rounded-[3px] leading-none">{scheduledPosts.length}</span>
             </button>
             <div className="flex items-center gap-2.5 pl-2 border-l border-[#1C1C1F]">
               <div className="text-right">
                 <div className="text-[9px] font-bold text-white uppercase tracking-wider">ptnmgmt</div>
                 <div className="text-[7px] text-zinc-500 mt-0.5 uppercase font-mono tracking-widest">Pro Plan</div>
               </div>
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className="w-6 h-6 flex items-center justify-center bg-[#111113] border border-[#1f1f22] rounded-md text-zinc-400 hover:text-white transition shadow-sm"
                 title="Settings"
               >
                 <Settings className="w-3 h-3" />
               </button>
               <button className="w-6 h-6 flex items-center justify-center bg-[#111113] border border-[#1f1f22] rounded-md text-zinc-400 hover:text-white transition shadow-sm">
                 <LogOut className="w-3 h-3" />
               </button>
             </div>
          </div>
        </div>

        {/* Sub Banner - Luxury Stats Card */}
        <div className="h-9 px-4 bg-[#09090B] border-b border-[#1C1C1F] flex items-center justify-between">
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#050505] border border-[#1f1f22] rounded-md px-2.5 py-1.5 shadow-sm space-x-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#b388ff]">Automator Online</span>
              </div>
              <div className="w-[1px] h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-3">
                <div className="text-left font-mono">
                   <div className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest">{assets.length} Files</div>
                </div>
                <div className="w-[1px] h-3 bg-zinc-800"></div>
                <div className="text-left font-mono">
                   <div className="text-[9px] font-medium text-zinc-300 uppercase tracking-widest">{accounts.length} Accounts</div>
                </div>
                <div className="w-[1px] h-3 bg-zinc-800"></div>
                <div className="text-left font-mono">
                   <div className="text-[9px] font-bold text-[#b388ff] uppercase tracking-widest">{scheduledPosts.length} Slots Filled</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">v2.0.0</div>
        </div>
      </header>

      {isLoadingAssets ? (
        <div className="flex-1 flex flex-col items-center justify-center text-purple-500">
           <svg className="animate-spin h-8 w-8 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
           <p className="text-xs font-mono tracking-widest uppercase text-slate-400">Loading Workspace...</p>
        </div>
      ) : activeTab === 'home' ? (
        <HomeView
          assets={assets}
          accounts={accounts}
          scheduledPosts={scheduledPosts}
          onImportLink={handleImportLink}
          onDeleteAsset={handleDeleteAsset}
          onQuickLoadToEditor={quickLoadToEditor}
          isLoadingAsset={isScrapingLink}
          onUpdateAccount={handleUpdateAccount}
          onRunAgent={handleRunAgent}
          onAddScheduledPost={handleAddScheduledPost}
          onTriggerNotification={triggerNotification}
        />
      ) : (
        <div className="flex-1 overflow-auto bg-[#0A0A0C] p-6">
          <CalendarView 
            scheduledPosts={scheduledPosts}
            accounts={accounts}
            onUpdatePostSchedule={handleUpdatePostSchedule}
            onDeletePost={handleDeletePost}
            onTriggerNotification={triggerNotification}
          />
        </div>
      )}

      <QueueModal 
        isOpen={isQueueModalOpen} 
        onClose={() => setIsQueueModalOpen(false)} 
        accountsCount={accounts.length}
        postsCount={scheduledPosts.length}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentApiKey={postizConfig.apiKey}
        onSave={(key) => {
          setPostizConfig(prev => ({ ...prev, apiKey: key, useRealPostiz: !!key }));
          triggerNotification("Settings successfully saved.", "success");
        }}
      />
    </div>
  );
}