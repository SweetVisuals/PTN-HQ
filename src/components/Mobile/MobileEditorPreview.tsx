import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Music, Check } from "lucide-react";
import { ImportedAsset, PostizAccount, MusicTrack } from "../../types";

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
  const [musicLibrary, setMusicLibrary] = useState<MusicTrack[]>([]);
  const [selectedSong, setSelectedSong] = useState<MusicTrack | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/music/search')
      .then(res => res.json())
      .then((data: MusicTrack[]) => {
        setMusicLibrary(data);
        if (data.length > 0) setSelectedSong(data[0]);
      })
      .catch(err => console.error('Failed to load music', err));
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current || !selectedSong) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.src = selectedSong.audioUrl;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const handleRender = async () => {
    setIsRendering(true);
    try {
      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + 1);
      
      const res = await fetch("/api/music/render-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: asset.videoUrl,
          songId: selectedSong?.id || "song-1",
          cropStart: 0,
          cropEnd: 30,
          textOverlay: overlayText,
          accountId: selectedAccount,
          scheduledAt: scheduledAt.toISOString()
        })
      });
      if (!res.ok) throw new Error("Render failed");
      const data = await res.json();
      if (data.success) {
        onTriggerNotification("Video rendered and scheduled!", "success");
        onClose();
      }
    } catch (err: any) {
      onTriggerNotification(err.message || "Render failed", "info");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} />
      
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
            {selectedSong ? (
              <div className="bg-[#111113] border border-[#27272a] rounded-lg p-3 flex items-center gap-3">
                {selectedSong.artwork && (
                  <img src={selectedSong.artwork} className="w-10 h-10 rounded-md object-cover" alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedSong.title}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{selectedSong.artist} • {selectedSong.genre}</p>
                </div>
                <button 
                  onClick={toggleAudio}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            ) : (
              <div className="bg-[#111113] border border-[#27272a] rounded-lg p-4 text-center text-zinc-500 text-xs">
                Loading music library...
              </div>
            )}
            
            {/* Song Picker */}
            {musicLibrary.length > 1 && (
              <div className="max-h-32 overflow-y-auto rounded-lg border border-[#27272a] bg-[#0c0c0e]">
                {musicLibrary.map(song => (
                  <div 
                    key={song.id} 
                    onClick={() => {
                      setSelectedSong(song);
                      if (audioRef.current) {
                        audioRef.current.pause();
                        setIsPlayingAudio(false);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 border-b border-[#1f1f22] last:border-0 ${
                      selectedSong?.id === song.id ? 'bg-[#b388ff]/10' : 'hover:bg-[#111113]'
                    }`}
                  >
                    {song.artwork && <img src={song.artwork} className="w-7 h-7 rounded object-cover" alt="" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white font-bold truncate">{song.title}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{song.artist}</div>
                    </div>
                    {selectedSong?.id === song.id && <Check className="w-3 h-3 text-[#b388ff] shrink-0" />}
                  </div>
                ))}
              </div>
            )}
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
