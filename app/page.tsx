/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';
import Screen3 from './components/Screen3';
import Screen4 from './components/Screen4';
import Screen5 from './components/Screen5';
import Screen6 from './components/Screen6';
import Screen7 from './components/Screen7';
import Screen8 from './components/Screen8';
import Screen9 from './components/Screen9';
import Sidebar from './components/Sidebar';

// Keyboard mapping - định nghĩa ngoài component để không tạo lại mỗi render
const KEY_TO_SCREEN: Record<string, string> = {
  '1': 'screen1', '2': 'screen2', '3': 'screen3',
  '4': 'screen4', '5': 'screen5', '6': 'screen6',
  '7': 'screen7', '8': 'screen8', '9': 'screen9',
};

// Screens cần full height
const FULLSCREEN_SCREENS = ['screen5', 'screen6', 'screen7', 'screen9'];

// Style cho screen ẩn - dùng visibility để browser skip rendering
const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  contentVisibility: 'hidden',
};

// Style cho screen hiện
const visibleStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  visibility: 'visible',
  transform: 'translateZ(0)', // Force GPU layer
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('screen1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleScreenChange = useCallback((screen: string) => {
    setActiveScreen(screen);
  }, []);

  // Keyboard shortcuts - optimized
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      const screen = KEY_TO_SCREEN[event.key];
      if (screen) setActiveScreen(screen);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Memoize container class
  const isFullscreen = FULLSCREEN_SCREENS.includes(activeScreen);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <Sidebar 
        activeScreen={activeScreen} 
        onScreenChange={handleScreenChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main 
        className={cn(
          "flex-1 min-h-screen relative",
          isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
        )}
        style={{ transition: 'margin-left 0.15s ease-out' }}
      >
        <div className={cn("relative h-full", isFullscreen ? "p-0 h-screen" : "p-4 md:p-8")}>
          {/* Screen 1 */}
          <div style={activeScreen === 'screen1' ? visibleStyle : hiddenStyle}>
            <Screen1 />
          </div>
          
          {/* Screen 2 */}
          <div style={activeScreen === 'screen2' ? visibleStyle : hiddenStyle}>
            <Screen2 />
          </div>
          
          {/* Screen 3 */}
          <div style={activeScreen === 'screen3' ? visibleStyle : hiddenStyle}>
            <Screen3 />
          </div>

          {/* Screen 4 */}
          <div style={activeScreen === 'screen4' ? visibleStyle : hiddenStyle}>
            <Screen4 />
          </div>

          {/* Screen 5 */}
          <div style={activeScreen === 'screen5' ? {...visibleStyle, height: '100%'} : hiddenStyle}>
            <Screen5 />
          </div>

          {/* Screen 6 */}
          <div style={activeScreen === 'screen6' ? {...visibleStyle, height: '100%'} : hiddenStyle}>
            <Screen6 />
          </div>

          {/* Screen 7 */}
          <div style={activeScreen === 'screen7' ? {...visibleStyle, height: '100%'} : hiddenStyle}>
            <Screen7 />
          </div>

          {/* Screen 8 */}
          <div style={activeScreen === 'screen8' ? visibleStyle : hiddenStyle}>
            <Screen8 />
          </div>

          {/* Screen 9 */}
          <div style={activeScreen === 'screen9' ? {...visibleStyle, height: '100%'} : hiddenStyle}>
            <Screen9 />
          </div>
        </div>
      </main>
    </div>
  );
}
  );
}
