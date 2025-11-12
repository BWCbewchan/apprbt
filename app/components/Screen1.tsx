'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Clipboard, Download, X, Loader2, Check, Link2, FileText, Settings } from 'lucide-react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface Lesson {
  bai: string;
  nam: number;
  khoa: string;
  link1: string;
  link2: string;
  slide: string;
}

const COURSES = {
  'basic': 'Basic',
  'advance': 'Advance',
  'intensive': 'Intensive'
};

const SHEET_ID = '1CBLWOrdRIfuCvdemnoW3qYyzdl8OImv2sat9YsMXMdU';
const SHEET_NAME = 'robotics';

export default function Screen1() {
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentYear, setCurrentYear] = useState(1);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Parse CSV line
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

  // Load lessons from Google Sheets
  const loadLessonsData = async () => {
    setIsLoadingLessons(true);
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      const lines = csvText.split('\n');
      const lessonsData: Lesson[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length >= 4) {
          const [bai, nam, khoa, link1, link2 = '', slide = ''] = values;

          if (bai && bai.trim() && nam && khoa) {
            lessonsData.push({
              bai: bai.trim(),
              nam: parseInt(nam.trim()) || 1,
              khoa: khoa.trim().toLowerCase(),
              link1: link1 ? link1.trim() : '',
              link2: link2 ? link2.trim() : '',
              slide: slide ? slide.trim() : ''
            });
          }
        }
      }

      setLessons(lessonsData);
      showNotification('✅ Đã tải dữ liệu bài học thành công!', 'success');
    } catch (error) {
      console.error('Error loading lessons:', error);
      showNotification('❌ Lỗi khi tải dữ liệu từ Google Sheets!', 'error');
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Validate URL
  const isValidURL = (string: string): boolean => {
    if (!string || typeof string !== 'string') return false;

    try {
      let url = string.trim();
      if (!url.includes('://')) {
        url = 'https://' + url;
      }
      const urlObj = new URL(url);
      return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
             urlObj.hostname.length > 0;
    } catch {
      return false;
    }
  };

  // Generate QR Code
  const generateQR = async (inputUrl?: string) => {
    const urlToGenerate = inputUrl || url.trim();

    if (!urlToGenerate) {
      showNotification('Vui lòng nhập URL!', 'error');
      return;
    }

    let finalUrl = urlToGenerate;
    if (!finalUrl.includes('://')) {
      finalUrl = 'https://' + finalUrl;
      setUrl(finalUrl);
    }

    if (!isValidURL(finalUrl)) {
      showNotification('Vui lòng nhập URL hợp lệ!', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(finalUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataUrl(dataUrl);
      setGeneratedUrl(finalUrl);
      showNotification('✅ Mã QR đã được tạo thành công!', 'success');
    } catch (error) {
      console.error('Error generating QR:', error);
      showNotification('❌ Lỗi tạo mã QR!', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Paste from clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 1500);

      if (text.trim() && text.trim().length > 5) {
        setTimeout(() => generateQR(text), 200);
      }
    } catch (err) {
      showNotification('Không thể dán từ clipboard', 'error');
    }
  };

  // Download QR Code
  const downloadQR = async (format: 'png' | 'svg') => {
    if (!qrCodeDataUrl) {
      showNotification('Vui lòng tạo mã QR trước!', 'error');
      return;
    }

    try {
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = qrCodeDataUrl;
        link.click();
        showNotification('📥 Đã tải xuống file PNG!', 'success');
      } else {
        const svgString = await QRCode.toString(generatedUrl, {
          type: 'svg',
          width: 300,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        });

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        showNotification('📥 Đã tải xuống file SVG!', 'success');
      }
    } catch (error) {
      console.error('Error downloading QR:', error);
      showNotification('❌ Lỗi khi tải xuống!', 'error');
    }
  };

  // Clear all
  const clearAll = () => {
    setUrl('');
    setQrCodeDataUrl(null);
    setGeneratedUrl('');
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
    }
    showNotification('🗑️ Đã xóa tất cả!', 'info');
  };

  // Select lesson link
  const selectLessonLink = (linkUrl: string, description: string) => {
    setUrl(linkUrl);
    generateQR(linkUrl);
    showNotification(`✅ Đã chọn và tạo QR: ${description}`, 'success');
  };

  // Filter lessons by year and course
  const getFilteredLessons = (course: string) => {
    return lessons.filter(
      lesson => lesson.nam === currentYear && lesson.khoa.toLowerCase() === course.toLowerCase()
    );
  };

  // Auto-generate QR on URL change (debounced)
  useEffect(() => {
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
    }

    if (!url.trim() || url.trim().length <= 5) {
      return;
    }

    const currentUrl = url.trim();
    generateTimeoutRef.current = setTimeout(() => {
      if (currentUrl && currentUrl.length > 5) {
        generateQR(currentUrl);
      }
    }, 800);

    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Load lessons on mount
  useEffect(() => {
    loadLessonsData();
  }, []);

  return (
    <div className="relative flex flex-col p-4 md:p-8 space-y-6 min-h-screen">
      {/* Decorative shapes */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />

      {/* Notification */}
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white font-medium shadow-2xl transition-all backdrop-blur-md border border-white/10",
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : notification.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
          )}
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text tracking-tight">
          Tạo Mã QR
        </h1>
        <p className="text-[#cbd5e1] text-lg">
          Chuyển đổi link thành mã QR để dễ dàng chia sẻ và truy cập
        </p>
      </div>

      {/* Input Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#a5b4fc] text-xl">
            <Link2 className="h-5 w-5" />
            Nhập Đường Dẫn
          </CardTitle>
          <CardDescription className="text-[#cbd5e1]">
            Nhập URL để tạo mã QR tự động
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="urlInput" className="text-sm font-medium text-[#cbd5e1]">
              🌐 URL cần tạo mã QR:
            </label>
            <div className="relative">
              <Input
                id="urlInput"
                type="url"
                placeholder="Nhập hoặc dán link - QR sẽ được tạo tự động..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    generateQR();
                  }
                }}
                className="pr-24 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:border-indigo-500/50 focus:ring-indigo-500/25"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                onClick={pasteFromClipboard}
              >
                {pasteSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => generateQR()} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-indigo-500/50 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Tạo Mã QR
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(15,23,42,0.8)] hover:border-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa Tất Cả
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrCodeDataUrl && (
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-[#a5b4fc] text-xl">
              <FileText className="h-5 w-5" />
              Mã QR Đã Tạo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl border border-white/20 shadow-2xl">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-[300px] h-[300px]" />
              </div>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button 
                onClick={() => downloadQR('png')} 
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải PNG
              </Button>
              <Button 
                onClick={() => downloadQR('svg')} 
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải SVG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#a5b4fc] text-xl">
            <Settings className="h-5 w-5" />
            Bài Học Robotics
          </CardTitle>
          <CardDescription className="text-[#cbd5e1]">
            Chọn bài học để tạo mã QR nhanh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Year Toggle */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[1, 2, 3].map((year) => (
              <Button
                key={year}
                variant={currentYear === year ? 'default' : 'outline'}
                onClick={() => setCurrentYear(year)}
                className={cn(
                  currentYear === year
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-lg'
                    : 'bg-[rgba(15,23,42,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(15,23,42,0.8)] hover:border-[#a5b4fc]'
                )}
              >
                Năm {year}
              </Button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoadingLessons && (
            <div className="flex items-center justify-center gap-2 text-[#a5b4fc]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu từ Google Sheets...
            </div>
          )}

          {/* Lessons Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(COURSES).map(([key, name]) => {
              const courseLessons = getFilteredLessons(key);
              return (
                <div 
                  key={key} 
                  className="bg-[rgba(15,23,42,0.4)] border border-white/10 rounded-2xl p-4 space-y-4 hover:border-[#a5b4fc]/50 transition-all"
                >
                  <div className="text-center border-b border-white/10 pb-3">
                    <h3 className="font-bold text-lg gradient-text">{name}</h3>
                    <p className="text-sm text-[#cbd5e1] mt-1">
                      {courseLessons.length} bài học
                    </p>
                  </div>
                  <div className="space-y-2">
                    {courseLessons.length === 0 ? (
                      <p className="text-sm text-[#cbd5e1] text-center py-4">
                        {currentYear === 3 ? '🚀 Năm 3 sẽ được cập nhật sớm!' : 'Chưa có bài học'}
                      </p>
                    ) : (
                      courseLessons.map((lesson, index) => (
                        <div
                          key={index}
                          className="bg-[rgba(30,41,59,0.6)] border border-white/10 rounded-xl p-3 space-y-2 hover:bg-[rgba(30,41,59,0.8)] hover:border-[#a5b4fc]/50 transition-all cursor-pointer"
                        >
                          <p className="text-sm font-medium text-[#f8fafc] line-clamp-2">{lesson.bai}</p>
                          <div className="space-y-2">
                            {lesson.link1 && (
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                                  onClick={() => window.open(lesson.link1, '_blank')}
                                >
                                  🔗 Mở Link 1
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="text-xs h-7 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                                  onClick={() => selectLessonLink(lesson.link1, `${lesson.bai} - Link 1`)}
                                >
                                  📱 QR
                                </Button>
                              </div>
                            )}
                            {lesson.link2 && (
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                                  onClick={() => window.open(lesson.link2, '_blank')}
                                >
                                  🔗 Mở Link 2
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="text-xs h-7 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                                  onClick={() => selectLessonLink(lesson.link2, `${lesson.bai} - Link 2`)}
                                >
                                  📱 QR
                                </Button>
                              </div>
                            )}
                            {lesson.slide && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
                                onClick={() => window.open(lesson.slide, '_blank')}
                              >
                                🔗 Mở Slide
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
