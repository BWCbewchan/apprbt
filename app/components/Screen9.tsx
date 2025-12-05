/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

// Google Sheets configuration - Đánh giá năng lực học viên
const SHEET_ID = '1zBNoySRfy8K3lVXGLJT2CUIEWIpv_EXXNSBY13Zc0E8';
const SHEET_GID = '1542423559';

export default function Screen9() {
  // Use the direct edit URL - this should work if sheet is accessible
  const embeddedUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`;

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
        onError={(e) => {
          console.error('Iframe load error:', e);
        }}
      />
    </div>
  );
}
