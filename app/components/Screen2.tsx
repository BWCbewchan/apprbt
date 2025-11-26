/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, Calendar, Copy, ExternalLink, Filter, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

interface CheckoutData {
  id: string;
  timestamp: string;
  teacher: string;
  sale: string;
  student: string;
  age: string;
  date: string;
  grade: string;
  subject: string;
  location: string;
  score: string;
  learningMonths: string;
  comment: string;
  link: string;
}

const SHEET_ID = '1Jsf7EbDQnKNvq6uyxTGGO9oEcIWw_9hkueQagTfxzLY';
const SHEET_NAME = 'Sheet1';

export default function Screen2() {
  const [allData, setAllData] = useState<CheckoutData[]>([]);
  const [filteredData, setFilteredData] = useState<CheckoutData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualAction, setIsManualAction] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Filter states
  const [teacherName, setTeacherName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [location, setLocation] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterInfo, setFilterInfo] = useState('');

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse CSV rows
  const parseCSVRows = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if ((char === '\n' || (char === '\r' && i + 1 < text.length && text[i + 1] === '\n')) && !inQuotes) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        if (char === '\r') i += 2;
        else i++;
      } else if (char === '\r') {
        i++;
      } else {
        currentField += char;
        i++;
      }
    }

    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    return rows.map(row =>
      row.map(value => value.trim().replace(/^"(.*)"$/, '$1'))
    );
  };

  // Normalize Vietnamese text
  const normalizeVietnameseText = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Load data from Google Sheets
  const loadSheetData = async (retryCount = 0): Promise<CheckoutData[]> => {
    setIsLoading(true);
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'text/csv,application/json,text/plain,*/*' }
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      if (!csvText || csvText.trim().length === 0) {
        throw new Error('Received empty data from Google Sheets');
      }

      const rows = parseCSVRows(csvText);
      if (rows.length <= 1) {
        throw new Error('No data rows found in the sheet');
      }

      const headers = rows[0];
      let linkColumnIndex = 30;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i] && headers[i].toLowerCase().includes('link')) {
          linkColumnIndex = i;
          break;
        }
      }

      const data: CheckoutData[] = [];
      const uniqueLocations = new Set<string>();
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 10) continue;

        let link = '';
        if (row.length > linkColumnIndex && row[linkColumnIndex]) {
          link = row[linkColumnIndex].trim();
          if (link && !link.startsWith('http')) {
            link = 'https://' + link;
          }
        }

        // Extract location from column J (index 9)
        const locationValue = row[9]?.trim() || '';
        if (locationValue) {
          uniqueLocations.add(locationValue);
        }

        // Map data according to sheet structure:
        // A(0)=Id, B(1)=Timestamp, C(2)=Teacher, D(3)=Sale, E(4)=Student, F(5)=Age, 
        // G(6)=Date, H(7)=Grade, I(8)=Subject, J(9)=Location, AC(28)=Score, 
        // AD(29)=Chốt case, AE(30)=Comment, AF(31)=Link
        data.push({
          id: row[0] || '',
          timestamp: row[1] || '',
          teacher: row[2] || '',
          sale: row[3] || '',
          student: row[4] || '',
          age: row[5] || '',
          date: row[6] || '',
          grade: row[7] || '',
          subject: row[8] || '',
          location: locationValue,
          score: row.length > 28 ? (row[28] || '') : '',
          learningMonths: '',
          comment: row.length > 30 ? (row[30] || '') : '',
          link: link || (row.length > 31 ? (row[31] || '') : '')
        });
      }

      // Update locations list
      const sortedLocations = Array.from(uniqueLocations).filter(loc => loc).sort();
      setLocations(sortedLocations);

      return data;
    } catch (error) {
      console.error(`Load error (attempt ${retryCount + 1}):`, error);
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return loadSheetData(retryCount + 1);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Parse Vietnamese date
  const parseVietnameseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    try {
      const datePart = dateStr.split(' ')[0];
      const parts = datePart.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month - 1, day);
        }
      }
      return new Date(0);
    } catch {
      return new Date(0);
    }
  };

  // Format date
  const formatDate = (dateStr: string, includeTime = false): string => {
    if (!dateStr) return '';
    try {
      const s = String(dateStr).trim();
      const parts = s.split(' ');
      const datePart = parts[0];
      if (datePart && datePart.includes('/')) {
        const dparts = datePart.split('/');
        if (dparts.length === 3) {
          const day = parseInt(dparts[0], 10);
          const month = parseInt(dparts[1], 10);
          const year = parseInt(dparts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
            if (includeTime && parts.length > 1) {
              return `${formattedDate} ${parts.slice(1).join(' ')}`;
            }
            return formattedDate;
          }
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Sort data by date
  const sortDataByDateDesc = (data: CheckoutData[]): CheckoutData[] => {
    return [...data].sort((a, b) => {
      const dateA = parseVietnameseDate(a.date);
      const dateB = parseVietnameseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Filter data
  const filterData = (): CheckoutData[] => {
    // Return empty if data not loaded yet
    if (!dataLoaded || allData.length === 0) {
      return [];
    }
    
    let filtered = [...allData];

    if (teacherName) {
      const normalizedSearch = normalizeVietnameseText(teacherName);
      filtered = filtered.filter(row => {
        if (!row.teacher) return false;
        const normalizedTeacher = normalizeVietnameseText(row.teacher);
        return normalizedTeacher.includes(normalizedSearch);
      });
    }

    if (studentName) {
      const normalizedSearch = normalizeVietnameseText(studentName);
      filtered = filtered.filter(row => {
        if (!row.student) return false;
        const normalizedStudent = normalizeVietnameseText(row.student);
        return normalizedStudent.includes(normalizedSearch);
      });
    }

    if (location) {
      filtered = filtered.filter(row => row.location === location);
    }

    if (grade) {
      filtered = filtered.filter(row => row.grade === grade);
    }

    if (subject) {
      filtered = filtered.filter(row => row.subject === subject);
    }

    if (fromDate || toDate) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;
        try {
          const dateParts = row.date.split(' ').filter(part => part.includes('/'))[0].split('/');
          if (dateParts.length !== 3) return false;

          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10);
          const year = parseInt(dateParts[2], 10);

          if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

          const rowDate = new Date(year, month - 1, day, 0, 0, 0, 0);

          if (fromDate) {
            const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
            const fromDateObj = new Date(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0);
            if (rowDate < fromDateObj) return false;
          }

          if (toDate) {
            const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
            const toDateObj = new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999);
            if (rowDate > toDateObj) return false;
          }

          return true;
        } catch {
          return false;
        }
      });
    }

    return filtered;
  };

  // Get current month data
  const getCurrentMonthData = (): CheckoutData[] => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return allData.filter(row => {
      try {
        const dateStr = row.date.split(' ')[0];
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          return month === currentMonth && year === currentYear;
        }
        return false;
      } catch {
        return false;
      }
    });
  };


  // Format date for input
  const formatDateForInput = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // Quick filters
  const setQuickFilter = async (type: 'today' | 'yesterday' | 'week' | 'month') => {
    // Load data if not loaded yet
    if (!dataLoaded && !isLoading) {
      await loadData();
    }

    setIsManualAction(true);
    setTeacherName('');
    setStudentName('');
    setLocation('');
    setGrade('');
    setSubject('');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let fromDateObj: Date, toDateObj: Date;

    switch (type) {
      case 'today':
        fromDateObj = new Date(today);
        toDateObj = new Date(today);
        break;
      case 'yesterday':
        fromDateObj = new Date(today);
        fromDateObj.setDate(today.getDate() - 1);
        toDateObj = new Date(fromDateObj);
        break;
      case 'week':
        fromDateObj = new Date(today);
        fromDateObj.setDate(today.getDate() - 6);
        toDateObj = new Date(today);
        break;
      case 'month':
        fromDateObj = new Date(today);
        fromDateObj.setDate(today.getDate() - 29);
        toDateObj = new Date(today);
        break;
    }

    setFromDate(formatDateForInput(fromDateObj));
    setToDate(formatDateForInput(toDateObj));
    setIsManualAction(false);
  };

  // Clear filters
  const clearFilters = () => {
    setIsManualAction(true);
    setTeacherName('');
    setStudentName('');
    setLocation('');
    setGrade('');
    setSubject('');
    setFromDate('');
    setToDate('');
    setFilterInfo('');
    setIsManualAction(false);
  };

  // Show all data
  const showAllData = async () => {
    // Load data if not loaded yet
    if (!dataLoaded && !isLoading) {
      await loadData();
    }

    setIsManualAction(true);
    clearFilters();
    setTimeout(() => {
      setFilteredData(sortDataByDateDesc(allData));
      setIsManualAction(false);
    }, 100);
  };

  // Show current month
  const showCurrentMonth = async () => {
    // Load data if not loaded yet
    if (!dataLoaded && !isLoading) {
      await loadData();
    }

    const currentMonthData = getCurrentMonthData();
    setFilteredData(sortDataByDateDesc(currentMonthData));
  };

  // Load or reload data
  const loadData = async () => {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    setIsLoading(true);
    try {
      const data = await loadSheetData();
      setAllData(data);
      setDataLoaded(true);
      const currentMonthData = getCurrentMonthData();
      setFilteredData(sortDataByDateDesc(currentMonthData));
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload data (alias for loadData)
  const reloadData = loadData;

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Could not copy text:', err);
    }
  };

  // Get learning status class
  const getLearningStatusClass = (status: string): string => {
    const normalized = status.trim().toLowerCase();
    if (normalized === 'pass') return 'status-pass';
    if (normalized === 'fail') return 'status-fail';
    if (normalized === '4 tháng') return 'status-4months';
    if (normalized === '1:1') return 'status-oneone';
    return 'status-default';
  };

  // Open evaluation form
  const openEvaluationForm = () => {
    window.open('https://forms.office.com/pages/responsepage.aspx?id=oAYARH-DxUGWTsVLZQsVNRdxoHOrh4tAlfWX5PKv_NxUQVhJTDFWV1RaV1gwQzBaRklDU1hJQVFHSi4u', '_blank');
  };

  // Update filter info
  useEffect(() => {
    const filters: string[] = [];
    if (teacherName) filters.push(`Giáo viên: "${teacherName}"`);
    if (studentName) filters.push(`Học viên: "${studentName}"`);
    if (location) {
      const locationText = document.getElementById('location')?.querySelector(`option[value="${location}"]`)?.textContent || location;
      filters.push(`Cơ sở: ${locationText}`);
    }
    if (grade) {
      const gradeText = document.getElementById('grade')?.querySelector(`option[value="${grade}"]`)?.textContent || grade;
      filters.push(`Khối: ${gradeText}`);
    }
    if (subject) {
      const subjectText = document.getElementById('subject')?.querySelector(`option[value="${subject}"]`)?.textContent || subject;
      filters.push(`Môn: ${subjectText}`);
    }
    if (fromDate || toDate) {
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          const fromStr = `${from.getDate().toString().padStart(2, '0')}/${(from.getMonth() + 1).toString().padStart(2, '0')}/${from.getFullYear()}`;
          const toStr = `${to.getDate().toString().padStart(2, '0')}/${(to.getMonth() + 1).toString().padStart(2, '0')}/${to.getFullYear()}`;
          if (fromDate === toDate) {
            filters.push(`Ngày: ${fromStr}`);
          } else {
            filters.push(`Từ ${fromStr} đến ${toStr}`);
          }
        }
      } else if (fromDate) {
        const from = new Date(fromDate);
        if (!isNaN(from.getTime())) {
          const fromStr = `${from.getDate().toString().padStart(2, '0')}/${(from.getMonth() + 1).toString().padStart(2, '0')}/${from.getFullYear()}`;
          filters.push(`Từ ngày: ${fromStr}`);
        }
      } else if (toDate) {
        const to = new Date(toDate);
        if (!isNaN(to.getTime())) {
          const toStr = `${to.getDate().toString().padStart(2, '0')}/${(to.getMonth() + 1).toString().padStart(2, '0')}/${to.getFullYear()}`;
          filters.push(`Đến ngày: ${toStr}`);
        }
      }
    }

    setFilterInfo(filters.length > 0 ? `Đang áp dụng: ${filters.join(' | ')}` : '');
  }, [teacherName, studentName, location, grade, subject, fromDate, toDate]);

  // Apply filters when they change
  useEffect(() => {
    if (isManualAction) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const hasFilters = Boolean(
        teacherName.trim() ||
        studentName.trim() ||
        location ||
        grade ||
        subject ||
        fromDate ||
        toDate
      );

      if (hasFilters) {
        const filtered = filterData();
        setFilteredData(sortDataByDateDesc(filtered));
      } else {
        const currentMonthData = getCurrentMonthData();
        setFilteredData(sortDataByDateDesc(currentMonthData));
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherName, studentName, location, grade, subject, fromDate, toDate, allData]);

  // Auto-load data when user starts interacting
  useEffect(() => {
    // Load data if user starts typing in filters or using quick filters
    if (!dataLoaded && !isLoading && (teacherName || studentName || location || grade || subject || fromDate || toDate)) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherName, studentName, location, grade, subject, fromDate, toDate]);

  return (
    <div className="relative flex flex-col p-4 md:p-8 space-y-6 min-h-screen">
      {/* Decorative shapes */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />

      {/* Warning Toast */}
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 p-4 flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            !
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-600 mb-1">Cảnh Báo</div>
            <div className="text-sm">
              Hệ thống truy vết thông tin học sinh đã liên kết với dữ liệu gốc. Giáo viên phải có trách nhiệm với case của mình.
              <div className="mt-2">
                Quy trình, quy định (mục 4):{' '}
                <a
                  href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/vii.-quy-dinh-va-quy-che-xu-ly-vi-pham"
                  target="_blank"
                  rel="noopener"
                  className="text-indigo-600 underline font-semibold"
                >
                  Xem chi tiết
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700"
            aria-label="Đóng cảnh báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text tracking-tight">
          Tìm Phiếu Checkout
        </h1>
      </div>

      {/* Filter Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#a5b4fc] text-xl">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Info */}
          {filterInfo && (
            <div className="bg-indigo-500/15 text-[#a5b4fc] p-4 rounded-xl border-l-4 border-[#a5b4fc]">
              🔍 {filterInfo}
            </div>
          )}

          {/* Filter Columns */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Column 1: Quick Filters */}
            <div className="bg-[rgba(15,23,42,0.4)] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-center text-[#a5b4fc] font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                ⚡ Bộ lọc nhanh
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-indigo-500/10 border-indigo-500/20 text-[#cbd5e1] hover:bg-indigo-500/30 hover:border-indigo-500/50"
                  onClick={() => setQuickFilter('today')}
                >
                  Hôm nay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-indigo-500/10 border-indigo-500/20 text-[#cbd5e1] hover:bg-indigo-500/30 hover:border-indigo-500/50"
                  onClick={() => setQuickFilter('yesterday')}
                >
                  Hôm qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-indigo-500/10 border-indigo-500/20 text-[#cbd5e1] hover:bg-indigo-500/30 hover:border-indigo-500/50"
                  onClick={() => setQuickFilter('week')}
                >
                  7 ngày qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-indigo-500/10 border-indigo-500/20 text-[#cbd5e1] hover:bg-indigo-500/30 hover:border-indigo-500/50"
                  onClick={() => setQuickFilter('month')}
                >
                  30 ngày qua
                </Button>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="text-center text-[#a5b4fc] font-semibold text-xs uppercase mb-2">
                  📝 Phiếu đánh giá
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  onClick={openEvaluationForm}
                >
                  Viết phiếu đánh giá
                </Button>
              </div>
            </div>

            {/* Column 2: People */}
            <div className="bg-[rgba(15,23,42,0.4)] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-center text-[#a5b4fc] font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                👥 Tìm theo người
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    🧑‍🏫 Giáo viên
                  </label>
                  <Input
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Nhập tên giáo viên..."
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    👨‍🎓 Học viên
                  </label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập tên học viên..."
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Location & Subject */}
            <div className="bg-[rgba(15,23,42,0.4)] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-center text-[#a5b4fc] font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                🎓 Địa điểm & môn học
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    🏢 Cơ sở
                  </label>
                  <Select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="">Tất cả cơ sở</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    📚 Khối
                  </label>
                  <Select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="">Tất cả khối</option>
                    <option value="Coding">Coding</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Art">Art</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    🎯 Môn trải nghiệm
                  </label>
                  <Select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="">Tất cả môn</option>
                    <optgroup label="Coding">
                      <option value="SB">SB</option>
                      <option value="GB">GB</option>
                      <option value="Web">Web</option>
                      <option value="PTB">PTB</option>
                    </optgroup>
                    <optgroup label="Robotics">
                      <option value="ROB4B">ROB4B</option>
                      <option value="PreB">PreB</option>
                      <option value="Lego 6+">Lego 6+</option>
                      <option value="ArmB">ArmB</option>
                      <option value="SemiB">SemiB</option>
                    </optgroup>
                    <optgroup label="Art">
                      <option value="ART4B">ART4B</option>
                      <option value="KA">KA</option>
                      <option value="VA">VA</option>
                      <option value="VC">VC</option>
                      <option value="GD">GD</option>
                    </optgroup>
                  </Select>
                </div>
              </div>
            </div>

            {/* Column 4: Time & Actions */}
            <div className="bg-[rgba(15,23,42,0.4)] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-center text-[#a5b4fc] font-semibold text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                ⏰ Thời gian & thao tác
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    📅 Từ ngày
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    📅 Đến ngày
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                    onClick={showCurrentMonth}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Tháng
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                    onClick={showAllData}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                    onClick={reloadData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Tải lại
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#a5b4fc] text-xl">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Kết quả tìm kiếm
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {filteredData.length} phiếu
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dataLoaded && !isLoading ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-[#cbd5e1] text-lg mb-4">
                📊 Chưa có dữ liệu. Vui lòng tải dữ liệu để bắt đầu tìm kiếm.
              </div>
              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 text-lg font-semibold"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Tải dữ liệu
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-[#a5b4fc] mb-4" />
              <div className="font-semibold text-lg mb-2">Đang tải dữ liệu</div>
              <div className="text-[#cbd5e1] text-sm">Vui lòng đợi trong giây lát...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-[#cbd5e1] mb-4" />
              <div className="font-semibold text-lg mb-2">Không tìm thấy kết quả</div>
              <div className="text-[#cbd5e1] text-sm">Thử thay đổi bộ lọc để tìm kiếm</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[rgba(15,23,42,0.8)] border-b border-white/10">
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">ID</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Timestamp</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Giáo viên</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Sale</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Học viên</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Tuổi</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Ngày TN</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Khối</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Môn</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Cơ sở</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Điểm</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Confirm time</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Nhận xét</th>
                    <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase tracking-wide">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-3 text-sm text-[#f8fafc]">{row.id}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{formatDate(row.timestamp, true)}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.teacher}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.sale}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.student}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.age}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{formatDate(row.date)}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.grade}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.subject}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.location}</td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.score}</td>
                      <td className="p-3 text-sm text-center">
                        {row.learningMonths ? (
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-semibold",
                            getLearningStatusClass(row.learningMonths) === 'status-pass' && "bg-green-500 text-white",
                            getLearningStatusClass(row.learningMonths) === 'status-fail' && "bg-red-500 text-white",
                            getLearningStatusClass(row.learningMonths) === 'status-4months' && "bg-amber-500 text-white",
                            getLearningStatusClass(row.learningMonths) === 'status-oneone' && "bg-purple-500 text-white",
                            getLearningStatusClass(row.learningMonths) === 'status-default' && "bg-gray-500 text-white"
                          )}>
                            {row.learningMonths}
                          </span>
                        ) : (
                          <span className="text-[#cbd5e1]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-[#f8fafc]">{row.comment}</td>
                      <td className="p-3">
                        {row.link ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                              onClick={() => window.open(row.link, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0"
                              onClick={() => copyToClipboard(row.link)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[#cbd5e1] text-sm">Không có link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
