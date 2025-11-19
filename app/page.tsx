'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Screen1 from './components/Screen1';
import Screen2 from './components/Screen2';
import Screen3 from './components/Screen3';
import Screen4 from './components/Screen4';
import Screen5 from './components/Screen5';
import Screen6 from './components/Screen6';
import Screen7 from './components/Screen7';
import Screen8 from './components/Screen8';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('screen1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Keyboard shortcuts để chuyển màn hình
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Chỉ xử lý khi không đang nhập vào input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Chuyển màn hình bằng phím số
      if (event.key === '1') {
        setActiveScreen('screen1');
      } else if (event.key === '2') {
        setActiveScreen('screen2');
      } else if (event.key === '3') {
        setActiveScreen('screen3');
      } else if (event.key === '4') {
        setActiveScreen('screen4');
      } else if (event.key === '5') {
        setActiveScreen('screen5');
      } else if (event.key === '6') {
        setActiveScreen('screen6');
      } else if (event.key === '7') {
        setActiveScreen('screen7');
      } else if (event.key === '8') {
        setActiveScreen('screen8');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <Sidebar 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300 relative",
        isSidebarCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
      )}>
        <div className={cn(
          "relative h-full",
          activeScreen === 'screen5' || activeScreen === 'screen6' || activeScreen === 'screen7' ? "p-0 h-screen" : "p-4 md:p-8"
        )}>
          {/* Screen 1 - Luôn được mount, chỉ ẩn/hiện bằng CSS */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen1' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen1 />
          </div>
          
          {/* Screen 2 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen2' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen2 />
          </div>
          
          {/* Screen 3 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen3' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen3 />
          </div>

          {/* Screen 4 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen4' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen4 />
          </div>

          {/* Screen 5 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen5' ? "opacity-100 relative z-10 h-full" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen5 />
          </div>

          {/* Screen 6 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen6' ? "opacity-100 relative z-10 h-full" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen6 />
          </div>

          {/* Screen 7 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen7' ? "opacity-100 relative z-10 h-full" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen7 />
          </div>

          {/* Screen 8 */}
          <div className={cn(
            "transition-opacity duration-300",
            activeScreen === 'screen8' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 z-0 pointer-events-none overflow-hidden"
          )}>
            <Screen8 />
          </div>
        </div>
      </main>
    </div>
  );
}
