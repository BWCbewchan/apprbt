/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { getTeacherCode, setTeacherCode } from '@/lib/appscript';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import FeedbackButton from './components/FeedbackButton';
import Screen1 from './components/Screen1';
import Screen10 from './components/Screen10';
import Screen11 from './components/Screen11';
import Screen2 from './components/Screen2';
import Screen3 from './components/Screen3';
import Screen4 from './components/Screen4';
import Screen5 from './components/Screen5';
import Screen6 from './components/Screen6';
import Screen7 from './components/Screen7';
import Screen8 from './components/Screen8';
import Screen9 from './components/Screen9';
import Sidebar from './components/Sidebar';
import StatisticsButton from './components/StatisticsButton';
import TeacherCodeModal from './components/TeacherCodeModal';
import { usePageTracking } from './hooks/usePageTracking';

// Keyboard mapping - định nghĩa ngoài component để không tạo lại mỗi render
const KEY_TO_SCREEN: Record<string, string> = {
  '1': 'screen1', '2': 'screen2', '3': 'screen3',
  '4': 'screen4', '5': 'screen5', '6': 'screen6',
  '7': 'screen7', '8': 'screen8', '9': 'screen9', '0': 'screen10',
};

// Screens cần full height
const FULLSCREEN_SCREENS = ['screen5', 'screen6', 'screen7', 'screen9', 'screen10'];

const NATIONAL_DAY_GREETING = 'Chúc mừng 81 năm ngày Quốc khánh 2/9';

// Style cho screen ẩn - dùng visibility để browser skip rendering
const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  contentVisibility: 'hidden',
  contain: 'layout style paint',
};

// Style cho screen hiện
const visibleStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  visibility: 'visible',
  transform: 'translateZ(0)', // Force GPU layer
  contain: 'layout style paint',
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('screen1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [loadedScreens, setLoadedScreens] = useState<Set<string>>(() => new Set(['screen1']));

  // Đọc ?screen= query param khi navigate từ /roadmap về
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (screen) {
      setActiveScreen(screen);
      setLoadedScreens(prev => {
        const next = new Set(prev);
        next.add(screen);
        return next;
      });
      // Xoá query param khỏi URL mà không reload
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Check if teacher code exists
  useEffect(() => {
    const teacherCode = getTeacherCode();
    console.log('🔍 Checking teacher code:', teacherCode);
    if (!teacherCode) {
      setShowTeacherModal(true);
    }
  }, []);

  // Handle teacher code submission
  const handleTeacherCodeSubmit = (code: string) => {
    console.log('✅ Setting teacher code:', code);
    setTeacherCode(code);
    setShowTeacherModal(false);
    // Trigger a re-render to start tracking with new teacher code
    // Force screen to re-track by changing state
    const currentScreen = activeScreen;
    setActiveScreen('');
    setTimeout(() => setActiveScreen(currentScreen), 0);
  };

  // Track page views
  usePageTracking(activeScreen);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleScreenChange = useCallback((screen: string) => {
    setActiveScreen(screen);
    setLoadedScreens(prev => {
      if (prev.has(screen)) return prev;
      const next = new Set(prev);
      next.add(screen);
      return next;
    });
  }, []);

  // Keyboard shortcuts - optimized
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      const screen = KEY_TO_SCREEN[event.key];
      if (screen) handleScreenChange(screen);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleScreenChange]);

  // Memoize container class
  const isFullscreen = FULLSCREEN_SCREENS.includes(activeScreen);

  return (
    <>
      {/* Teacher Code Modal */}
      {showTeacherModal && (
        <TeacherCodeModal onSubmit={handleTeacherCodeSubmit} />
      )}

      <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
        <Sidebar
          activeScreen={activeScreen}
          onScreenChange={handleScreenChange}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <main 
  className={cn( 
    "flex-1 min-h-screen relative pt-20 md:pt-24", 
    isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64" 
  )} 
          style={{ transition: 'margin-left 0.15s ease-out' }}
        >
          <div className={cn("relative h-full pb-16 md:pb-0", isFullscreen ? "p-0 h-screen" : "p-4 md:p-8")}>
            {/* Screen 1 */}
            {loadedScreens.has('screen1') && (
              <div style={activeScreen === 'screen1' ? visibleStyle : hiddenStyle}>
                <Screen1 />
              </div>
            )}

            {/* Screen 2 */}
            {loadedScreens.has('screen2') && (
              <div style={activeScreen === 'screen2' ? visibleStyle : hiddenStyle}>
                <Screen2 />
              </div>
            )}

            {/* Screen 3 */}
            {loadedScreens.has('screen3') && (
              <div style={activeScreen === 'screen3' ? visibleStyle : hiddenStyle}>
                <Screen3 />
              </div>
            )}

            {/* Screen 4 */}
            {loadedScreens.has('screen4') && (
              <div style={activeScreen === 'screen4' ? visibleStyle : hiddenStyle}>
                <Screen4 />
              </div>
            )}

            {/* Screen 5 */}
            {loadedScreens.has('screen5') && (
              <div style={activeScreen === 'screen5' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen5 />
              </div>
            )}

            {/* Screen 6 */}
            {loadedScreens.has('screen6') && (
              <div style={activeScreen === 'screen6' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen6 />
              </div>
            )}

            {/* Screen 7 */}
            {loadedScreens.has('screen7') && (
              <div style={activeScreen === 'screen7' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen7 />
              </div>
            )}

            {/* Screen 8 */}
            {loadedScreens.has('screen8') && (
              <div style={activeScreen === 'screen8' ? visibleStyle : hiddenStyle}>
                <Screen8 />
              </div>
            )}

            {/* Screen 9 */}
            {loadedScreens.has('screen9') && (
              <div style={activeScreen === 'screen9' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen9 />
              </div>
            )}

            {/* Screen 10 */}
            {loadedScreens.has('screen10') && (
              <div style={activeScreen === 'screen10' ? { ...visibleStyle, height: '100%' } : hiddenStyle}>
                <Screen10 />
              </div>
            )}

            {/* Screen 11 - Lộ trình ứng viên */}
            {loadedScreens.has('screen11') && (
              <div style={activeScreen === 'screen11' ? visibleStyle : hiddenStyle}>
                <Screen11 onNavigate={handleScreenChange} />
              </div>
            )}
          </div>

         {/* National Day Greeting */}
<div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 pointer-events-none ">
  <div className="relative">

    {/* Glow phía sau */}
    <div className="absolute -inset-3 rounded-full bg-red-600/50 blur-xl animate-pulse" />

    {/* Viền glow vàng */}
    <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-yellow-300 via-red-500 to-yellow-300 opacity-90 blur-[2px]" />

    {/* Banner */}
    <div className="
      relative flex items-center justify-center gap-3
      rounded-full
      border-2 border-yellow-300
      bg-gradient-to-r from-red-950 via-red-700 to-red-950
      px-5 py-2.5
      shadow-[0_0_20px_rgba(239,68,68,0.65),inset_0_0_20px_rgba(255,215,0,0.15)]
      md:px-8 md:py-3
    ">

      {/* Cờ trái */}
      <span className="
        text-xl
        drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]
        md:text-2xl
      ">
        🇻🇳
      </span>

      {/* Sao vàng */}
      <span className="
        text-yellow-300
        text-lg
        drop-shadow-[0_0_8px_rgba(253,224,71,1)]
        md:text-xl
      ">
        ★
      </span>

      {/* Nội dung */}
      <div className="flex flex-col items-center leading-tight">
        <span className="
          text-[9px]
          font-bold
          tracking-[0.25em]
          text-yellow-200
          md:text-[11px]
        ">
          CHÚC MỪNG
        </span>

        <span className="
          whitespace-nowrap
          text-sm
          font-black
          uppercase
          tracking-wide
          text-yellow-300
          drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]
          md:text-xl
        ">
          81 NĂM NGÀY QUỐC KHÁNH 2/9
        </span>
      </div>

      {/* Sao vàng */}
      <span className="
        text-yellow-300
        text-lg
        drop-shadow-[0_0_8px_rgba(253,224,71,1)]
        md:text-xl
      ">
        ★
      </span>

      {/* Cờ phải */}
      <span className="
        text-xl
        drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]
        md:text-2xl
      ">
        🇻🇳
      </span>
    </div>

    {/* tia sáng nhỏ */}
    <div className="absolute -top-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-yellow-300 blur-sm" />
  </div>
</div>
          <StatisticsButton />
          <FeedbackButton currentScreen={activeScreen} />
        </main>
      </div>
    </>
  );
}
