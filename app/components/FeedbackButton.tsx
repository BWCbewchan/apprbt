/**
 * © Feedback Component - Thu thập đánh giá người dùng
 * Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { submitFeedback, getUserId, getSessionId, isAppsScriptConfigured } from '@/lib/appscript';
import { saveFeedback } from '@/lib/adminStats';
import { MessageSquare, Send, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface FeedbackButtonProps {
  currentScreen: string;
}

export default function FeedbackButton({ currentScreen }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [featureRequest, setFeatureRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Initialize user session
  useEffect(() => {
    setUserId(getUserId());
    setSessionId(getSessionId());
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }

    if (!isAppsScriptConfigured()) {
      alert('⚠️ Apps Script chưa được cấu hình. Vui lòng xem hướng dẫn trong appscript/README.md');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to local storage first
      saveFeedback(rating, comment, featureRequest, currentScreen, userId);
      
      const success = await submitFeedback({
        rating,
        comment,
        featureRequest,
        screen: currentScreen,
        userId,
        sessionId,
      });

      if (success) {
        // Show success message
        setShowSuccess(true);
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setRating(0);
          setComment('');
          setFeatureRequest('');
          setShowSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Có lỗi xảy ra khi gửi feedback. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Feedback Button - Fixed position at bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full",
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110",
          "text-white",
          "group"
        )}
        aria-label="Mở form feedback"
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-[#1e293b] border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold gradient-text">
                    Đánh giá & Góp ý
                  </CardTitle>
                  <CardDescription className="text-[#94a3b8] mt-1">
                    Chia sẻ trải nghiệm của bạn với chúng tôi
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-[#cbd5e1] hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {showSuccess ? (
                <div className="text-center py-8 animate-in zoom-in-50 duration-300">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Cảm ơn bạn!</h3>
                  <p className="text-[#94a3b8]">Feedback của bạn đã được gửi thành công</p>
                </div>
              ) : (
                <>
                  {/* Rating Stars */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#f8fafc]">
                      Đánh giá của bạn <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                        >
                          <Star
                            className={cn(
                              "h-8 w-8 transition-all duration-200",
                              (hoveredRating >= star || rating >= star)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600"
                            )}
                          />
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="ml-2 text-sm text-[#cbd5e1] animate-in fade-in duration-200">
                          {rating === 5 ? '😍 Tuyệt vời!' : rating === 4 ? '😊 Hài lòng' : rating === 3 ? '😐 Bình thường' : rating === 2 ? '😕 Cần cải thiện' : '😞 Không hài lòng'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium text-[#f8fafc]">
                      Nhận xét của bạn
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn khi sử dụng app..."
                      className={cn(
                        "w-full min-h-[100px] px-4 py-3 rounded-lg",
                        "bg-[#0f172a] border border-white/10",
                        "text-[#f8fafc] placeholder:text-[#64748b]",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                        "resize-none transition-all"
                      )}
                      maxLength={500}
                    />
                    <div className="text-xs text-[#64748b] text-right">
                      {comment.length}/500 ký tự
                    </div>
                  </div>

                  {/* Feature Request */}
                  <div className="space-y-2">
                    <label htmlFor="featureRequest" className="text-sm font-medium text-[#f8fafc]">
                      Bạn muốn thêm tính năng gì?
                    </label>
                    <textarea
                      id="featureRequest"
                      value={featureRequest}
                      onChange={(e) => setFeatureRequest(e.target.value)}
                      placeholder="Đề xuất các tính năng mới bạn muốn thấy trong app..."
                      className={cn(
                        "w-full min-h-[80px] px-4 py-3 rounded-lg",
                        "bg-[#0f172a] border border-white/10",
                        "text-[#f8fafc] placeholder:text-[#64748b]",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                        "resize-none transition-all"
                      )}
                      maxLength={300}
                    />
                    <div className="text-xs text-[#64748b] text-right">
                      {featureRequest.length}/300 ký tự
                    </div>
                  </div>

                  {/* Screen Info */}
                  <div className="text-xs text-[#64748b] bg-[#0f172a] rounded-lg px-3 py-2 border border-white/5">
                    📍 Màn hình hiện tại: <span className="text-purple-400 font-medium">{currentScreen}</span>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className={cn(
                      "w-full h-12",
                      "bg-gradient-to-r from-purple-500 to-pink-500",
                      "hover:from-purple-600 hover:to-pink-600",
                      "text-white font-semibold",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-300"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Gửi đánh giá
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
