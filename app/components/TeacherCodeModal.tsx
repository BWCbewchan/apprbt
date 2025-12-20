/**
 * © Teacher Code Modal - Nhập mã giáo viên
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface TeacherCodeModalProps {
  onSubmit: (teacherCode: string) => void;
}

export default function TeacherCodeModal({ onSubmit }: TeacherCodeModalProps) {
  const [teacherCode, setTeacherCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const code = teacherCode.trim();
    
    if (!code) {
      setError('Vui lòng nhập mã giáo viên!');
      return;
    }

    if (code.length < 3) {
      setError('Mã giáo viên phải có ít nhất 3 ký tự!');
      return;
    }

    // Validate format (chấp nhận cả chữ hoa, chữ thường và số)
    if (!/^[A-Za-z0-9]+$/.test(code)) {
      setError('Mã giáo viên chỉ được chứa chữ cái và số!');
      return;
    }

    // Submit as-is, no uppercase
    onSubmit(code);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#1e293b] border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <CardHeader className="border-b border-white/10 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            Chào mừng đến với AppRBT
          </CardTitle>
          <CardDescription className="text-[#94a3b8] mt-2">
            Vui lòng nhập mã giáo viên của bạn để tiếp tục
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="teacherCode" className="text-sm font-medium text-[#f8fafc]">
              Mã giáo viên <span className="text-red-400">*</span>
            </label>
            <Input
              id="teacherCode"
              type="text"
              value={teacherCode}
              onChange={(e) => {
                setTeacherCode(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ví dụ: gv001, baotc, GV123, ..."
              className={cn(
                "h-12 text-center text-lg font-semibold tracking-wider",
                "bg-[#0f172a] border-white/10 text-white",
                "focus:border-purple-500 focus:ring-purple-500",
                error && "border-red-500"
              )}
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="space-y-1 text-sm text-[#cbd5e1]">
                <p className="font-semibold text-white">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-[#94a3b8]">
                  <li>Mã giáo viên dùng để thống kê và phân tích</li>
                  <li>Mã sẽ được lưu và không cần nhập lại</li>
                  <li>Nhập bình thường, mã sẽ được lưu y nguyên</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!teacherCode.trim()}
            className={cn(
              "w-full h-12 text-lg font-semibold",
              "bg-gradient-to-r from-purple-500 to-pink-500",
              "hover:from-purple-600 hover:to-pink-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Xác nhận
          </Button>

          <p className="text-xs text-center text-[#64748b]">
            © 2024 AppRBT HCM1&4 - Phát triển bởi Trần Chí Bảo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
