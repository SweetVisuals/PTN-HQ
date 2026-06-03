import React, { useState } from "react";
import { 
  Home, 
  Calendar, 
  Settings, 
  Menu,
  X,
  List as ListIcon,
  Plus
} from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import MobileQuickModeWizard from "./MobileQuickModeWizard";
import MobileEditorPreview from "./MobileEditorPreview";
import CalendarView from "../CalendarView";
import { ImportedAsset, PostizAccount, ScheduledPost } from "../../types";

export interface MobileAppViewProps {
  assets: ImportedAsset[];
  accounts: PostizAccount[];
  scheduledPosts: ScheduledPost[];
  onImportLink: (url: string) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  isLoadingAsset: boolean;
  onUpdateAccount: (id: string, updatedFields: any) => Promise<void>;
  onRunAgent: (id: string) => Promise<void>;
  onAddScheduledPost: (post: any) => Promise<void>;
  onTriggerNotification: (message: string, type: 'success' | 'info') => void;
  onUpdatePostSchedule: (id: string, newDate: string) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  setIsSettingsOpen: (open: boolean) => void;
  setIsQueueModalOpen: (open: boolean) => void;
}

export default function MobileAppView({
  assets,
  accounts,
  scheduledPosts,
  onImportLink,
  onDeleteAsset,
  isLoadingAsset,
  onUpdateAccount,
  onRunAgent,
  onAddScheduledPost,
  onTriggerNotification,
  onUpdatePostSchedule,
  onDeletePost,
  setIsSettingsOpen,
  setIsQueueModalOpen
}: MobileAppViewProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'wizard' | 'editor'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAssetForEditor, setSelectedAssetForEditor] = useState<ImportedAsset | null>(null);

  const handleOpenEditor = (asset: ImportedAsset) => {
    setSelectedAssetForEditor(asset);
    setActiveTab('editor');
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase">Dashboard</h1>
              <p className="text-xs text-zinc-500 font-mono">{accounts.length} Accounts Active</p>
            </div>
            <button 
              onClick={() => setActiveTab('wizard')}
              className="bg-[#b388ff] text-[#1f1635] p-2 rounded-full shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-[#27272a] pb-2">Recent Assets</h2>
            <div className="grid grid-cols-2 gap-3">
              {assets.length === 0 ? (
                <div className="col-span-2 text-center text-zinc-600 text-xs py-8 border border-dashed border-[#27272a] rounded-lg">No assets found.</div>
              ) : (
                assets.map(asset => (
                  <div key={asset.id} onClick={() => handleOpenEditor(asset)} className="bg-[#111113] border border-[#27272a] rounded-lg overflow-hidden group active:scale-95 transition-transform">
                    <div className="aspect-square bg-zinc-900 relative">
                      <img src={asset.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] text-zinc-300 font-bold truncate">{asset.title}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-[#27272a] pb-2">Your Accounts</h2>
            <div className="flex flex-col gap-3">
              {accounts.map(acct => (
                <div key={acct.id} className="bg-[#111113] border border-[#27272a] rounded-lg p-3 flex items-center gap-3">
                  <img src={acct.avatar} className="w-10 h-10 rounded-md object-cover border border-[#27272a]" alt="" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{acct.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{acct.handle}</p>
                  </div>
                  <button 
                    onClick={() => onRunAgent(acct.id)}
                    className="px-3 py-1.5 bg-[#b388ff]/10 text-[#b388ff] text-[10px] font-bold uppercase rounded border border-[#b388ff]/20 active:bg-[#b388ff]/30"
                  >
                    Auto
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'calendar') {
      return (
        <div className="flex-1 overflow-y-auto pb-24 bg-[#0A0A0C]">
          <CalendarView 
            scheduledPosts={scheduledPosts}
            accounts={accounts}
            onUpdatePostSchedule={onUpdatePostSchedule}
            onDeletePost={onDeletePost}
            onTriggerNotification={onTriggerNotification}
          />
        </div>
      );
    }

    if (activeTab === 'wizard') {
      return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] pb-24 z-30">
          <MobileQuickModeWizard 
            accounts={accounts}
            onTriggerNotification={onTriggerNotification}
            onClose={() => setActiveTab('home')}
          />
        </div>
      );
    }

    if (activeTab === 'editor' && selectedAssetForEditor) {
      return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] pb-24 z-30">
          <MobileEditorPreview 
            asset={selectedAssetForEditor}
            accounts={accounts}
            onClose={() => setActiveTab('home')}
            onTriggerNotification={onTriggerNotification}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-[#09090B] text-white flex flex-col font-sans sm:hidden z-[100]">
      
      {/* Mobile Top Bar */}
      <div className="h-14 bg-[#050505] border-b border-[#1C1C1F] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 text-zinc-400 active:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-sm font-bold tracking-widest uppercase">PTN HQ</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsQueueModalOpen(true)} className="relative text-zinc-400 active:text-white">
            <ListIcon className="w-5 h-5" />
            {scheduledPosts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b388ff] text-[#1f1635] text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                {scheduledPosts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {renderContent()}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0c0c0e]/90 backdrop-blur-md border-t border-[#1C1C1F] flex items-center justify-around pb-safe z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-[#b388ff]' : 'text-zinc-500'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'calendar' ? 'text-[#b388ff]' : 'text-zinc-500'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Calendar</span>
        </button>
        <button 
          onClick={() => setActiveTab('wizard')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'wizard' ? 'text-[#b388ff]' : 'text-zinc-500'}`}
        >
          <div className="bg-[#b388ff]/10 p-1.5 rounded-full border border-[#b388ff]/30">
             <Plus className="w-4 h-4 text-[#b388ff]" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#b388ff]">Quick</span>
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-zinc-500"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Settings</span>
        </button>
      </div>

      {/* Full Screen Sidebar Overlay */}
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        accounts={accounts}
        assetsCount={assets.length}
        scheduledPostsCount={scheduledPosts.length}
      />
      
    </div>
  );
}
