/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { memo } from 'react';

// Google Sheets configuration - Đánh giá năng lực học viên
const SHEET_ID = '1zBNoySRfy8K3lVXGLJT2CUIEWIpv_EXXNSBY13Zc0E8';
const SHEET_GID = '1542423559';
const embeddedUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;

function Screen9() {
  return (
    <div 
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
      <iframe
        src={embeddedUrl}
        className="w-full h-full border-none"
        title="Đánh giá năng lực học viên"
        loading="lazy"
        allow="clipboard-read; clipboard-write; fullscreen"
        style={{ 
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
    </div>
  );
}

export default memo(Screen9);
