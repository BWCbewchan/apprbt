/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Google Sheets configuration
const COMMENTS_SHEET_ID = '1CBLWOrdRIfuCvdemnoW3qYyzdl8OImv2sat9YsMXMdU';
const COMMENTS_SHEET_NAME = 'nhanxet';

interface CommentData {
  nam: number;
  khoa: string;
  linknhung: string;
}

export default function Screen4() {
  const [commentsData, setCommentsData] = useState<CommentData[]>([]);
  const [currentYear, setCurrentYear] = useState(1);
  const [currentDocUrl, setCurrentDocUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Parse CSV line (handle quotes and commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.replace(/^"|"$/g, ''));
    return result;
  };

  // Load comments data from Google Sheets
  const loadCommentsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${COMMENTS_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(COMMENTS_SHEET_NAME)}`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');
      const comments: CommentData[] = [];

      // Skip header row (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        if (values.length >= 3) {
          const [nam, khoa, linknhung] = values;

          if (nam && khoa) {
            comments.push({
              nam: parseInt(nam.trim()) || 1,
              khoa: khoa.trim().toLowerCase(),
              linknhung: linknhung ? linknhung.trim() : ''
            });
          }
        }
      }

      setCommentsData(comments);
      showNotification('✅ Đã tải dữ liệu nhận xét thành công!', 'success');
      
      // Auto-load Year 1 Basic course if available
      autoLoadDefaultCourse(comments);
    } catch (error) {
      console.error('Error loading comments data:', error);
      setError('Không thể tải dữ liệu từ Google Sheets');
      showNotification('❌ Lỗi khi tải dữ liệu nhận xét!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load default course (Year 1 - Basic)
  const autoLoadDefaultCourse = (data: CommentData[]) => {
    const defaultCourse = data.find(item => 
      item.nam === 1 && item.khoa === 'basic' && item.linknhung
    );

    if (defaultCourse) {
      setTimeout(() => {
        loadDocumentFromUrl(defaultCourse.linknhung, 'Khóa Cơ Bản - Năm 1 (Mặc định)');
        setActiveCourse('basic');
        showNotification('📚 Đã tự động tải Khóa Cơ Bản - Năm 1', 'info');
      }, 1000);
    }
  };

  // Load document from URL
  const loadDocumentFromUrl = (url: string, title: string) => {
    setCurrentDocUrl(url);
    setIsLoadingDoc(true);
    setActiveCourse(title.toLowerCase().includes('cơ bản') ? 'basic' : 
                   title.toLowerCase().includes('nâng cao') ? 'advance' : 
                   title.toLowerCase().includes('chuyên sâu') ? 'intensive' : null);

    setTimeout(() => {
      setIsLoadingDoc(false);
      showNotification(`✅ Đã tải ${title} thành công!`, 'success');
    }, 500);
  };

  // Switch between years
  const switchYear = (year: number) => {
    setCurrentYear(year);
    setCurrentDocUrl(null);
    setActiveCourse(null);
    showNotification(`📚 Chuyển sang Năm ${year}`, 'info');
  };

  // Get courses for current year
  const getYearCourses = () => {
    return commentsData.filter(item => item.nam === currentYear);
  };


  // Load data on mount
  useEffect(() => {
    loadCommentsData();
  }, []);

  const yearCourses = getYearCourses();
  const courseNames = {
    'basic': 'Khóa Cơ Bản',
    'advance': 'Khóa Nâng Cao',
    'intensive': 'Khóa Chuyên Sâu'
  };

  return (
    <div className="relative flex flex-col p-4 md:p-8 space-y-4 min-h-screen">
      {/* Decorative shapes */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />

      {/* Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white font-medium shadow-lg animate-slide-in",
            notification.type === 'success' && "bg-gradient-to-r from-green-500 to-emerald-600",
            notification.type === 'error' && "bg-gradient-to-r from-red-500 to-red-600",
            notification.type === 'info' && "bg-gradient-to-r from-indigo-500 to-indigo-600"
          )}
        >
          {notification.message}
        </div>
      )}

      {/* Header with Year Tabs */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#a5b4fc] text-2xl text-center">
            Nhận Xét Zalo
          </CardTitle>
          <p className="text-center text-[#cbd5e1] text-sm mt-1">
            Hướng dẫn và mẫu nhận xét cho phụ huynh qua Zalo
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Year Tabs */}
          <div className="flex gap-2">
            {[1, 2, 3].map(year => (
              <button
                key={year}
                onClick={() => switchYear(year)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all",
                  currentYear === year
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                    : "bg-[rgba(30,41,59,0.6)] text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                )}
              >
                Năm {year}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Indicator */}
      {isLoading && (
        <Card className="glass-card border-white/10">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#a5b4fc]" />
              <p className="text-[#cbd5e1]">Đang tải dữ liệu từ Google Sheets...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <Card className="glass-card border-white/10 border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Lỗi tải nội dung</h3>
              <p className="text-[#cbd5e1] text-sm mb-3">{error}</p>
              <Button
                onClick={loadCommentsData}
                size="sm"
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Buttons */}
      {!isLoading && !error && (
        <Card className="glass-card border-white/10">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['basic', 'advance', 'intensive'].map(courseType => {
                const courseData = yearCourses.find(item => item.khoa === courseType);
                const hasLink = courseData && courseData.linknhung;
                const isActive = activeCourse === courseType;

                return (
                  <Button
                    key={courseType}
                    onClick={() => {
                      if (hasLink && courseData) {
                        loadDocumentFromUrl(
                          courseData.linknhung,
                          `${courseNames[courseType as keyof typeof courseNames]} - Năm ${currentYear}`
                        );
                      } else {
                        showNotification('📝 Tài liệu đang được cập nhật', 'info');
                      }
                    }}
                    disabled={!hasLink}
                    className={cn(
                      "h-auto py-4 px-3 flex flex-col gap-1.5 transition-all",
                      hasLink
                        ? isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                        : "bg-[rgba(30,41,59,0.6)] border border-white/10 text-[#cbd5e1] cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="font-semibold text-base">
                      {courseNames[courseType as keyof typeof courseNames]}
                    </div>
                    <div className="text-xs opacity-90">
                      {hasLink ? '📄 Có tài liệu' : '⏳ Đang cập nhật'}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Content */}
      {currentDocUrl && (
        <Card className="glass-card border-white/10">
          <CardContent className="pt-4">
            {/* Loading Doc */}
            {isLoadingDoc && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#a5b4fc]" />
              </div>
            )}

            {/* Iframe */}
            {!isLoadingDoc && (
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg">
                <iframe
                  id="documentIframe"
                  src={`${currentDocUrl}?embedded=true`}
                  className="w-full h-[800px] border-none bg-white"
                  title="Google Docs Content"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

