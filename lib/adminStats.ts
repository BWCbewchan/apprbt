/**
 * © Admin Stats Calculator - Tính toán thống kê từ local data
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

interface PageView {
  timestamp: string;
  screen: string;
  userId: string;
  sessionId: string;
}

interface TeacherStats {
  teacherId: string;
  totalViews: number;
  uniqueScreens: number;
  lastVisit: string;
  screens: { [key: string]: number };
}

interface ScreenStats {
  screen: string;
  views: number;
  uniqueUsers: number;
}

export interface FeedbackItem {
  timestamp: string;
  rating: number;
  comment: string;
  featureRequest: string;
  screen: string;
  userId: string;
}

export interface AdminDashboardData {
  totalViews: number;
  totalTeachers: number;
  totalScreens: number;
  avgViewsPerTeacher: number;
  teacherStats: TeacherStats[];
  screenStats: ScreenStats[];
  feedbackCount: number;
  avgRating: number;
  feedbackList: FeedbackItem[];
}

/**
 * Get page views from localStorage (all sessions)
 */
function getAllPageViews(): PageView[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('approbotics_all_page_views');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save page view to persistent storage
 */
export function savePageView(screen: string, userId: string, sessionId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const pageViews = getAllPageViews();
    pageViews.push({
      timestamp: new Date().toISOString(),
      screen,
      userId,
      sessionId
    });
    
    localStorage.setItem('approbotics_all_page_views', JSON.stringify(pageViews));
  } catch (error) {
    console.error('Error saving page view:', error);
  }
}

/**
 * Get feedback from localStorage
 */
function getAllFeedback(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem('approbotics_all_feedback');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save feedback to persistent storage
 */
export function saveFeedback(rating: number, comment: string, featureRequest: string, screen: string, userId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const feedback = getAllFeedback();
    feedback.push({
      timestamp: new Date().toISOString(),
      rating,
      comment,
      featureRequest,
      screen,
      userId
    });
    
    localStorage.setItem('approbotics_all_feedback', JSON.stringify(feedback));
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
}

/**
 * Calculate admin dashboard stats from local data
 */
export function calculateAdminStats(): AdminDashboardData {
  const pageViews = getAllPageViews();
  const feedback = getAllFeedback();
  
  if (pageViews.length === 0) {
    return {
      totalViews: 0,
      totalTeachers: 0,
      totalScreens: 0,
      avgViewsPerTeacher: 0,
      teacherStats: [],
      screenStats: [],
      feedbackCount: 0,
      avgRating: 0,
      feedbackList: []
    };
  }
  
  // Calculate teacher stats
  const teacherMap: { [key: string]: TeacherStats } = {};
  const screenMap: { [key: string]: { views: number; users: Set<string> } } = {};
  const uniqueScreens = new Set<string>();
  
  pageViews.forEach(view => {
    const { screen, userId, timestamp } = view;
    
    // Track teacher
    if (!teacherMap[userId]) {
      teacherMap[userId] = {
        teacherId: userId,
        totalViews: 0,
        uniqueScreens: 0,
        lastVisit: timestamp,
        screens: {}
      };
    }
    
    teacherMap[userId].totalViews++;
    teacherMap[userId].lastVisit = timestamp;
    
    if (!teacherMap[userId].screens[screen]) {
      teacherMap[userId].screens[screen] = 0;
    }
    teacherMap[userId].screens[screen]++;
    
    // Track screen
    uniqueScreens.add(screen);
    if (!screenMap[screen]) {
      screenMap[screen] = {
        views: 0,
        users: new Set()
      };
    }
    screenMap[screen].views++;
    screenMap[screen].users.add(userId);
  });
  
  // Calculate unique screens per teacher
  Object.values(teacherMap).forEach(teacher => {
    teacher.uniqueScreens = Object.keys(teacher.screens).length;
    console.log('👨‍🏫 Teacher:', teacher.teacherId, {
      uniqueScreens: teacher.uniqueScreens,
      screens: Object.keys(teacher.screens),
      totalViews: teacher.totalViews
    });
  });
  
  // Convert to arrays and sort
  const teacherStats = Object.values(teacherMap)
    .sort((a, b) => b.totalViews - a.totalViews);
  
  const screenStats = Object.keys(screenMap)
    .map(screen => ({
      screen,
      views: screenMap[screen].views,
      uniqueUsers: screenMap[screen].users.size
    }))
    .sort((a, b) => b.views - a.views);
  
  // Calculate feedback stats
  const feedbackCount = feedback.length;
  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  const avgRating = feedbackCount > 0 ? totalRating / feedbackCount : 0;
  
  // Calculate totals
  const totalViews = pageViews.length;
  const totalTeachers = Object.keys(teacherMap).length;
  const avgViewsPerTeacher = totalTeachers > 0 ? totalViews / totalTeachers : 0;
  
  return {
    totalViews,
    totalTeachers,
    totalScreens: uniqueScreens.size,
    avgViewsPerTeacher,
    teacherStats,
    screenStats,
    feedbackCount,
    avgRating,
    feedbackList: feedback
  };
}

/**
 * Clear all admin data (for testing)
 */
export function clearAdminData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('approbotics_all_page_views');
  localStorage.removeItem('approbotics_all_feedback');
}
