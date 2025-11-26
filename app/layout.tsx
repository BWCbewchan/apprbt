/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Approbotics - QR Generator",
  description: "Tạo mã QR và quản lý bài học Robotics",
  icons: {
    icon: 'https://check-cong-lms.vercel.app/favicon.ico',
    apple: 'https://check-cong-lms.vercel.app/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="https://check-cong-lms.vercel.app/favicon.ico" />
        <link rel="apple-touch-icon" href="https://check-cong-lms.vercel.app/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ fontFamily: 'var(--font-outfit)' }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Santa Claus animation
                function createSanta() {
                  const santa = document.createElement('div');
                  santa.classList.add('santa-container');
                  const img = document.createElement('img');
                  img.src = 'https://img.pikbest.com/png-images/20191113/santa-gives-gifts-gif_2515372.png!bw700';
                  img.alt = 'Santa Claus';
                  santa.appendChild(img);
                  document.body.appendChild(santa);
                  
                  // Create message immediately (same timing as Santa)
                  const message = document.createElement('div');
                  message.classList.add('santa-message');
                  message.textContent = '🎄 Chúc các mentor HCM1 & 4 có mùa Giáng sinh vui vẻ! 🎅';
                  document.body.appendChild(message);
                  
                  setTimeout(() => {
                    santa.remove();
                    message.remove();
                  }, 16000);
                }
                
                // Snowflakes with optimization
                function createSnowflake() {
                  const snowflake = document.createElement('div');
                  snowflake.classList.add('snowflake');
                  snowflake.textContent = '❄';
                  
                  const startPositionLeft = Math.random() * window.innerWidth;
                  const fontSize = Math.random() * 0.8 + 0.4;
                  const duration = Math.random() * 6 + 10;
                  const swayDuration = Math.random() * 2 + 2;
                  const delay = Math.random() * 3;
                  
                  snowflake.style.left = startPositionLeft + 'px';
                  snowflake.style.fontSize = fontSize + 'em';
                  snowflake.style.animationDuration = duration + 's, ' + swayDuration + 's';
                  snowflake.style.animationDelay = delay + 's';
                  snowflake.style.opacity = Math.random() * 0.5 + 0.3;
                  
                  document.body.appendChild(snowflake);
                  
                  setTimeout(() => {
                    snowflake.remove();
                  }, (duration + delay) * 1000);
                }
                
                function startChristmas() {
                  // Start Santa once on load
                  createSanta();
                  
                  // Start snowfall with less snowflakes
                  for (let i = 0; i < 15; i++) {
                    setTimeout(() => createSnowflake(), i * 600);
                  }
                  setInterval(() => createSnowflake(), 1200);
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', startChristmas);
                } else {
                  startChristmas();
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
