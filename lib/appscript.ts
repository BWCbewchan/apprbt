/**
 * © Apps Script API Helper
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

// Lấy URL từ environment variable hoặc fallback
const APPSCRIPT_URL = process.env.NEXT_PUBLIC_APPSCRIPT_URL || '';

// Check if Apps Script is properly configured
export function isAppsScriptConfigured(): boolean {
  return APPSCRIPT_URL !== '' && APPSCRIPT_URL !== 'YOUR_APPSCRIPT_WEB_APP_URL_HERE';
}

export interface PageViewData {
  screen: string;
  userId: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  featureRequest: string;
  screen: string;
  userId: string;
  sessionId: string;
}

export interface Statistics {
  screen: string;
  views: number;
  uniqueUsers: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * Track page view
 */
export async function trackPageView(data: PageViewData): Promise<boolean> {
  if (!isAppsScriptConfigured()) {
    console.warn('⚠️ Apps Script URL chưa được cấu hình');
    return false;
  }

  try {
    await fetch(APPSCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'trackPageView',
        ...data,
      }),
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return false;
  }
}

/**
 * Submit feedback
 */
export async function submitFeedback(data: FeedbackData): Promise<boolean> {
  if (!isAppsScriptConfigured()) {
    console.warn('⚠️ Apps Script URL chưa được cấu hình');
    return false;
  }

  try {
    await fetch(APPSCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'submitFeedback',
        ...data,
      }),
    });
    
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
}

/**
 * Get statistics
 * Note: Sử dụng POST với no-cors mode để tránh CORS error
 * Do Apps Script limitation, không thể đọc response, nên function này
 * chỉ để trigger update statistics ở backend
 */
export async function getStatistics(): Promise<Statistics[] | null> {
  try {
    // Trigger statistics update via POST (no-cors)
    await fetch(APPSCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getStatistics',
      }),
    });
    
    // Cannot read response due to no-cors mode
    // User should check Google Sheets directly
    console.log('Statistics update triggered. Check Google Sheets for data.');
    return null;
  } catch (error) {
    console.error('Error triggering statistics update:', error);
    return null;
  }
}

/**
 * Get teacher code (userId)
 */
export function getTeacherCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('approbotics_teacher_code');
}

/**
 * Set teacher code (userId)
 */
export function setTeacherCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('approbotics_teacher_code', code);
}

/**
 * Generate or get user ID (uses teacher code if available)
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';
  
  const teacherCode = getTeacherCode();
  console.log('👤 getUserId - Teacher Code from storage:', teacherCode);
  
  if (teacherCode) {
    return teacherCode;
  }
  
  // Fallback to random ID (shouldn't happen if modal works correctly)
  let userId = localStorage.getItem('approbotics_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('approbotics_user_id', userId);
    console.warn('⚠️ No teacher code found, generated random userId:', userId);
  }
  return userId;
}

/**
 * Generate or get session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('approbotics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('approbotics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get user agent
 */
export function getUserAgent(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  return navigator.userAgent;
}

/**
 * Clear user data (for testing)
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('approbotics_user_id');
  localStorage.removeItem('approbotics_teacher_code');
  sessionStorage.removeItem('approbotics_session_id');
}

/**
 * Get local statistics from session storage
 */
export function getLocalStatistics(): Statistics[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = sessionStorage.getItem('approbotics_local_stats');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Track page view locally
 */
export function trackLocalPageView(screen: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stats = getLocalStatistics();
    const existingStat = stats.find(s => s.screen === screen);
    
    if (existingStat) {
      existingStat.views++;
    } else {
      stats.push({
        screen,
        views: 1,
        uniqueUsers: 1
      });
    }
    
    // Sort by views descending
    stats.sort((a, b) => b.views - a.views);
    
    sessionStorage.setItem('approbotics_local_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error tracking local page view:', error);
  }
}
