/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { memo, useEffect, useRef, useState } from 'react';

// Google Sheets configuration - Đánh giá năng lực học viên
const SHEET_ID = '1zBNoySRfy8K3lVXGLJT2CUIEWIpv_EXXNSBY13Zc0E8';
const SHEET_GID = '1542423559';
const embeddedUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;

function Screen9() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden" 
      style={{ 
        margin: 0, 
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%'
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Đang tải đánh giá năng lực...</p>
          </div>
        </div>
      )}
      {isVisible && (
        <iframe
          src={embeddedUrl}
          className="w-full h-full border-none"
          title="Đánh giá năng lực học viên"
          loading="eager"
          allow="clipboard-read; clipboard-write; fullscreen"
          onLoad={() => setIsLoaded(true)}
          style={{ 
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
}

export default memo(Screen9);
