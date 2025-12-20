/**
 * © Statistics Dashboard - Xem thống kê lượt truy cập
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { getLocalStatistics, getTeacherCode, type Statistics } from '@/lib/appscript';
import { BarChart3, RefreshCw, TrendingUp, Users, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function StatisticsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<Statistics[]>([]);
  const [teacherCode, setTeacherCode] = useState('');

  const loadStatistics = () => {
    const localStats = getLocalStatistics();
    setStats(localStats);
    const code = getTeacherCode();
    setTeacherCode(code || 'N/A');
  };

  useEffect(() => {
    if (isOpen) {
      loadStatistics();
    }
  }, [isOpen]);

  const totalViews = stats.reduce((sum, stat) => sum + stat.views, 0);

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <>
      {/* Statistics Button - Fixed position at bottom right (above feedback) */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 z-50",
          "h-14 w-14 rounded-full",
          "bg-gradient-to-r from-blue-500 to-cyan-500",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110",
          "text-white",
          "group"
        )}
        aria-label="Xem thống kê"
      >
        <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Statistics Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#1e293b] border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-white/10 sticky top-0 bg-[#1e293b] z-10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    Thống kê truy cập
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] mt-1">
                    Phân tích lượt truy cập theo màn hình (Session hiện tại)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadStatistics}
                    className="text-[#cbd5e1] hover:text-white hover:bg-white/10"
                    title="Refresh"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-[#cbd5e1] hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Teacher Info */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">Mã giáo viên</p>
                    <p className="text-lg font-bold text-white">{teacherCode}</p>
                  </div>
                </div>
              </div>

              {stats.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-[#64748b]" />
                  <p className="text-[#94a3b8]">Chưa có dữ liệu thống kê</p>
                  <p className="text-sm text-[#64748b] mt-2">Hãy chuyển qua các màn hình khác để tạo thống kê</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Eye className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{totalViews}</p>
                          <p className="text-xs text-[#94a3b8]">Tổng lượt xem</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">{stats.length}</p>
                          <p className="text-xs text-[#94a3b8]">Màn hình đã xem</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rankings */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#f8fafc] font-semibold">
                      <TrendingUp className="h-5 w-5" />
                      <span>Xếp hạng màn hình</span>
                    </div>
                    
                    <div className="space-y-2">
                      {stats.map((stat, index) => {
                        const percentage = (stat.views / totalViews) * 100;
                        const isTop3 = index < 3;
                        
                        return (
                          <div
                            key={stat.screen}
                            className={cn(
                              "rounded-lg p-4 border transition-all hover:scale-[1.02]",
                              isTop3
                                ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                                : "bg-[#0f172a] border-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getMedalIcon(index)}</span>
                                <div>
                                  <p className="text-[#f8fafc] font-semibold">
                                    {stat.screen}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-white">
                                  {stat.views}
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
                                  isTop3
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
                  </div>

                  {/* Note */}
                  <div className="text-xs text-[#64748b] bg-[#0f172a] rounded-lg px-3 py-2 border border-white/5">
                    💡 Thống kê session hiện tại. Xem thống kê tổng hợp trong Google Sheets
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
