/**
 * © Apps Script Server - Thống kê & Feedback
 * Tạo bởi: Trần Chí Bảo
 */

// === CONFIGURATION ===
const CONFIG = {
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // Thay bằng ID Google Sheet của bạn
  SHEET_NAMES: {
    PAGE_VIEWS: 'PageViews',
    FEEDBACK: 'Feedback',
    STATS: 'Statistics'
  }
};

// === MAIN ENDPOINTS ===
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'trackPageView':
        return handlePageView(data);
      case 'submitFeedback':
        return handleFeedback(data);
      case 'getStatistics':
        return handleGetStatistics();
      case 'getAdminStats':
        return handleGetAdminStats();
      default:
        return createResponse(false, 'Invalid action');
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, 'Server error: ' + error.toString());
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  // Add CORS headers for admin endpoint
  const output = function(data) {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  };
  
  switch(action) {
    case 'getStatistics':
      return handleGetStatistics();
    case 'getPageViews':
      return handleGetPageViews();
    case 'getFeedback':
      return handleGetFeedback();
    case 'getAdminStats':
      return handleGetAdminStats();
    default:
      return createResponse(false, 'Invalid action');
  }
}

// === PAGE VIEW TRACKING ===
function handlePageView(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.PAGE_VIEWS);
    
    // Initialize headers if needed
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Screen', 'User ID', 'Session ID', 'User Agent', 'IP Address']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
    }
    
    const timestamp = new Date();
    const screenName = data.screen || 'unknown';
    const userId = data.userId || 'anonymous';
    const sessionId = data.sessionId || 'unknown';
    const userAgent = data.userAgent || 'unknown';
    const ipAddress = data.ipAddress || 'unknown';
    
    sheet.appendRow([timestamp, screenName, userId, sessionId, userAgent, ipAddress]);
    
    // Update statistics
    updateStatistics();
    
    return createResponse(true, 'Page view tracked successfully');
  } catch (error) {
    Logger.log('Error tracking page view: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// === FEEDBACK HANDLING ===
function handleFeedback(data) {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAMES.FEEDBACK);
    
    // Initialize headers if needed
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Rating (Stars)', 'Comment', 'Feature Request', 'Screen', 'User ID', 'Session ID', 'Status']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
    }
    
    const timestamp = new Date();
    const rating = data.rating || 0;
    const comment = data.comment || '';
    const featureRequest = data.featureRequest || '';
    const screen = data.screen || 'unknown';
    const userId = data.userId || 'anonymous';
    const sessionId = data.sessionId || 'unknown';
    const status = 'New';
    
    sheet.appendRow([timestamp, rating, comment, featureRequest, screen, userId, sessionId, status]);
    
    // Auto-format rating with stars
    const lastRow = sheet.getLastRow();
    const ratingCell = sheet.getRange(lastRow, 2);
    ratingCell.setValue('⭐'.repeat(rating) + ' (' + rating + ')');
    
    // Color code by rating
    if (rating >= 4) {
      sheet.getRange(lastRow, 1, 1, 8).setBackground('#d9ead3'); // Green
    } else if (rating === 3) {
      sheet.getRange(lastRow, 1, 1, 8).setBackground('#fff2cc'); // Yellow
    } else {
      sheet.getRange(lastRow, 1, 1, 8).setBackground('#f4cccc'); // Red
    }
    
    return createResponse(true, 'Feedback submitted successfully');
  } catch (error) {
    Logger.log('Error submitting feedback: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

// === STATISTICS ===
function updateStatistics() {
  try {
    const pageViewSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.PAGE_VIEWS);
    const statsSheet = getOrCreateSheet(CONFIG.SHEET_NAMES.STATS);
    
    if (pageViewSheet.getLastRow() <= 1) return; // No data yet
    
    // Clear old stats
    statsSheet.clear();
    
    // Headers
    statsSheet.appendRow(['Screen', 'Total Views', 'Unique Users', 'Last Updated']);
    statsSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#ea4335').setFontColor('#ffffff');
    
    // Get all data
    const data = pageViewSheet.getRange(2, 1, pageViewSheet.getLastRow() - 1, 3).getValues();
    
    // Calculate statistics
    const stats = {};
    data.forEach(row => {
      const screen = row[1]; // Screen name
      const userId = row[2]; // User ID
      
      if (!stats[screen]) {
        stats[screen] = { views: 0, users: new Set() };
      }
      
      stats[screen].views++;
      stats[screen].users.add(userId);
    });
    
    // Sort by views (descending)
    const sortedScreens = Object.keys(stats).sort((a, b) => stats[b].views - stats[a].views);
    
    // Write statistics
    const timestamp = new Date();
    sortedScreens.forEach((screen, index) => {
      statsSheet.appendRow([
        screen,
        stats[screen].views,
        stats[screen].users.size,
        timestamp
      ]);
      
      // Highlight top 3
      if (index === 0) {
        statsSheet.getRange(index + 2, 1, 1, 4).setBackground('#ffd966'); // Gold
      } else if (index === 1) {
        statsSheet.getRange(index + 2, 1, 1, 4).setBackground('#d9d9d9'); // Silver
      } else if (index === 2) {
        statsSheet.getRange(index + 2, 1, 1, 4).setBackground('#e6b8af'); // Bronze
      }
    });
    
    // Auto-resize columns
    statsSheet.autoResizeColumns(1, 4);
    
  } catch (error) {
    Logger.log('Error updating statistics: ' + error.toString());
  }
}

function handleGetStatistics() {
  try {
    updateStatistics(); // Refresh stats first
    
    const statsSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.STATS);
    
    if (!statsSheet || statsSheet.getLastRow() <= 1) {
      return createResponse(true, 'No statistics available', []);
    }
    
    const data = statsSheet.getRange(2, 1, statsSheet.getLastRow() - 1, 3).getValues();
    const stats = data.map(row => ({
      screen: row[0],
      views: row[1],
      uniqueUsers: row[2]
    }));
    
    return createResponse(true, 'Statistics retrieved', stats);
  } catch (error) {
    Logger.log('Error getting statistics: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

function handleGetPageViews() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.PAGE_VIEWS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return createResponse(true, 'No page views yet', []);
    }
    
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    const pageViews = data.map(row => ({
      timestamp: row[0],
      screen: row[1],
      userId: row[2],
      sessionId: row[3],
      userAgent: row[4],
      ipAddress: row[5]
    }));
    
    return createResponse(true, 'Page views retrieved', pageViews);
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function handleGetFeedback() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return createResponse(true, 'No feedback yet', []);
    }
    
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
    const feedback = data.map(row => ({
      timestamp: row[0],
      rating: row[1],
      comment: row[2],
      featureRequest: row[3],
      screen: row[4],
      userId: row[5],
      sessionId: row[6],
      status: row[7]
    }));
    
    return createResponse(true, 'Feedback retrieved', feedback);
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

// === HELPER FUNCTIONS ===
function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// === TESTING FUNCTIONS ===
function testPageView() {
  const testData = {
    action: 'trackPageView',
    screen: 'screen1',
    userId: 'test_user_123',
    sessionId: 'test_session_456',
    userAgent: 'Test Browser',
    ipAddress: '127.0.0.1'
  };
  
  const result = handlePageView(testData);
  Logger.log(result.getContent());
}

function testFeedback() {
  const testData = {
    action: 'submitFeedback',
    rating: 5,
    comment: 'App rất tuyệt vời!',
    featureRequest: 'Muốn có thêm tính năng dark mode',
    screen: 'screen1',
    userId: 'test_user_123',
    sessionId: 'test_session_456'
  };
  
  const result = handleFeedback(testData);
  Logger.log(result.getContent());
}

function testStatistics() {
  const result = handleGetStatistics();
  Logger.log(result.getContent());
}

// === ADMIN STATS ===
function handleGetAdminStats() {
  try {
    const pageViewSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.PAGE_VIEWS);
    const feedbackSheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);
    
    if (!pageViewSheet || pageViewSheet.getLastRow() <= 1) {
      return createResponse(true, 'No data yet', {
        totalViews: 0,
        totalTeachers: 0,
        totalScreens: 0,
        avgViewsPerTeacher: 0,
        teacherStats: [],
        screenStats: [],
        feedbackCount: 0,
        avgRating: 0
      });
    }
    
    // Get page view data
    const pageViewData = pageViewSheet.getRange(2, 1, pageViewSheet.getLastRow() - 1, 4).getValues();
    
    // Calculate teacher stats
    const teacherMap = {};
    const screenMap = {};
    const uniqueScreens = new Set();
    
    pageViewData.forEach(row => {
      const timestamp = row[0];
      const screen = row[1];
      const userId = row[2];
      
      // Track teacher stats
      if (!teacherMap[userId]) {
        teacherMap[userId] = {
          teacherId: userId,
          totalViews: 0,
          uniqueScreens: new Set(),
          lastVisit: timestamp,
          screens: {}
        };
      }
      
      teacherMap[userId].totalViews++;
      teacherMap[userId].uniqueScreens.add(screen);
      teacherMap[userId].lastVisit = timestamp;
      
      if (!teacherMap[userId].screens[screen]) {
        teacherMap[userId].screens[screen] = 0;
      }
      teacherMap[userId].screens[screen]++;
      
      // Track screen stats
      uniqueScreens.add(screen);
      if (!screenMap[screen]) {
        screenMap[screen] = {
          screen: screen,
          views: 0,
          users: new Set()
        };
      }
      screenMap[screen].views++;
      screenMap[screen].users.add(userId);
    });
    
    // Convert to arrays and sort
    const teacherStats = Object.values(teacherMap).map(t => ({
      teacherId: t.teacherId,
      totalViews: t.totalViews,
      uniqueScreens: t.uniqueScreens.size,
      lastVisit: t.lastVisit,
      screens: t.screens
    })).sort((a, b) => b.totalViews - a.totalViews);
    
    const screenStats = Object.values(screenMap).map(s => ({
      screen: s.screen,
      views: s.views,
      uniqueUsers: s.users.size
    })).sort((a, b) => b.views - a.views);
    
    // Get feedback stats
    let feedbackCount = 0;
    let totalRating = 0;
    const feedbackList = [];
    
    if (feedbackSheet && feedbackSheet.getLastRow() > 1) {
      const feedbackData = feedbackSheet.getRange(2, 1, feedbackSheet.getLastRow() - 1, 7).getValues();
      feedbackCount = feedbackData.length;
      
      feedbackData.forEach(row => {
        // Extract rating from "⭐⭐⭐⭐⭐ (5)" format
        const ratingStr = String(row[1]);
        const match = ratingStr.match(/\((\d+)\)/);
        let rating = 0;
        if (match) {
          rating = parseInt(match[1]);
          totalRating += rating;
        }
        
        // Add to feedback list
        feedbackList.push({
          timestamp: row[0],
          rating: rating,
          comment: row[2],
          featureRequest: row[3],
          screen: row[4],
          userId: row[5]
        });
      });
    }
    
    const avgRating = feedbackCount > 0 ? totalRating / feedbackCount : 0;
    const totalViews = pageViewData.length;
    const totalTeachers = Object.keys(teacherMap).length;
    const avgViewsPerTeacher = totalTeachers > 0 ? totalViews / totalTeachers : 0;
    
    const adminStats = {
      totalViews: totalViews,
      totalTeachers: totalTeachers,
      totalScreens: uniqueScreens.size,
      avgViewsPerTeacher: avgViewsPerTeacher,
      teacherStats: teacherStats,
      screenStats: screenStats,
      feedbackCount: feedbackCount,
      avgRating: avgRating,
      feedbackList: feedbackList
    };
    
    return createResponse(true, 'Admin stats retrieved', adminStats);
  } catch (error) {
    Logger.log('Error getting admin stats: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

function testAdminStats() {
  const result = handleGetAdminStats();
  Logger.log(result.getContent());
}
