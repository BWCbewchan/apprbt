/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { BookOpen, ClipboardList, FileText, Link as LinkIcon, Mail, MessageSquare, QrCode, Search, Star, X, ExternalLink } from "lucide-react";
import { trackPageView, trackLocalPageView, getUserId, getSessionId, getUserAgent, isAppsScriptConfigured } from '@/lib/appscript';

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
  { id: 'screen9', label: 'Đánh giá năng lực', icon: Star, shortcut: '9' },
  { id: 'screen10', label: 'Đào tạo nâng cao', icon: ExternalLink, shortcut: '0' },
  { id: 'deal', label: 'chỉ số deal lương', icon: ExternalLink, shortcut: 'D', href: 'https://tmsmindx.vercel.app/' },
];

export default function Sidebar({ activeScreen, onScreenChange, isCollapsed, onToggle }: SidebarProps) {
  const [dealClicks, setDealClicks] = useState<number>(() => {
    try {
      const v = localStorage.getItem('deal_click_count');
      return v ? parseInt(v, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      const v = localStorage.getItem('deal_click_count');
      if (v) setDealClicks(parseInt(v, 10));
    } catch {}
  }, []);

  function handleDealClick() {
    try {
      const next = dealClicks + 1;
      localStorage.setItem('deal_click_count', String(next));
      setDealClicks(next);

      // Local tracking for UI statistics
      try {
        trackLocalPageView('deal');
      } catch (e) {
        console.warn('Local tracking failed for deal click', e);
      }

      // Remote tracking to Apps Script (async, no-cors)
      (async () => {
        try {
          if (isAppsScriptConfigured()) {
            const userId = getUserId();
            const sessionId = getSessionId();
            const userAgent = getUserAgent();
            const success = await trackPageView({ screen: 'deal', userId, sessionId, userAgent });
            console.log('Deal click tracked to Apps Script:', success);
          } else {
            console.warn('Apps Script not configured; skipping remote tracking for deal click');
          }
        } catch (err) {
          console.error('Error tracking deal click to Apps Script:', err);
        }
      })();

    } catch {}
  }

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
                <h2 className="text-lg font-semibold gradient-text">AppRBT HCM1&4</h2>
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
              const commonClass = cn(
                "w-full flex items-center rounded-lg text-sm font-medium transition-colors relative",
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                  : "text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.6)] hover:text-[#a5b4fc]"
              );
              const title = isCollapsed ? `${item.label} (Phím ${item.shortcut})` : undefined;

              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Ghi nhận lượt bấm nếu là mục deal
                      if (item.id === 'deal') handleDealClick();

                      // Đóng sidebar trên mobile sau khi chọn menu
                      if (window.innerWidth < 768 && isCollapsed) {
                        onToggle();
                      }
                    }}
                    className={commonClass}
                    title={title}
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

                        {item.id === 'deal' && dealClicks > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                            Đã bấm
                          </span>
                        )}

                      </>
                    )}
                  </a>
                );
              }

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
                  className={commonClass}
                  style={item.id === 'screen5' && !isActive ? {
                    animation: 'borderPulse 2s ease-in-out infinite',
                    border: '2px solid',
                    borderColor: 'rgba(99, 102, 241, 0.6)',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                  } : undefined}
                  title={title}
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
          {!isCollapsed && (
            <div className="p-4 border-t border-white/10 mt-auto">
              <p className="text-xs text-center text-[#94a3b8] leading-relaxed">
                © Bản quyền thuộc về<br />
                <span className="text-[#a5b4fc] font-semibold">HCM1 & 4</span><br />
                bởi <span className="text-[#a5b4fc] font-semibold">Trần Chí Bảo</span>
              </p>
            </div>
          )}
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
