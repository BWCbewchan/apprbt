/**
 * © Admin Dashboard - Thống kê chi tiết
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import type { AdminDashboardData } from '@/lib/adminStats';
import { cn } from '@/lib/utils';
import {
    Activity,
    Award,
    BarChart3,
    Clock,
    Eye,
    LogOut,
    MessageSquare,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ADMIN_PASSWORD = 'MindX@2024';
const APPSCRIPT_URL = process.env.NEXT_PUBLIC_APPSCRIPT_URL || '';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setError('');
      loadDashboardData();
    } else {
      setError('Mật khẩu không đúng!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    setDashboardData(null);
  };

  const loadDashboardData = async () => {
    if (!APPSCRIPT_URL) {
      alert('⚠️ Chưa cấu hình Apps Script URL trong .env\nVui lòng kiểm tra file .env');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${APPSCRIPT_URL}?action=getAdminStats`;
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Không thể tải dữ liệu (${response.status})`);
      }

      const text = await response.text();
      const result = JSON.parse(text);
      
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        alert(`⚠️ ${result.message || 'Không có dữ liệu từ Google Sheets'}`);
      }
      
    } catch (error: any) {
      alert(`❌ Lỗi: Không thể kết nối đến server\n\nVui lòng thử lại sau`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data as fallback
    const mockData: AdminDashboardData = {
      totalViews: 245,
      totalTeachers: 12,
      totalScreens: 9,
      avgViewsPerTeacher: 20.4,
      teacherStats: [
        { teacherId: 'BaoTC', totalViews: 45, uniqueScreens: 9, lastVisit: new Date().toISOString(), screens: {} },
        { teacherId: 'AnhNV', totalViews: 38, uniqueScreens: 8, lastVisit: new Date().toISOString(), screens: {} },
        { teacherId: 'MinhPT', totalViews: 32, uniqueScreens: 7, lastVisit: new Date().toISOString(), screens: {} },
        { teacherId: 'HungLM', totalViews: 28, uniqueScreens: 6, lastVisit: new Date().toISOString(), screens: {} },
        { teacherId: 'LinhND', totalViews: 25, uniqueScreens: 7, lastVisit: new Date().toISOString(), screens: {} },
      ],
      screenStats: [
        { screen: 'screen1', views: 89, uniqueUsers: 12 },
        { screen: 'screen2', views: 67, uniqueUsers: 11 },
        { screen: 'screen3', views: 45, uniqueUsers: 9 },
        { screen: 'screen5', views: 34, uniqueUsers: 8 },
        { screen: 'screen6', views: 28, uniqueUsers: 7 },
        { screen: 'screen7', views: 23, uniqueUsers: 6 },
        { screen: 'screen4', views: 19, uniqueUsers: 5 },
        { screen: 'screen8', views: 15, uniqueUsers: 4 },
        { screen: 'screen9', views: 12, uniqueUsers: 4 },
      ],
      feedbackCount: 8,
      avgRating: 4.6,
      feedbackList: []
    };
    
    setDashboardData(mockData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1e293b] border-white/10 shadow-2xl">
          <CardHeader className="text-center border-b border-white/10">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-[#94a3b8] mt-2">
              Nhập mật khẩu để truy cập thống kê
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#f8fafc]">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Nhập mật khẩu admin..."
                className={cn(
                  "h-12 bg-[#0f172a] border-white/10 text-white",
                  error && "border-red-500"
                )}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-400">⚠️ {error}</p>
              )}
            </div>

            <Button
              onClick={handleLogin}
              disabled={!password}
              className={cn(
                "w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500",
                "hover:from-blue-600 hover:to-cyan-600"
              )}
            >
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-[#94a3b8] mt-1">
              <span className="text-xs text-green-400">☁️ Real-time từ Google Sheets</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadDashboardData}
              variant="outline"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              disabled={isLoading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang tải...' : '🔄 Refresh Data'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/10 text-[#cbd5e1] hover:bg-white/5"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-[#94a3b8]">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#94a3b8]">Tổng lượt xem</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {dashboardData.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#94a3b8]">Giáo viên sử dụng</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {dashboardData.totalTeachers}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#94a3b8]">TB views/GV</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {dashboardData.avgViewsPerTeacher.toFixed(1)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#94a3b8]">Đánh giá TB</p>
                      <p className="text-3xl font-bold text-white mt-1 flex items-center gap-1">
                        {dashboardData.avgRating.toFixed(1)} ⭐
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Teachers */}
            <Card className="bg-[#1e293b] border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Giáo viên tích cực nhất
                </CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Xếp hạng theo số lượt sử dụng
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {dashboardData.teacherStats.slice(0, 10).map((teacher, index) => {
                    const percentage = (teacher.totalViews / dashboardData.totalViews) * 100;
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    const screenList = Object.keys(teacher.screens).join(', ');
                    
                    return (
                      <div
                        key={teacher.teacherId}
                        className={cn(
                          "rounded-lg p-4 border transition-all hover:scale-[1.02]",
                          index < 3
                            ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                            : "bg-[#0f172a] border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl w-8">{medal}</span>
                            <div className="flex-1">
                              <p className="text-[#f8fafc] font-semibold">
                                {teacher.teacherId}
                              </p>
                              <p className="text-xs text-[#94a3b8]">
                                {teacher.uniqueScreens} màn hình • Lần cuối: {new Date(teacher.lastVisit).toLocaleDateString('vi-VN')}
                              </p>
                              {screenList && (
                                <p className="text-xs text-cyan-400 mt-1" title={screenList}>
                                  📱 {screenList.length > 50 ? screenList.substring(0, 50) + '...' : screenList}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {teacher.totalViews}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              index < 3
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Screen Usage Stats */}
            <Card className="bg-[#1e293b] border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Thống kê màn hình
                </CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Mức độ sử dụng từng tính năng
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.screenStats.map((screen, index) => {
                    const percentage = (screen.views / dashboardData.totalViews) * 100;
                    
                    return (
                      <div
                        key={screen.screen}
                        className="bg-[#0f172a] border border-white/10 rounded-lg p-4 hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-[#f8fafc] font-semibold">
                              {screen.screen}
                            </p>
                            <p className="text-xs text-[#64748b] mt-1">
                              {screen.uniqueUsers} giáo viên
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {screen.views}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Value Proposition */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-xl font-bold gradient-text flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Giá trị thực tế của AppRBT
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Tỷ lệ sử dụng cao</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          <span className="text-green-400 font-bold">{dashboardData.totalTeachers}</span> giáo viên đang sử dụng thường xuyên
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Mức độ tương tác</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          Trung bình <span className="text-cyan-400 font-bold">{dashboardData.avgViewsPerTeacher.toFixed(1)}</span> lượt truy cập/giáo viên
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Đánh giá tích cực</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          Điểm đánh giá: <span className="text-yellow-400 font-bold">{dashboardData.avgRating.toFixed(1)}/5 ⭐</span> từ {dashboardData.feedbackCount} phản hồi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Tiết kiệm thời gian</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          {dashboardData.totalScreens} tính năng tích hợp, tăng hiệu quả công việc
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Sử dụng liên tục</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          Giáo viên quay lại sử dụng trung bình {(dashboardData.avgViewsPerTeacher / dashboardData.totalScreens).toFixed(1)} lần/tính năng
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Tất cả tính năng được dùng</p>
                        <p className="text-sm text-[#94a3b8] mt-1">
                          100% tính năng có người sử dụng, không có tính năng "chết"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card className="bg-[#1e293b] border-white/10">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Phản hồi từ giáo viên
                </CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  {dashboardData.feedbackCount} phản hồi • Đánh giá TB: {dashboardData.avgRating.toFixed(1)} ⭐
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {dashboardData.feedbackList && dashboardData.feedbackList.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.feedbackList.map((feedback, index) => (
                      <div
                        key={index}
                        className={cn(
                          "rounded-lg p-4 border",
                          feedback.rating >= 4
                            ? "bg-green-500/5 border-green-500/20"
                            : feedback.rating === 3
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : "bg-red-500/5 border-red-500/20"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">
                                {feedback.userId}
                              </span>
                              <span className="text-xs text-[#64748b]">•</span>
                              <span className="text-xs text-[#64748b]">
                                {feedback.screen}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < feedback.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-600"
                                  )}
                                />
                              ))}
                              <span className="text-sm text-[#94a3b8] ml-2">
                                {feedback.rating}/5
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-[#64748b]">
                            {new Date(feedback.timestamp).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        {feedback.comment && (
                          <div className="mb-3">
                            <p className="text-xs text-[#94a3b8] mb-1">💬 Nhận xét:</p>
                            <p className="text-sm text-white">{feedback.comment}</p>
                          </div>
                        )}

                        {feedback.featureRequest && (
                          <div>
                            <p className="text-xs text-[#94a3b8] mb-1">💡 Đề xuất:</p>
                            <p className="text-sm text-cyan-400">{feedback.featureRequest}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#64748b]" />
                    <p className="text-[#94a3b8]">Chưa có phản hồi nào</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Refresh Button */}
            <div className="text-center">
              <Button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Activity className="h-4 w-4 mr-2" />
                Làm mới dữ liệu
              </Button>
            </div>
          </>
        ) : (
          <Card className="bg-[#1e293b] border-white/10">
            <CardContent className="py-20 text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-[#64748b]" />
              <p className="text-[#94a3b8]">Chưa có dữ liệu</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
