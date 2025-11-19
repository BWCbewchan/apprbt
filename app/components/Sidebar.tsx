'use client';

import { cn } from "@/lib/utils";
import { QrCode, Search, ClipboardList, X, MessageSquare, BookOpen, Link as LinkIcon, Mail, FileText } from "lucide-react";

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'screen1', label: 'Giáo trình', icon: QrCode, shortcut: '1' },
  { id: 'screen2', label: 'Tìm phiếu', icon: Search, shortcut: '2' },
  { id: 'screen3', label: 'Nhận xét', icon: ClipboardList, shortcut: '3' },
  { id: 'screen4', label: 'Nhận xét Zalo', icon: MessageSquare, shortcut: '4' },
  { id: 'screen5', label: 'Kiểm tra TP', icon: BookOpen, shortcut: '5' },
  { id: 'screen6', label: 'Link Mentor', icon: LinkIcon, shortcut: '6' },
  { id: 'screen7', label: 'Nhận mail chỉ số', icon: Mail, shortcut: '7' },
  { id: 'screen8', label: 'Bài tập về nhà', icon: FileText, shortcut: '8' },
];

export default function Sidebar({ activeScreen, onScreenChange, isCollapsed, onToggle }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 h-full border-r border-white/10 bg-[rgba(15,23,42,0.7)] backdrop-blur-md text-[#f8fafc] transition-all duration-300 z-40",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn(
            "flex h-16 items-center border-b border-white/10 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-6"
          )}>
            {!isCollapsed ? (
              <>
                <h2 className="text-lg font-semibold gradient-text">Approbotics</h2>
                <button
                  onClick={onToggle}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.6)] hover:text-white transition-colors"
                  aria-label="Thu gọn sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.6)] hover:text-white transition-colors mx-auto"
                aria-label="Mở rộng sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onScreenChange(item.id);
                    // Đóng sidebar trên mobile sau khi chọn menu
                    if (window.innerWidth < 768 && isCollapsed) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center rounded-lg text-sm font-medium transition-colors relative",
                    isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                      : "text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.6)] hover:text-[#a5b4fc]"
                  )}
                  style={item.id === 'screen5' && !isActive ? {
                    animation: 'borderPulse 2s ease-in-out infinite',
                    border: '2px solid',
                    borderColor: 'rgba(99, 102, 241, 0.6)',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                  } : undefined}
                  title={isCollapsed ? `${item.label} (Phím ${item.shortcut})` : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1">{item.label}</span>
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded text-xs font-semibold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[rgba(30,41,59,0.6)] text-[#a5b4fc]"
                      )}>
                        {item.shortcut}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={onToggle}
        />
      )}
    </>
  );
}
