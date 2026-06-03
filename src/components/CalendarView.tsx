import React, { useState } from "react";
import { 
  Calendar as CalIcon, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { ScheduledPost, PostizAccount } from "../types";

interface CalendarViewProps {
  scheduledPosts: ScheduledPost[];
  accounts: PostizAccount[];
  onUpdatePostSchedule: (id: string, newDate: string) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onTriggerNotification: (message: string, type: 'success' | 'info') => void;
}

export default function CalendarView({
  scheduledPosts,
  accounts,
  onUpdatePostSchedule,
  onDeletePost,
  onTriggerNotification,
}: CalendarViewProps) {
  // Use June 2026 as default based on system context local time (2026-06-02)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Calendar dates math for 35 or 42 grid blocks
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (5 for June)
  
  // Grid start calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (Date | null)[] = [];
  // Fill empty spots for prefix
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Fill actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(year, month, i));
  }

  // Next Month Nav
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getPostsForDay = (day: Date) => {
    return scheduledPosts.filter((post) => {
      const pDate = new Date(post.scheduledAt);
      return (
        pDate.getDate() === day.getDate() &&
        pDate.getMonth() === day.getMonth() &&
        pDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-[#09090b]">
      
      {/* FULL WIDTH CALENDAR */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 lg:h-full overflow-hidden bg-[#09090b]">
        
        {/* Calendar Header Control */}
        <div className="bg-[#111113] border border-[#1f1f22] rounded-xl p-3 lg:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b388ff]/10 border border-[#b388ff]/20 text-[#b388ff] rounded-md">
              <CalIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">
                {monthNames[month]} {year}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-[#09090b] hover:bg-[#242427] border border-[#27272a] text-zinc-300 rounded-md transition"
              title="Previous Month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())} // Reset to today
              className="px-4 py-1.5 bg-[#09090b] hover:bg-[#242427] border border-[#27272a] text-[11px] font-medium text-zinc-300 rounded-md transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-[#09090b] hover:bg-[#242427] border border-[#27272a] text-zinc-300 rounded-md transition"
              title="Next Month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#111113] border border-[#1f1f22] rounded-xl overflow-hidden shadow-sm relative z-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-[#09090b] border-b border-[#1f1f22] shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <div key={idx} className="py-3 text-center text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                {dayName}
              </div>
            ))}
          </div>

          {/* Grid Blocks */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto">
            {daysArray.map((day, cellIndex) => {
              if (day === null) {
                return (
                  <div key={`empty-${cellIndex}`} className="bg-[#111113] p-2 min-h-[120px] border-b border-r border-[#1f1f22]" />
                );
              }

              const now = new Date();
              const isToday =
                day.getDate() === now.getDate() &&
                day.getMonth() === now.getMonth() &&
                day.getFullYear() === now.getFullYear();

              const dayPosts = getPostsForDay(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 min-h-[120px] flex flex-col border-b border-r border-[#1f1f22] transition ${
                    isToday ? "bg-[#b388ff]/5 relative" : "bg-[#111113]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5 shrink-0">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                      isToday ? "bg-[#b388ff] text-[#1f1635]" : "text-zinc-500"
                    }`}>
                      {day.getDate()}
                    </span>
                    {isToday && <span className="text-[9px] text-[#b388ff] font-medium">Today</span>}
                  </div>

                  {/* Cell posts list */}
                  <div className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                    {[9, 13, 17, 21].map((hour) => {
                      const postsInHour = dayPosts.filter(p => new Date(p.scheduledAt).getHours() === hour);
                      
                      if (postsInHour.length === 0) {
                        return null; // Don't show anything for empty time slots to remain clean
                      }

                      return (
                        <div key={hour} className="mb-1.5 last:mb-0 space-y-1">
                          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-0.5">
                            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </div>
                          {postsInHour.map(post => (
                            <div
                              key={post.id}
                              className="p-1 px-1.5 rounded text-[10px] bg-[#1a1a1f] border border-[#27272a] text-zinc-300 font-medium leading-tight truncate flex flex-col transition flex-1"
                              title={post.title}
                            >
                              <span className="truncate block font-bold text-white text-[10px]">{accounts.find(a => a.id === post.accountId)?.handle || 'TikTok'}</span>
                              <span className="truncate block opacity-80 text-[9px]">{post.title}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
