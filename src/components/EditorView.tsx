import React, { useState, useRef } from "react";
import { 
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Type,
  Music,
  Image as ImageIcon,
  Settings,
  Download,
  Scissors,
  GripVertical,
  Plus,
  Trash,
  Sparkles,
  Search,
  Check
} from "lucide-react";
import { ImportedAsset, PostizAccount } from "../types";
import { motion } from "motion/react";

interface EditorViewProps {
  assets: ImportedAsset[];
  accounts: PostizAccount[];
  onBack: () => void;
  onTriggerNotification: (message: string, type: 'success' | 'info') => void;
}

export default function EditorView({ assets, accounts, onBack, onTriggerNotification }: EditorViewProps) {
  // Editor State
  const [songSearch, setSongSearch] = useState("Drake - Nonstop");
  const [isSearchingSong, setIsSearchingSong] = useState(false);
  const [overlays, setOverlays] = useState([{ id: "1", text: "Wait till the end! 🤯", x: 0 }]);
  const [useTikTokFont, setUseTikTokFont] = useState(true);
  const [useBlackStroke, setUseBlackStroke] = useState(true);
  const [selectedAccountEditor, setSelectedAccountEditor] = useState(accounts[0]?.id || "");
  const [scheduledDateEditor, setScheduledDateEditor] = useState("2026-06-03");
  const [scheduledTimeEditor, setScheduledTimeEditor] = useState("09:00");
  const [isRenderingSingle, setIsRenderingSingle] = useState(false);
  const [isConvertingAudio, setIsConvertingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'text' | 'audio' | 'export'>('media');

  // Timeline Drag State
  const [videoX, setVideoX] = useState(0);
  const [audioX, setAudioX] = useState(0);
  
  // Playback State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoEditing, setIsAutoEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 1);
    }
  };

  const handlePlayheadDrag = (e: any, info: any) => {
    const newTime = Math.max(0, currentTime + info.delta.x / 100);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleAutoEdit = () => {
    setIsAutoEditing(true);
    onTriggerNotification("Analyzing clip via DeepSeek API...", "info");
    setTimeout(() => {
      setOverlays([{ id: Date.now().toString(), text: "I tried the viral hack... 😳", x: 0 }]);
      setSongSearch("The Weeknd - Blinding Lights");
      setVideoX(50);
      setIsAutoEditing(false);
      onTriggerNotification("AutoEdit applied! Synchronized beats and added hook.", "success");
    }, 2000);
  };

  const mockSongs = [
    { title: "Nonstop", artist: "Drake", duration: "3:58" },
    { title: "God's Plan", artist: "Drake", duration: "3:18" },
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" }
  ];
  const filteredSongs = mockSongs.filter(s => s.title.toLowerCase().includes(songSearch.toLowerCase()) || s.artist.toLowerCase().includes(songSearch.toLowerCase()));

  const handleRenderSingle = async () => {
    if (assets.length === 0) {
      onTriggerNotification("No reference video. Please import one in Files.", "info");
      return;
    }
    const targetAcctId = selectedAccountEditor || accounts[0]?.id;
    setIsRenderingSingle(true);
    onTriggerNotification("Rendering video composition...", "info");
    try {
      const res = await fetch("/api/music/render-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: assets[0].videoUrl,
          songId: "song-1",
          cropStart: 10,
          cropEnd: 40,
          textOverlay: overlays[0]?.text || "",
          accountId: targetAcctId,
          scheduledAt: `${scheduledDateEditor}T${scheduledTimeEditor}:00`
        })
      });
      const data = await res.json();
      if (data.success) {
        onTriggerNotification("Video rendered and scheduled successfully!", "success");
      }
    } catch (err: any) {
      onTriggerNotification(err.message || "Failed to render", "info");
    } finally {
      setIsRenderingSingle(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] overflow-hidden text-zinc-200">
      
      {/* Top Navigation Bar */}
      <div className="h-10 border-b border-[#1C1C1F] bg-[#0c0c0e] flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-[#111113] border border-[#27272a] hover:bg-[#1f1f22] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-[#b388ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Scissors className="w-3 h-3 text-white" />
            </div>
            <div>
              <h1 className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Pro Editor</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleAutoEdit}
            disabled={isAutoEditing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f22] border border-[#27272a] hover:bg-[#27272a] text-white text-[9px] font-bold uppercase tracking-wider rounded-md transition-all shadow-sm"
          >
            {isAutoEditing ? (
               <div className="w-3 h-3 border-2 border-[#b388ff] border-t-transparent rounded-full animate-spin" />
            ) : (
               <Sparkles className="w-3 h-3 text-[#b388ff]" />
            )}
            AutoEdit
          </button>
          <div className="w-px h-4 bg-[#27272a]"></div>
          <button 
            onClick={() => setActiveTab('export')}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#b388ff] hover:bg-[#a67ceb] text-[#1f1635] text-[9px] font-bold uppercase tracking-wider rounded-md transition-all shadow-[0_0_15px_rgba(179,136,255,0.3)] hover:shadow-[0_0_20px_rgba(179,136,255,0.5)]"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content Area: Top Half (Properties/Assets + Preview) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Media & Properties Panel */}
        <div className="w-[340px] flex flex-col border-r border-[#1C1C1F] bg-[#09090b] shrink-0 z-10">
          
          <div className="flex bg-[#0c0c0e] border-b border-[#1C1C1F] p-2 gap-1 shrink-0">
            {[
              { id: 'media', icon: ImageIcon, label: 'Media' },
              { id: 'text', icon: Type, label: 'Text' },
              { id: 'audio', icon: Music, label: 'Audio' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-md transition-colors ${
                  activeTab === tab.id ? 'bg-[#1f1f22] text-[#b388ff]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#111113]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Project Assets</div>
                <div className="grid grid-cols-3 gap-2">
                  {assets.length === 0 ? (
                    <div className="col-span-3 text-center py-8 text-[10px] text-zinc-600 font-mono border border-dashed border-[#27272a] rounded-md">
                      No assets found.
                    </div>
                  ) : (
                    assets.map(asset => (
                      <div key={asset.id} className="relative aspect-square bg-[#111113] rounded-md border border-[#27272a] overflow-hidden group cursor-pointer shadow-sm hover:border-zinc-500 transition-colors">
                        <img src={asset.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                           <div className="text-[8px] font-mono text-white truncate">{asset.title}</div>
                        </div>
                        <div className="absolute top-1 right-1 w-4 h-4 rounded bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">Text Layers</div>
                  <button 
                    onClick={() => setOverlays([...overlays, { id: Date.now().toString(), text: "New Caption...", x: 0 }])}
                    className="text-[10px] text-sky-400 font-medium hover:text-sky-300 transition"
                  >
                    + Add Layer
                  </button>
                </div>

                <div className="space-y-3">
                  {overlays.map((overlay, index) => (
                    <div key={overlay.id} className="bg-[#111113] border border-[#27272a] rounded-lg p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-zinc-500">Layer {index + 1}</span>
                        {overlays.length > 1 && (
                          <button onClick={() => setOverlays(overlays.filter(o => o.id !== overlay.id))} className="text-zinc-500 hover:text-rose-400">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={overlay.text}
                        onChange={e => {
                          const newO = [...overlays];
                          newO[index].text = e.target.value;
                          setOverlays(newO);
                        }}
                        className="w-full bg-[#050505] border border-[#27272a] rounded-[6px] px-3 py-2 text-[11px] text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#1C1C1F] space-y-3">
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">Style Properties</div>
                  <label className="flex items-center gap-2 text-[10px] text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={useTikTokFont} onChange={e => setUseTikTokFont(e.target.checked)} className="accent-sky-500 w-3.5 h-3.5" />
                    Use TikTok System Font
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={useBlackStroke} onChange={e => setUseBlackStroke(e.target.checked)} className="accent-sky-500 w-3.5 h-3.5" />
                    Enable Thick Black Stroke
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-5">
                <div className="text-[10px] font-bold text-white uppercase tracking-widest">Audio Library</div>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search Spotify / TikTok..." 
                    value={songSearch}
                    onChange={e => setSongSearch(e.target.value)}
                    className="w-full bg-[#111113] border border-[#27272a] rounded-[6px] pl-9 pr-3 py-2.5 text-[11px] text-zinc-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  {filteredSongs.map((song, idx) => (
                    <div key={idx} className="bg-[#111113] border border-[#27272a] rounded-lg p-3 flex items-center justify-between group hover:border-emerald-500/50 cursor-pointer transition-colors" onClick={() => setSongSearch(`${song.artist} - ${song.title}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1f1f22] flex items-center justify-center group-hover:bg-emerald-500/10">
                          <Music className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white">{song.title}</div>
                          <div className="text-[9px] text-zinc-500">{song.artist}</div>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-600">{song.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-5">
                <div className="text-[10px] font-bold text-[#b388ff] uppercase tracking-widest">Export Settings</div>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Destination</label>
                  <select 
                    value={selectedAccountEditor} 
                    onChange={e => setSelectedAccountEditor(e.target.value)}
                    className="w-full bg-[#111113] border border-[#27272a] rounded-[6px] px-3 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#b388ff]"
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.handle}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      value={scheduledDateEditor} 
                      onChange={e => setScheduledDateEditor(e.target.value)} 
                      className="w-full bg-[#111113] border border-[#27272a] rounded-[6px] px-3 py-2 text-[11px] text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Time</label>
                    <input 
                      type="time" 
                      value={scheduledTimeEditor} 
                      onChange={e => setScheduledTimeEditor(e.target.value)} 
                      className="w-full bg-[#111113] border border-[#27272a] rounded-[6px] px-3 py-2 text-[11px] text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleRenderSingle}
                  disabled={isRenderingSingle}
                  className="w-full mt-4 bg-[#b388ff] hover:bg-[#a67ceb] disabled:bg-[#1f1f22] disabled:text-zinc-600 text-[#1f1635] font-bold text-[11px] uppercase tracking-wider py-3 rounded-[6px] transition-all flex items-center justify-center gap-2"
                >
                  {isRenderingSingle ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : <Download className="w-4 h-4" />}
                  {isRenderingSingle ? 'Rendering...' : 'Render & Schedule'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Video Preview */}
        <div className="flex-1 bg-[#050505] relative flex flex-col items-center justify-center">
          
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-[#111113] border border-[#27272a] rounded-md px-3 py-1.5 text-[10px] font-mono text-zinc-400">9:16</div>
            <div className="bg-[#111113] border border-[#27272a] rounded-md px-3 py-1.5 text-[10px] font-mono text-zinc-400">1080x1920</div>
          </div>

          <div className="relative h-[85%] max-h-[800px] aspect-[9/16] bg-black rounded-[24px] shadow-2xl border-[6px] border-[#1f1f22] overflow-hidden">
            {assets.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-3">
                <ImageIcon className="w-8 h-8 opacity-50" />
                <span className="text-[10px] uppercase tracking-widest font-mono">No Media</span>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  src={assets[0].videoUrl} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90" 
                  loop 
                  playsInline 
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                
                {overlays.map((overlay, index) => (
                  <div key={overlay.id} className="absolute w-[90%] left-1/2 -translate-x-1/2 text-center" style={{ top: `${40 + (index * 15)}%` }}>
                    <span 
                      className="text-white font-bold text-[20px] leading-tight drop-shadow-2xl"
                      style={{ 
                        fontFamily: useTikTokFont ? 'system-ui, -apple-system, sans-serif' : 'inherit',
                        WebkitTextStroke: useBlackStroke ? '1.5px black' : 'none',
                        paintOrder: 'stroke fill',
                        textShadow: useBlackStroke ? 'none' : '0 4px 15px rgba(0,0,0,0.8)'
                      }}
                    >
                      {overlay.text}
                    </span>
                  </div>
                ))}

                {/* TikTok UI Mockup Overlay */}
                <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-10">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-white overflow-hidden"><img src={assets[0].thumbnail} className="w-full h-full object-cover" /></div>
                  <div className="flex flex-col items-center gap-1"><div className="p-2 bg-black/40 rounded-full"><svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div><span className="text-[10px] text-white font-bold shadow-black">1.2M</span></div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Half: Multi-track Timeline */}
      <div className="h-[35%] bg-[#0c0c0e] border-t border-[#1C1C1F] flex flex-col shrink-0 z-20">
        
        {/* Timeline Header Toolbar */}
        <div className="h-10 border-b border-[#1f1f22] bg-[#111113] flex items-center justify-between px-4 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-sm">
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <div className="flex gap-2 border-l border-[#27272a] pl-3">
              <button className="w-6 h-6 rounded bg-[#1f1f22] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#27272a] transition border border-[#27272a]"><Scissors className="w-3 h-3" /></button>
              <button className="w-6 h-6 rounded bg-[#1f1f22] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#27272a] transition border border-[#27272a]"><Trash className="w-3 h-3" /></button>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 pl-3">
               {new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[9px] font-mono text-zinc-500 tracking-widest">ZOOM</div>
            <input type="range" className="w-20 accent-zinc-500 h-1 bg-[#27272a] rounded-lg appearance-none" />
          </div>
        </div>

        {/* Tracks Area */}
        <div className="flex-1 overflow-auto relative">
          
          {/* Time Ruler */}
          <div className="h-6 border-b border-[#1f1f22] flex items-end px-24 sticky top-0 bg-[#0c0c0e] z-10 overflow-hidden">
            <div className="w-[2000px] h-full flex relative">
              {Array.from({length: 30}).map((_, i) => (
                <div key={i} className="absolute flex flex-col items-start" style={{ left: `${i * 100}px` }}>
                   <div className="text-[8px] font-mono text-zinc-600 mb-0.5 ml-1">00:0{i}</div>
                   <div className="w-px h-1.5 bg-zinc-700"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[2000px] h-full relative py-2 px-24 space-y-2">
             
             {/* Playhead */}
             <motion.div 
               drag="x"
               dragMomentum={false}
               dragConstraints={{ left: 0, right: 3000 }}
               onDrag={handlePlayheadDrag}
               style={{ x: currentTime * 100 }}
               className="absolute top-0 bottom-0 w-px bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)] cursor-ew-resize ml-24"
             >
               <div className="w-3 h-3 bg-red-500 rotate-45 -translate-x-1/2 -translate-y-1/2 absolute top-0 rounded-sm"></div>
             </motion.div>

             {/* Video Track */}
             <div className="flex h-16 relative bg-[#141416] border border-[#1f1f22] rounded-md overflow-hidden">
                <div className="w-24 shrink-0 bg-[#09090b] border-r border-[#1f1f22] flex items-center justify-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest sticky left-0 z-10">V1</div>
                <div className="flex-1 relative">
                  {assets.length > 0 && (
                    <motion.div 
                      drag="x" 
                      dragMomentum={false}
                      dragConstraints={{ left: 0, right: 1000 }}
                      onDragEnd={(e, info) => setVideoX(videoX + info.offset.x)}
                      style={{ x: videoX }}
                      className="absolute top-1 bottom-1 w-[400px] bg-zinc-800 border-2 border-zinc-600 rounded-md cursor-grab active:cursor-grabbing overflow-hidden group shadow-lg"
                    >
                      <div className="absolute inset-0 flex">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className="flex-1 border-r border-black/20 h-full"><img src={assets[0].thumbnail} className="w-full h-full object-cover opacity-50 mix-blend-luminosity" /></div>
                        ))}
                      </div>
                      <div className="absolute top-1 left-2 bg-black/60 px-1.5 rounded text-[9px] text-white font-mono">{assets[0].title}</div>
                      <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize"><GripVertical className="w-2 h-2 text-white/50" /></div>
                      <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize"><GripVertical className="w-2 h-2 text-white/50" /></div>
                    </motion.div>
                  )}
                </div>
             </div>

             {/* Text Track */}
             <div className="flex h-12 relative bg-[#141416] border border-[#1f1f22] rounded-md overflow-hidden">
                <div className="w-24 shrink-0 bg-[#09090b] border-r border-[#1f1f22] flex items-center justify-center text-[9px] font-bold text-sky-500/50 uppercase tracking-widest sticky left-0 z-10">T1</div>
                <div className="flex-1 relative">
                  {overlays.map((overlay, index) => (
                    <motion.div 
                      key={overlay.id}
                      drag="x" 
                      dragMomentum={false}
                      dragConstraints={{ left: 0, right: 1500 }}
                      className="absolute top-1 bottom-1 w-[200px] bg-sky-500/20 border-2 border-sky-500/60 rounded-md cursor-grab active:cursor-grabbing flex flex-col justify-center overflow-hidden shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                      style={{ left: `${index * 220}px` }}
                    >
                      <div className="px-3 text-[10px] font-bold text-sky-300 font-mono truncate">{overlay.text}</div>
                      <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize"><GripVertical className="w-2 h-2 text-sky-400/50" /></div>
                      <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize"><GripVertical className="w-2 h-2 text-sky-400/50" /></div>
                    </motion.div>
                  ))}
                </div>
             </div>

             {/* Audio Track */}
             <div className="flex h-12 relative bg-[#141416] border border-[#1f1f22] rounded-md overflow-hidden">
                <div className="w-24 shrink-0 bg-[#09090b] border-r border-[#1f1f22] flex items-center justify-center text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest sticky left-0 z-10">A1</div>
                <div className="flex-1 relative">
                  <motion.div 
                    drag="x" 
                    dragMomentum={false}
                    dragConstraints={{ left: 0, right: 1000 }}
                    onDragEnd={(e, info) => setAudioX(audioX + info.offset.x)}
                    style={{ x: audioX }}
                    className="absolute top-1 bottom-1 w-[600px] bg-emerald-500/20 border-2 border-emerald-500/60 rounded-md cursor-grab active:cursor-grabbing overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <div className="absolute inset-0 flex items-center px-1 gap-[1px] opacity-40">
                      {Array.from({length: 150}).map((_, i) => (
                        <div key={i} className="flex-1 bg-emerald-400 rounded-full" style={{ height: `${Math.max(15, Math.random() * 85)}%` }}></div>
                      ))}
                    </div>
                    <div className="absolute top-1 left-2 bg-black/60 px-1.5 rounded text-[9px] text-emerald-300 font-mono font-bold z-10">{songSearch}</div>
                    <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize z-10"><GripVertical className="w-2 h-2 text-emerald-400/50" /></div>
                    <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 transition-colors flex items-center justify-center cursor-ew-resize z-10"><GripVertical className="w-2 h-2 text-emerald-400/50" /></div>
                  </motion.div>
                </div>
             </div>

          </div>
        </div>

      </div>

    </div>
  );
}
