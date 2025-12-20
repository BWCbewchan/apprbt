/**
 * © Hook để tracking page views
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { trackPageView, trackLocalPageView, getUserId, getSessionId, getUserAgent, isAppsScriptConfigured, getTeacherCode } from '@/lib/appscript';
import { savePageView } from '@/lib/adminStats';
import { useEffect, useRef } from 'react';

export function usePageTracking(currentScreen: string) {
  useEffect(() => {
    // Skip empty screen
    if (!currentScreen) return;

    // Skip if no teacher code yet
    const teacherCode = getTeacherCode();
    if (!teacherCode) {
      console.log('⏸️ Waiting for teacher code before tracking...');
      return;
    }

    const track = async () => {
      // Get fresh userId and sessionId every time
      const userId = getUserId();
      const sessionId = getSessionId();
      
      console.log('🔄 Tracking:', { currentScreen, userId, sessionId });
      
      // Save to persistent storage for admin stats
      savePageView(currentScreen, userId, sessionId);
      
      // Always track locally for statistics display
      trackLocalPageView(currentScreen);
      
      // Also track to Apps Script if configured
      if (isAppsScriptConfigured()) {
        const success = await trackPageView({
          screen: currentScreen,
          userId: userId,
          sessionId: sessionId,
          userAgent: getUserAgent(),
          ipAddress: 'client',
        });

        if (success) {
          console.log(`✅ Tracked to Google Sheets: ${currentScreen} (User: ${userId})`);
        } else {
          console.log(`❌ Failed to track: ${currentScreen}`);
        }
      } else {
        console.warn('⚠️ Apps Script not configured. Only tracking locally.');
      }
    };

    track();
  }, [currentScreen]);

  return {
    userId: getUserId(),
    sessionId: getSessionId(),
  };
}
