'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { MessageSquare, Users, Loader2, Copy, Check, Sparkles, Settings, X, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface ScoreData {
  attitudeFocus: number;
  attitudeQuestion: number;
  assemblySpeed: number;
  assemblyAccuracy: number;
  assemblyCreativity: number;
  programmingMemory: number;
  programmingNewKnowledge: number;
  programmingCreativity: number;
  teamwork: number;
}

interface ClassData {
  name: string;
  code: string;
  subject: string;
  totalSessions: number;
  students: string[];
  feedbackSessions: number[];
  comments: { [session: string]: string[] };
  created: string;
  updated?: string;
}

const COMMENTS_BY_SCORE: { [key: number]: string } = {
  1: "Cần cố gắng nhiều hơn để cải thiện.",
  2: "Chưa đạt được kỳ vọng, cần được hướng dẫn thêm.",
  3: "Có những tiến bộ nhỏ, nhưng cần thêm sự luyện tập.",
  4: "Đang trên đà phát triển, nhưng cần tập trung hơn.",
  5: "Hoàn thành ở mức cơ bản, cần học hỏi thêm.",
  6: "Đạt mức trung bình, có thể làm tốt hơn.",
  7: "Khá tốt, có một vài điểm đáng chú ý.",
  8: "Tốt, có khả năng tiếp thu và vận dụng.",
  9: "Rất tốt, thể hiện sự hiểu biết sâu sắc.",
  10: "Xuất sắc, vượt trên kỳ vọng."
};

const CLASSES_STORAGE_KEY = 'mindx_classes';

export default function Screen3() {
  const [activeTab, setActiveTab] = useState<'individual' | 'class'>('individual');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Individual review states
  const [studentName, setStudentName] = useState('');
  const [studentSubject, setStudentSubject] = useState('VEXcodeGO');
  const [scores, setScores] = useState<ScoreData>({
    attitudeFocus: 5,
    attitudeQuestion: 5,
    assemblySpeed: 5,
    assemblyAccuracy: 5,
    assemblyCreativity: 5,
    programmingMemory: 5,
    programmingNewKnowledge: 5,
    programmingCreativity: 5,
    teamwork: 5
  });
  const [aiPromptType, setAiPromptType] = useState('simple');
  const [detailedComments, setDetailedComments] = useState('');
  const [reviewOutput, setReviewOutput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [includeTeamwork, setIncludeTeamwork] = useState(true);

  // Class management states
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClassIndex, setEditingClassIndex] = useState<number | null>(null);
  const [className, setClassName] = useState('');
  const [classSubject, setClassSubject] = useState('VEXcodeGO');
  const [totalSessions, setTotalSessions] = useState(14);
  const [students, setStudents] = useState<string[]>(['']);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);
  const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(null);
  const [classComments, setClassComments] = useState<{ [session: string]: { [studentIndex: number]: string } }>({});
  
  // AI Modal for class management
  const [showClassAiModal, setShowClassAiModal] = useState(false);
  const [classAiModalState, setClassAiModalState] = useState<{
    classIndex: number | null;
    session: number | null;
    studentIndex: number | null;
    studentName: string;
    subject: string;
    targetTextarea: HTMLTextAreaElement | null;
  }>({
    classIndex: null,
    session: null,
    studentIndex: null,
    studentName: '',
    subject: '',
    targetTextarea: null
  });
  const [classAiScores, setClassAiScores] = useState<ScoreData>({
    attitudeFocus: 5,
    attitudeQuestion: 5,
    assemblySpeed: 5,
    assemblyAccuracy: 5,
    assemblyCreativity: 5,
    programmingMemory: 5,
    programmingNewKnowledge: 5,
    programmingCreativity: 5,
    teamwork: 5
  });
  const [classAiPromptType, setClassAiPromptType] = useState('simple');
  const [classAiSubject, setClassAiSubject] = useState('');
  const [classAiTeacherNote, setClassAiTeacherNote] = useState('');
  const [classAiResult, setClassAiResult] = useState('');
  const [isGeneratingClassAI, setIsGeneratingClassAI] = useState(false);
  const [classAiIncludeTeamwork, setClassAiIncludeTeamwork] = useState(true);
  
  // Student detail modal
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
    classIndex: number;
    studentIndex: number;
    studentName: string;
  } | null>(null);
  
  // Auto-save debounce
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load API key and classes from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey') || '';
    setApiKey(savedApiKey);
    setApiKeyInput(savedApiKey);

    // Nếu chưa có API key, hiện modal ngay và không cho đóng
    if (!savedApiKey) {
      setShowApiKeyModal(true);
    }

    const savedClasses = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch (e) {
        console.error('Error loading classes:', e);
      }
    }
  }, []);

  // Test API key
  const testApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiKeyTestResult({ success: false, message: 'Vui lòng nhập API key trước khi kiểm tra.' });
      return;
    }

    setIsTestingApiKey(true);
    setApiKeyTestResult(null);

    try {
      const testPrompt = 'Test';
      const chatHistory = [{ role: "user", parts: [{ text: testPrompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKeyInput.trim()}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          setApiKeyTestResult({ success: false, message: 'API key không hợp lệ. Vui lòng kiểm tra lại.' });
        } else if (response.status === 403) {
          setApiKeyTestResult({ success: false, message: 'API key không có quyền truy cập. Vui lòng kiểm tra lại.' });
        } else {
          setApiKeyTestResult({ success: false, message: `Lỗi: ${response.status} - ${errorData.error?.message || 'Không thể kết nối đến API'}` });
        }
        return;
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        setApiKeyTestResult({ success: true, message: 'API key hợp lệ! Bạn có thể lưu và sử dụng.' });
      } else {
        setApiKeyTestResult({ success: false, message: 'API key không trả về kết quả hợp lệ.' });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setApiKeyTestResult({ success: false, message: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.' });
    } finally {
      setIsTestingApiKey(false);
    }
  };

  // Save API key
  const saveApiKey = () => {
    if (!apiKeyInput.trim()) {
      showNotification('Vui lòng nhập API key hợp lệ!', 'error');
      return;
    }

    // Nếu đã test và thành công, hoặc chưa test thì vẫn cho phép lưu
    if (apiKeyTestResult && !apiKeyTestResult.success) {
      showNotification('Vui lòng kiểm tra API key trước khi lưu!', 'error');
      return;
    }

    localStorage.setItem('geminiApiKey', apiKeyInput.trim());
    setApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
    setApiKeyTestResult(null);
    showNotification('API key đã được lưu thành công!', 'success');
  };

  // Kiểm tra xem có API key chưa (để quyết định có cho đóng modal không)
  const hasApiKey = !!apiKey;

  // Notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate scores
  const calculateScores = () => {
    const attitudeScore = Math.round((scores.attitudeFocus + scores.attitudeQuestion) / 2);
    const assemblyScore = Math.round((scores.assemblySpeed + scores.assemblyAccuracy + scores.assemblyCreativity) / 3);
    const programmingScore = Math.round((scores.programmingMemory + scores.programmingNewKnowledge + scores.programmingCreativity) / 3);
    
    // Tính điểm tổng: nếu có teamwork thì chia 4, không thì chia 3
    let overallScore;
    if (includeTeamwork) {
      overallScore = Math.round((attitudeScore + assemblyScore + programmingScore + scores.teamwork) / 4);
    } else {
      overallScore = Math.round((attitudeScore + assemblyScore + programmingScore) / 3);
    }
    
    return { attitudeScore, assemblyScore, programmingScore, overallScore };
  };

  // Generate AI comment
  const generateAIComment = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGeneratingAI(true);
    setDetailedComments('Đang tạo nhận xét, vui lòng đợi...');

    const { attitudeScore, assemblyScore, programmingScore, overallScore } = calculateScores();
    const name = studentName || 'học viên';

    let prompt = `Bạn là một giáo viên chuyên môn về giáo dục STEM. Hãy viết một nhận xét chi tiết, thân thiện và mang tính xây dựng về quá trình học tập của một học viên có tên "${name}" trong môn học "${studentSubject}".
Nhận xét của bạn PHẢI BẮT ĐẦU TRỰC TIẾP với định dạng sau và KHÔNG ĐƯA VÀO BẤT KỲ LỜI CHÀO hay mở đầu nào khác:
- Thái độ học tập: (nội dung).
- Kỹ năng lắp ráp mô hình: (nội dung).
- Kỹ năng lập trình: (nội dung).
${includeTeamwork ? '- Kỹ năng làm việc nhóm: (nội dung).\n' : ''}- Đề xuất từ giáo viên: (nội dung).
Nội dung trong ngoặc đơn phải được thay thế bằng văn bản nhận xét tương ứng. Hãy sử dụng tên học viên "${name}" ngay trong nội dung nhận xét để tạo cảm giác cá nhân hóa.
Nhận xét cần dựa trên các điểm số sau và không lặp lại nguyên văn các câu nhận xét mặc định:
- Thái độ học tập: Mức độ tập trung: ${scores.attitudeFocus}/10, Chủ động đặt câu hỏi: ${scores.attitudeQuestion}/10
- Kỹ năng lắp ráp mô hình: Tốc độ: ${scores.assemblySpeed}/10, Độ chính xác: ${scores.assemblyAccuracy}/10, Sáng tạo: ${scores.assemblyCreativity}/10
- Kỹ năng lập trình: Ghi nhớ kiến thức cũ: ${scores.programmingMemory}/10, Tiếp thu kiến thức mới: ${scores.programmingNewKnowledge}/10, Vận dụng sáng tạo: ${scores.programmingCreativity}/10
${includeTeamwork ? `- Kỹ năng làm việc nhóm: ${scores.teamwork}/10\n` : ''}`;

    if (aiPromptType === 'positive') {
      prompt += `Nhận xét cần mang tính tích cực và khuyến khích, tập trung vào những điểm mạnh và thành tựu của học viên.`;
    } else if (aiPromptType === 'improvement') {
      prompt += `Nhận xét cần tập trung vào các điểm cần cải thiện, đồng thời đưa ra những lời khuyên cụ thể và mang tính xây dựng để giúp học viên phát triển hơn.`;
    } else if (aiPromptType === 'comprehensive') {
      prompt += `Nhận xét cần bao quát toàn bộ các khía cạnh, phân tích sâu về cả điểm mạnh và điểm yếu, đưa ra lời khuyên chi tiết và chuyên sâu.`;
    } else if (aiPromptType === 'simple') {
      prompt += `Nhận xét cần ngắn gọn, đi thẳng vào vấn đề, dễ hiểu và không quá dài dòng.`;
    } else if (aiPromptType === 'direct-positive-encouraging') {
      prompt += `Nhận xét cần ngắn gọn, trực tiếp, tập trung vào những điểm tích cực và mang tính khuyến khích cao.`;
    }

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setDetailedComments(text);
      } else {
        setDetailedComments('Không thể tạo nhận xét. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error generating AI comment:', error);
      setDetailedComments(`Đã xảy ra lỗi. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate review
  const generateReview = () => {
    const name = studentName || 'học viên';
    const reviewTitle = `--- BÁO CÁO ĐÁNH GIÁ CUỐI CÙNG ---`;
    const salutation = `Chào ${name},\n\nDưới đây là nhận xét chi tiết của thầy/cô về quá trình học tập môn ${studentSubject} của em:\n`;
    const reviewText = `${reviewTitle}\n\n${salutation}${detailedComments}`;
    setReviewOutput(reviewText);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reviewOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      showNotification('Đã sao chép vào clipboard!', 'success');
    } catch (err) {
      showNotification('Lỗi khi sao chép!', 'error');
    }
  };

  // Class management functions
  const saveClasses = (newClasses: ClassData[]) => {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(newClasses));
    setClasses(newClasses);
  };

  const addStudentField = () => {
    setStudents([...students, '']);
  };

  const removeStudentField = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index] = value;
    setStudents(newStudents);
  };

  const toggleSession = (session: number) => {
    if (selectedSessions.includes(session)) {
      setSelectedSessions(selectedSessions.filter(s => s !== session));
    } else {
      setSelectedSessions([...selectedSessions, session]);
    }
  };

  const saveClass = () => {
    if (!className.trim()) {
      showNotification('Vui lòng nhập tên lớp.', 'error');
      return;
    }

    const validStudents = students.filter(s => s.trim());
    if (validStudents.length === 0) {
      showNotification('Vui lòng thêm ít nhất một học viên.', 'error');
      return;
    }

    if (selectedSessions.length === 0) {
      showNotification('Vui lòng chọn ít nhất một buổi học cần nhận xét.', 'error');
      return;
    }

    const slug = className.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const classCode = `${slug}-${Date.now().toString().slice(-6)}`.toUpperCase();

    const newClass: ClassData = {
      name: className.trim(),
      code: classCode,
      subject: classSubject,
      totalSessions,
      students: validStudents,
      feedbackSessions: selectedSessions.sort((a, b) => a - b),
      comments: {},
      created: new Date().toISOString()
    };

    // Initialize comments structure
    selectedSessions.forEach(s => {
      newClass.comments[s] = validStudents.map(() => '');
    });

    if (editingClassIndex !== null) {
      const updatedClasses = [...classes];
      updatedClasses[editingClassIndex] = { ...newClass, code: classes[editingClassIndex].code, created: classes[editingClassIndex].created, updated: new Date().toISOString() };
      saveClasses(updatedClasses);
      showNotification('Đã cập nhật lớp học thành công!', 'success');
    } else {
      saveClasses([...classes, newClass]);
      showNotification('Đã lưu thông tin lớp học thành công!', 'success');
    }

    // Reset form
    setClassName('');
    setClassSubject('VEXcodeGO');
    setTotalSessions(14);
    setStudents(['']);
    setSelectedSessions([]);
    setShowCreateForm(false);
    setEditingClassIndex(null);
  };

  const deleteClass = (index: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${classes[index].name}"?`)) {
      const newClasses = classes.filter((_, i) => i !== index);
      saveClasses(newClasses);
      showNotification('Đã xóa lớp học thành công!', 'success');
    }
  };

  const openClassDetail = (index: number) => {
    setSelectedClassIndex(index);
    const classData = classes[index];
    const comments: { [session: string]: { [studentIndex: number]: string } } = {};
    classData.feedbackSessions.forEach(session => {
      comments[session] = {};
      classData.students.forEach((_, studentIndex) => {
        comments[session][studentIndex] = classData.comments[session]?.[studentIndex] || '';
      });
    });
    setClassComments(comments);
  };

  const saveClassComments = () => {
    if (selectedClassIndex === null) return;

    const updatedClasses = [...classes];
    const classData = updatedClasses[selectedClassIndex];
    
    classData.feedbackSessions.forEach(session => {
      if (!classData.comments[session]) {
        classData.comments[session] = [];
      }
      classData.students.forEach((_, studentIndex) => {
        classData.comments[session][studentIndex] = classComments[session]?.[studentIndex] || '';
      });
    });

    saveClasses(updatedClasses);
    showNotification('Đã lưu nhận xét thành công!', 'success');
  };

  // Auto-save class comments
  const autoSaveClassComments = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (selectedClassIndex === null) return;

      const updatedClasses = [...classes];
      const classData = updatedClasses[selectedClassIndex];
      
      classData.feedbackSessions.forEach(session => {
        if (!classData.comments[session]) {
          classData.comments[session] = [];
        }
        classData.students.forEach((_, studentIndex) => {
          classData.comments[session][studentIndex] = classComments[session]?.[studentIndex] || '';
        });
      });

      saveClasses(updatedClasses);
      // Silent save, không hiện notification để không làm phiền người dùng
    }, 1000); // Debounce 1 giây
  };

  // Calculate scores for class AI modal
  const calculateClassAiScores = () => {
    const attitudeScore = Math.round((classAiScores.attitudeFocus + classAiScores.attitudeQuestion) / 2);
    const assemblyScore = Math.round((classAiScores.assemblySpeed + classAiScores.assemblyAccuracy + classAiScores.assemblyCreativity) / 3);
    const programmingScore = Math.round((classAiScores.programmingMemory + classAiScores.programmingNewKnowledge + classAiScores.programmingCreativity) / 3);
    
    let overallScore;
    if (classAiIncludeTeamwork) {
      overallScore = Math.round((attitudeScore + assemblyScore + programmingScore + classAiScores.teamwork) / 4);
    } else {
      overallScore = Math.round((attitudeScore + assemblyScore + programmingScore) / 3);
    }
    
    return { attitudeScore, assemblyScore, programmingScore, overallScore };
  };

  // Collect previous comments for context
  const collectPreviousComments = () => {
    if (classAiModalState.classIndex === null || classAiModalState.studentIndex === null || classAiModalState.session === null) {
      return [];
    }

    const classData = classes[classAiModalState.classIndex];
    if (!classData || !classData.comments) return [];

    const previousComments: { session: number; comment: string }[] = [];
    const allSessions = Object.keys(classData.comments)
      .map(s => parseInt(s))
      .filter(s => !isNaN(s) && s < classAiModalState.session!)
      .sort((a, b) => a - b);

    allSessions.forEach(session => {
      const sessionComments = classData.comments[session];
      if (sessionComments && sessionComments[classAiModalState.studentIndex!]) {
        const comment = sessionComments[classAiModalState.studentIndex!].trim();
        if (comment) {
          previousComments.push({ session, comment });
        }
      }
    });

    return previousComments;
  };

  // Generate AI comment for class management
  const generateClassAIComment = async () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGeneratingClassAI(true);
    setClassAiResult('Đang tạo nhận xét, vui lòng đợi...');

    const { attitudeScore, assemblyScore, programmingScore } = calculateClassAiScores();
    const name = classAiModalState.studentName || 'học viên';
    const session = classAiModalState.session;
    const subject = classAiSubject || classAiModalState.subject || '';

    let prompt = `Bạn là một giáo viên chuyên môn về giáo dục STEM. Hãy viết một nhận xét chi tiết, thân thiện và mang tính xây dựng về quá trình học tập của một học viên có tên "${name}" trong môn học "${subject}" cho Buổi ${session}.\nNhận xét của bạn PHẢI BẮT ĐẦU TRỰC TIẾP với định dạng sau và KHÔNG ĐƯA VÀO BẤT KỲ LỜI CHÀO hay mở đầu nào khác:\n- Thái độ học tập: (nội dung).\n- Kỹ năng lắp ráp mô hình: (nội dung).\n- Kỹ năng lập trình: (nội dung).\n${classAiIncludeTeamwork ? '- Kỹ năng làm việc nhóm: (nội dung).\n' : ''}- Đề xuất từ giáo viên: (nội dung).\nNội dung trong ngoặc đơn phải được thay thế bằng văn bản nhận xét tương ứng. Hãy sử dụng tên học viên "${name}" ngay trong nội dung nhận xét để tạo cảm giác cá nhân hóa.\n`;

    // Include previous comments context
    const previousComments = collectPreviousComments();
    if (previousComments.length > 0) {
      prompt += `\n=== NGỮ CẢNH TỪ CÁC BUỔI HỌC TRƯỚC ===\n`;
      prompt += `Đây là lịch sử nhận xét của học viên ${name} từ các buổi học trước. Hãy tham khảo để:\n`;
      prompt += `1. Nhận biết xu hướng phát triển/thay đổi của học viên\n`;
      prompt += `2. Đề cập đến sự tiến bộ hoặc những điểm cần cải thiện liên tục\n`;
      prompt += `3. Tạo tính liên kết và nhất quán trong đánh giá\n\n`;
      
      previousComments.forEach(item => {
        prompt += `Buổi ${item.session}: ${item.comment}\n\n`;
      });
      
      prompt += `=== KẾT THÚC NGỮ CẢNH ===\n`;
      prompt += `Dựa vào ngữ cảnh trên, hãy đánh giá và so sánh với buổi ${session} hiện tại. Nếu có tiến bộ rõ rệt, hãy khen ngợi cụ thể. Nếu có vấn đề liên tục, hãy đưa ra lời khuyên phù hợp.\n\n`;
    }

    // Include teacher's note
    if (classAiTeacherNote.trim()) {
      prompt += `\nThông tin bổ sung từ giáo viên: ${classAiTeacherNote}\nHÃY KẾT HỢP NHỮNG GHI CHÚ NÀY VÀ ĐIỀU CHỈNH NHẬN XÉT CUỐI CÙNG THEO NỘI DUNG TRONG GHI CHÚ (KHÔNG CHỈ LÀM LẠI NGUYÊN VĂN GHI CHÚ).\n`;
    }

    prompt += `Nhận xét cần dựa trên các điểm số sau và không lặp lại nguyên văn các câu nhận xét mặc định:\n- Thái độ học tập: Mức độ tập trung: ${classAiScores.attitudeFocus}/10, Chủ động đặt câu hỏi: ${classAiScores.attitudeQuestion}/10\n- Kỹ năng lắp ráp mô hình: Tốc độ: ${classAiScores.assemblySpeed}/10, Độ chính xác: ${classAiScores.assemblyAccuracy}/10, Sáng tạo: ${classAiScores.assemblyCreativity}/10\n- Kỹ năng lập trình: Ghi nhớ kiến thức cũ: ${classAiScores.programmingMemory}/10, Tiếp thu kiến thức mới: ${classAiScores.programmingNewKnowledge}/10, Vận dụng sáng tạo: ${classAiScores.programmingCreativity}/10\n${classAiIncludeTeamwork ? `- Kỹ năng làm việc nhóm: ${classAiScores.teamwork}/10\n` : ''}`;

    if (classAiPromptType === 'positive') {
      prompt += `Nhận xét cần mang tính tích cực và khuyến khích, tập trung vào những điểm mạnh và thành tựu của học viên.`;
    } else if (classAiPromptType === 'improvement') {
      prompt += `Nhận xét cần tập trung vào các điểm cần cải thiện, đồng thời đưa ra những lời khuyên cụ thể và mang tính xây dựng để giúp học viên phát triển hơn.`;
    } else if (classAiPromptType === 'comprehensive') {
      prompt += `Nhận xét cần bao quát toàn bộ các khía cạnh, phân tích sâu về cả điểm mạnh và điểm yếu, đưa ra lời khuyên chi tiết và chuyên sâu.`;
    } else if (classAiPromptType === 'simple') {
      prompt += `Nhận xét cần ngắn gọn, đi thẳng vào vấn đề, dễ hiểu và không quá dài dòng.`;
    } else if (classAiPromptType === 'direct-positive-encouraging') {
      prompt += `Nhận xét cần ngắn gọn, trực tiếp, tập trung vào những điểm tích cực và mang tính khuyến khích cao.`;
    }

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setClassAiResult(text);
      } else {
        setClassAiResult('Không thể tạo nhận xét. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error generating class AI comment:', error);
      setClassAiResult(`Đã xảy ra lỗi. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.`);
    } finally {
      setIsGeneratingClassAI(false);
    }
  };

  // Insert AI comment into textarea
  const insertClassAIComment = () => {
    const aiText = classAiResult.trim();
    const teacherNote = classAiTeacherNote.trim();
    let combined = '';
    
    if (aiText && teacherNote) {
      combined = aiText + '\n\nGhi chú của giáo viên: ' + teacherNote;
    } else if (aiText) {
      combined = aiText;
    } else if (teacherNote) {
      combined = 'Ghi chú của giáo viên: ' + teacherNote;
    }

    if (classAiModalState.classIndex !== null && 
        classAiModalState.session !== null && 
        classAiModalState.studentIndex !== null) {
      const newComments = { ...classComments };
      if (!newComments[classAiModalState.session]) {
        newComments[classAiModalState.session] = {};
      }
      newComments[classAiModalState.session][classAiModalState.studentIndex] = combined;
      setClassComments(newComments);
      setShowClassAiModal(false);
      showNotification('Đã chèn nhận xét AI vào ô!', 'success');
    }
  };

  const { attitudeScore, assemblyScore, programmingScore, overallScore } = calculateScores();

  // Collect student data from all sessions
  const collectStudentData = (classData: any, studentIndex: number) => {
    const studentData = {
      sessions: [] as any[],
      totalSessions: 0,
      averageScores: {
        attitude: 0,
        assembly: 0,
        programming: 0,
        overall: 0
      }
    };

    let totalAttitude = 0, totalAssembly = 0, totalProgramming = 0, totalOverall = 0;
    let sessionCount = 0;

    // Merge data from both classData.comments (saved) and classComments (unsaved)
    const allComments: { [session: string]: string } = {};
    
    // First, get saved comments from classData
    if (classData.comments) {
      Object.keys(classData.comments).forEach(sessionKey => {
        const session = classData.comments[sessionKey];
        if (Array.isArray(session) && session[studentIndex]) {
          allComments[sessionKey] = session[studentIndex];
        }
      });
    }
    
    // Then, override with unsaved comments from classComments state
    // Check if we're viewing the same class that has unsaved comments
    if (selectedClassIndex !== null && selectedClassIndex === classData.index) {
      Object.keys(classComments).forEach(sessionKey => {
        if (classComments[sessionKey] && classComments[sessionKey][studentIndex] !== undefined) {
          const unsavedComment = classComments[sessionKey][studentIndex];
          if (unsavedComment && unsavedComment.trim() !== '') {
            allComments[sessionKey] = unsavedComment;
          }
        }
      });
    }

    // Process all comments
    Object.keys(allComments).forEach(sessionKey => {
      const studentComment = allComments[sessionKey];
      
      if (studentComment && studentComment.trim() !== '') {
        const sessionNumber = sessionKey;
        
        // Parse comment to extract scores (simplified - just use default scores for now)
        const scores = {
          attitude: 5,
          assembly: 5,
          programming: 5,
          overall: 5
        };
        
        // Try to extract scores from comment text
        const commentText = studentComment.toLowerCase();
        if (commentText.includes('xuất sắc') || commentText.includes('rất tốt')) {
          scores.attitude = 9;
          scores.assembly = 9;
          scores.programming = 9;
          scores.overall = 9;
        } else if (commentText.includes('tốt') || commentText.includes('khá')) {
          scores.attitude = 7;
          scores.assembly = 7;
          scores.programming = 7;
          scores.overall = 7;
        } else if (commentText.includes('trung bình')) {
          scores.attitude = 5;
          scores.assembly = 5;
          scores.programming = 5;
          scores.overall = 5;
        }
        
        const sessionData = {
          session: sessionNumber,
          date: 'Chưa có ngày',
          comment: studentComment,
          scores: scores
        };

        studentData.sessions.push(sessionData);
        
        totalAttitude += scores.attitude;
        totalAssembly += scores.assembly;
        totalProgramming += scores.programming;
        totalOverall += scores.overall;
        sessionCount++;
      }
    });

    studentData.totalSessions = studentData.sessions.length;
    
    if (sessionCount > 0) {
      studentData.averageScores.attitude = parseFloat((totalAttitude / sessionCount).toFixed(1));
      studentData.averageScores.assembly = parseFloat((totalAssembly / sessionCount).toFixed(1));
      studentData.averageScores.programming = parseFloat((totalProgramming / sessionCount).toFixed(1));
      studentData.averageScores.overall = parseFloat((totalOverall / sessionCount).toFixed(1));
    }

    studentData.sessions.sort((a, b) => parseInt(a.session) - parseInt(b.session));

    return studentData;
  };

  // Get student detail data
  const getStudentDetailData = () => {
    if (!selectedStudentDetail) return null;
    const classData = classes[selectedStudentDetail.classIndex];
    if (!classData) return null;
    // Add index to classData for comparison
    const classDataWithIndex = { ...classData, index: selectedStudentDetail.classIndex };
    return collectStudentData(classDataWithIndex, selectedStudentDetail.studentIndex);
  };

  const studentDetailData = getStudentDetailData();

  // Print student detail - Optimized version
  const printStudentDetail = () => {
    if (!selectedStudentDetail || !studentDetailData) return;

    const classData = classes[selectedStudentDetail.classIndex];
    if (!classData) return;

    // Escape HTML to prevent XSS
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.', 'error');
      return;
    }

    // Build optimized HTML content for printing
    const studentName = escapeHtml(selectedStudentDetail.studentName);
    const className = escapeHtml(classData.name);
    const subject = escapeHtml(classData.subject || '');
    const createdDate = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo cáo học viên - ${studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 1.2cm 1.5cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
      padding: 0;
      width: 210mm;
      min-height: 297mm;
    }
    .print-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #6366f1;
    }
    .header h1 {
      color: #6366f1;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    .header .info {
      color: #64748b;
      font-size: 9pt;
      margin: 2px 0;
      line-height: 1.4;
    }
    .header .info strong {
      color: #1e293b;
    }
    .stats-section {
      margin-bottom: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 8px;
      text-align: center;
    }
    .stat-card.blue { border-color: #3b82f6; background: #eff6ff; }
    .stat-card.green { border-color: #22c55e; background: #f0fdf4; }
    .stat-card.yellow { border-color: #eab308; background: #fefce8; }
    .stat-card.purple { border-color: #a855f7; background: #faf5ff; }
    .stat-value {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 3px;
      line-height: 1;
    }
    .stat-label {
      font-size: 8pt;
      color: #64748b;
      font-weight: 500;
      line-height: 1.2;
    }
    .overall-score {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin-bottom: 15px;
    }
    .overall-score-value {
      font-size: 32pt;
      font-weight: bold;
      margin-bottom: 5px;
      line-height: 1;
    }
    .overall-score-label {
      font-size: 11pt;
      opacity: 0.95;
    }
    .sessions-section {
      margin-top: 15px;
    }
    .sessions-title {
      font-size: 14pt;
      color: #1e293b;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .session-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .session-header {
      font-size: 11pt;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 8px;
    }
    .session-scores {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .score-item {
      text-align: center;
      padding: 6px 4px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .score-value {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 2px;
      line-height: 1;
    }
    .score-label {
      font-size: 7pt;
      color: #64748b;
      font-weight: 500;
    }
    .score-item.attitude .score-value { color: #22c55e; }
    .score-item.assembly .score-value { color: #eab308; }
    .score-item.programming .score-value { color: #a855f7; }
    .score-item.overall .score-value { color: #6366f1; }
    .comment-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 8px;
      margin-top: 8px;
      white-space: pre-wrap;
      line-height: 1.6;
      color: #1e293b;
      font-size: 9pt;
      min-height: 40px;
      max-height: 120px;
      overflow: hidden;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1.5px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 7pt;
      page-break-inside: avoid;
    }
    .footer p {
      margin: 2px 0;
      line-height: 1.4;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
        width: 210mm;
        min-height: 297mm;
      }
      .print-container {
        padding: 0;
        width: 100%;
      }
      .session-card {
        page-break-inside: avoid;
        break-inside: avoid;
        orphans: 3;
        widows: 3;
      }
      .stats-grid {
        page-break-inside: avoid;
      }
      .overall-score {
        page-break-inside: avoid;
      }
      .header {
        page-break-after: avoid;
      }
      .sessions-title {
        page-break-after: avoid;
      }
      @page {
        size: A4 portrait;
        margin: 1.2cm 1.5cm;
      }
    }
    @media screen {
      body {
        padding: 20px;
        background: #f1f5f9;
        width: auto;
        min-height: auto;
      }
      .print-container {
        background: white;
        padding: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        max-width: 210mm;
        margin: 0 auto;
        min-height: 297mm;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header">
      <h1>📊 Báo Cáo Chi Tiết Học Viên</h1>
      <div class="info"><strong>Học viên:</strong> ${studentName}</div>
      <div class="info"><strong>Lớp:</strong> ${className}</div>
      ${subject ? `<div class="info"><strong>Môn học:</strong> ${subject}</div>` : ''}
    </div>`;

    if (studentDetailData.sessions.length === 0) {
      htmlContent += `
    <div style="text-align: center; padding: 60px 20px;">
      <p style="font-size: 14pt; color: #64748b;">Chưa có dữ liệu nhận xét cho học viên này.</p>
    </div>`;
    } else {
      // Statistics cards
      htmlContent += `
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-value" style="color: #3b82f6;">${studentDetailData.totalSessions}</div>
          <div class="stat-label">Tổng số buổi</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value" style="color: #22c55e;">${studentDetailData.averageScores.attitude}</div>
          <div class="stat-label">Điểm thái độ TB</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-value" style="color: #eab308;">${studentDetailData.averageScores.assembly}</div>
          <div class="stat-label">Điểm lắp ráp TB</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-value" style="color: #a855f7;">${studentDetailData.averageScores.programming}</div>
          <div class="stat-label">Điểm lập trình TB</div>
        </div>
      </div>
      <div class="overall-score">
        <div class="overall-score-value">${studentDetailData.averageScores.overall}</div>
        <div class="overall-score-label">🏆 Điểm Tổng Kết Trung Bình</div>
      </div>
    </div>
    <div class="sessions-section">
      <h2 class="sessions-title">📝 Chi Tiết Từng Buổi Học</h2>`;

      // Session details
      studentDetailData.sessions.forEach((sessionData) => {
        const comment = escapeHtml(sessionData.comment);
        htmlContent += `
      <div class="session-card">
        <div class="session-header">🎯 Buổi ${sessionData.session}</div>
        <div class="session-scores">
          <div class="score-item attitude">
            <div class="score-value">${sessionData.scores.attitude.toFixed(1)}</div>
            <div class="score-label">Thái độ</div>
          </div>
          <div class="score-item assembly">
            <div class="score-value">${sessionData.scores.assembly.toFixed(1)}</div>
            <div class="score-label">Lắp ráp</div>
          </div>
          <div class="score-item programming">
            <div class="score-value">${sessionData.scores.programming.toFixed(1)}</div>
            <div class="score-label">Lập trình</div>
          </div>
          <div class="score-item overall">
            <div class="score-value">${sessionData.scores.overall.toFixed(1)}</div>
            <div class="score-label">Tổng</div>
          </div>
        </div>
        <div class="comment-box">${comment}</div>
      </div>`;
      });

      htmlContent += `
    </div>`;
    }

    htmlContent += `
    <div class="footer">
      <p><strong>Được tạo vào:</strong> ${createdDate}</p>
      <p><strong>Trường học công nghệ MindX</strong></p>
      <p style="margin-top: 8px; font-size: 8pt; opacity: 0.7;">Báo cáo này được tạo tự động từ hệ thống quản lý nhận xét học viên</p>
    </div>
  </div>
</body>
</html>`;

    // Write content
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    };
  };

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
          Nhận Xét Học Viên
        </h1>
        <p className="text-[#cbd5e1] text-lg">
          Đánh giá và quản lý nhận xét cho học viên
        </p>
      </div>

      {/* Tab Navigation */}
      <Card className="glass-card border-white/10">
        <div className="flex gap-2 p-2">
          <button
            onClick={() => setActiveTab('individual')}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
              activeTab === 'individual'
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                : "bg-[rgba(30,41,59,0.6)] text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
            )}
          >
            <MessageSquare className="h-5 w-5 inline mr-2" />
            Nhận Xét Cá Nhân
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
              activeTab === 'class'
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                : "bg-[rgba(30,41,59,0.6)] text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
            )}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Quản Lý Lớp
          </button>
        </div>
      </Card>

      {/* Individual Review Tab */}
      {activeTab === 'individual' && (
        <div className="space-y-6">
          {/* Student Info */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-[#a5b4fc]">Thông tin học viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    Họ và tên học viên
                  </label>
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập tên học viên..."
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    Môn học
                  </label>
                  <Select
                    value={studentSubject}
                    onChange={(e) => setStudentSubject(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="VEXcodeGO">VEXcodeGO</option>
                    <option value="LEGO">LEGO</option>
                    <option value="VEXcodeIQ">VEXcodeIQ</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Attitude */}
            <Card className="glass-card border-white/10 border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-[#a5b4fc]">Thái độ học tập</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Mức độ tập trung:</label>
                  <Select
                    value={scores.attitudeFocus}
                    onChange={(e) => setScores({ ...scores, attitudeFocus: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Chủ động đặt câu hỏi:</label>
                  <Select
                    value={scores.attitudeQuestion}
                    onChange={(e) => setScores({ ...scores, attitudeQuestion: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 text-sm font-medium text-[#cbd5e1]">
                  Điểm thái độ: <span className="text-green-400 font-bold text-lg">{attitudeScore}</span>
                </div>
              </CardContent>
            </Card>

            {/* Assembly */}
            <Card className="glass-card border-white/10 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-[#a5b4fc]">Kỹ năng lắp ráp mô hình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Tốc độ:</label>
                  <Select
                    value={scores.assemblySpeed}
                    onChange={(e) => setScores({ ...scores, assemblySpeed: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Độ chính xác:</label>
                  <Select
                    value={scores.assemblyAccuracy}
                    onChange={(e) => setScores({ ...scores, assemblyAccuracy: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Sáng tạo:</label>
                  <Select
                    value={scores.assemblyCreativity}
                    onChange={(e) => setScores({ ...scores, assemblyCreativity: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 text-sm font-medium text-[#cbd5e1]">
                  Điểm lắp ráp: <span className="text-blue-400 font-bold text-lg">{assemblyScore}</span>
                </div>
              </CardContent>
            </Card>

            {/* Programming */}
            <Card className="glass-card border-white/10 border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-[#a5b4fc]">Kỹ năng lập trình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Ghi nhớ kiến thức cũ:</label>
                  <Select
                    value={scores.programmingMemory}
                    onChange={(e) => setScores({ ...scores, programmingMemory: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Tiếp thu kiến thức mới:</label>
                  <Select
                    value={scores.programmingNewKnowledge}
                    onChange={(e) => setScores({ ...scores, programmingNewKnowledge: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cbd5e1]">Vận dụng sáng tạo:</label>
                  <Select
                    value={scores.programmingCreativity}
                    onChange={(e) => setScores({ ...scores, programmingCreativity: parseInt(e.target.value) })}
                    className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                      <option key={score} value={score}>
                        {score}/10 - {COMMENTS_BY_SCORE[score]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 text-sm font-medium text-[#cbd5e1]">
                  Điểm lập trình: <span className="text-purple-400 font-bold text-lg">{programmingScore}</span>
                </div>
              </CardContent>
            </Card>

            {/* Teamwork */}
            <Card className={cn(
              "glass-card border-white/10 border-l-4 transition-all",
              includeTeamwork ? "border-l-yellow-500" : "border-l-gray-500 opacity-60"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#a5b4fc]">Kỹ năng làm việc nhóm</CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTeamwork}
                      onChange={(e) => setIncludeTeamwork(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-[rgba(15,23,42,0.6)] text-indigo-600 focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-sm text-[#cbd5e1]">
                      {includeTeamwork ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </label>
                </div>
              </CardHeader>
              {includeTeamwork && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[#cbd5e1]">Thái độ làm việc nhóm:</label>
                    <Select
                      value={scores.teamwork}
                      onChange={(e) => setScores({ ...scores, teamwork: parseInt(e.target.value) })}
                      className="w-32 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                        <option key={score} value={score}>
                          {score}/10 - {COMMENTS_BY_SCORE[score]}
                        </option>
                      ))}
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Score Summary */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-[#a5b4fc]">Kết quả đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500/20 p-4 rounded-lg text-center border border-green-500/30">
                  <p className="text-sm text-[#cbd5e1]">Điểm thái độ</p>
                  <p className="text-2xl font-bold text-green-400">{attitudeScore}</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg text-center border border-blue-500/30">
                  <p className="text-sm text-[#cbd5e1]">Điểm lắp ráp</p>
                  <p className="text-2xl font-bold text-blue-400">{assemblyScore}</p>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-lg text-center border border-purple-500/30">
                  <p className="text-sm text-[#cbd5e1]">Điểm lập trình</p>
                  <p className="text-2xl font-bold text-purple-400">{programmingScore}</p>
                </div>
                <div className="bg-yellow-500/20 p-4 rounded-lg text-center border border-yellow-500/30">
                  <p className="text-sm text-[#cbd5e1]">Điểm tổng</p>
                  <p className="text-2xl font-bold text-yellow-400">{overallScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Comment Section */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-[#a5b4fc] flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Nhận xét AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    Lựa chọn Prompt AI
                  </label>
                  <Select
                    value={aiPromptType}
                    onChange={(e) => setAiPromptType(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="positive">Tích cực, đầy đủ</option>
                    <option value="improvement">Tập trung cải thiện</option>
                    <option value="comprehensive">Toàn diện, chuyên sâu</option>
                    <option value="simple">Ngắn gọn, đơn giản</option>
                    <option value="direct-positive-encouraging">Trực tiếp, tích cực, khuyến khích</option>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowApiKeyModal(true)}
                    variant="outline"
                    className="bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    API Key
                  </Button>
                  <Button
                    onClick={generateAIComment}
                    disabled={isGeneratingAI}
                    className="bg-gradient-to-r from-emerald-400 to-lime-500 hover:from-emerald-500 hover:to-lime-600 text-white"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Đề xuất Nhận xét AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  Nhận xét chi tiết từ AI
                </label>
                <textarea
                  value={detailedComments}
                  onChange={(e) => setDetailedComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[rgba(15,23,42,0.6)] text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhận xét từ AI sẽ hiển thị ở đây..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Final Review */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-[#a5b4fc]">Báo cáo đánh giá cuối cùng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={reviewOutput}
                onChange={(e) => setReviewOutput(e.target.value)}
                rows={8}
                readOnly
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[rgba(15,23,42,0.6)] text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:outline-none"
                placeholder="Báo cáo đánh giá hoàn chỉnh sẽ hiển thị ở đây..."
              />
              <div className="flex gap-2">
                <Button
                  onClick={generateReview}
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white"
                >
                  Tạo Nhận Xét
                </Button>
                <Button
                  onClick={copyToClipboard}
                  disabled={!reviewOutput}
                  variant="outline"
                  className="bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)] disabled:opacity-50"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Sao Chép Nhận Xét
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Class Management Tab */}
      {activeTab === 'class' && (
        <div className="space-y-6">
          {selectedClassIndex === null ? (
            <>
              {/* Class List */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#a5b4fc]">Danh Sách Lớp Học</h2>
                <Button
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingClassIndex(null);
                    setClassName('');
                    setClassSubject('VEXcodeGO');
                    setTotalSessions(14);
                    setStudents(['']);
                    setSelectedSessions([]);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Tạo Mã Lớp Mới
                </Button>
              </div>

              {!showCreateForm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-[#cbd5e1]/50 mb-4" />
                      <p className="text-[#cbd5e1]">Chưa có lớp nào được tạo</p>
                      <p className="text-sm text-[#cbd5e1]/70 mt-2">Bắt đầu bằng cách tạo mã lớp học mới.</p>
                    </div>
                  ) : (
                    classes.map((classData, index) => (
                      <Card key={index} className="glass-card border-white/10">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-[#a5b4fc]">{classData.name}</CardTitle>
                              <p className="text-sm text-[#cbd5e1] mt-1">Mã lớp: {classData.code}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                              {classData.subject}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm text-[#cbd5e1]">
                              <span>{classData.students.length} học viên</span>
                              <span>{classData.feedbackSessions.length}/{classData.totalSessions} buổi nhận xét</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => openClassDetail(index)}
                                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                              >
                                Xem chi tiết
                              </Button>
                              <Button
                                onClick={() => deleteClass(index)}
                                variant="outline"
                                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                /* Create/Edit Class Form */
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-[#a5b4fc]">
                      {editingClassIndex !== null ? 'Chỉnh sửa lớp học' : 'Tạo Mã Lớp Học Mới'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                          Tên Lớp
                        </label>
                        <Input
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          placeholder="VD: VEX IQ K12"
                          className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                          Môn Học
                        </label>
                        <Select
                          value={classSubject}
                          onChange={(e) => setClassSubject(e.target.value)}
                          className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                        >
                          <option value="VEXcodeGO">VEXcodeGO</option>
                          <option value="LEGO">LEGO</option>
                          <option value="VEXcodeIQ">VEXcodeIQ</option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                          Tổng Số Buổi Học
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={totalSessions}
                          onChange={(e) => setTotalSessions(parseInt(e.target.value) || 14)}
                          className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-[#cbd5e1]">
                          Danh Sách Học Viên
                        </label>
                        <Button
                          onClick={addStudentField}
                          size="sm"
                          className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                        >
                          Thêm Học Viên
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {students.map((student, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={student}
                              onChange={(e) => updateStudent(index, e.target.value)}
                              placeholder="Tên học viên"
                              className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                            />
                            {students.length > 1 && (
                              <Button
                                onClick={() => removeStudentField(index)}
                                variant="outline"
                                size="sm"
                                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                              >
                                Xóa
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#cbd5e1] mb-4">
                        Buổi Học Cần Nhận Xét
                      </label>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {Array.from({ length: totalSessions }, (_, i) => i + 1).map(session => (
                          <button
                            key={session}
                            onClick={() => toggleSession(session)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                              selectedSessions.includes(session)
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                : session === 4 || session === 8
                                ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                                : session === 13
                                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                                : "bg-[rgba(30,41,59,0.6)] text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)] border border-white/10"
                            )}
                          >
                            Buổi {session}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#cbd5e1]/70 mt-2">
                        💡 Gợi ý: Buổi 4, 8: Checkpoint • Buổi 13: Tổng hợp
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingClassIndex(null);
                        }}
                        variant="outline"
                        className="flex-1 bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={saveClass}
                        className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white"
                      >
                        {editingClassIndex !== null ? 'Cập nhật' : 'Lưu Thông Tin Lớp'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Class Detail View */
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#a5b4fc]">
                    Chi tiết lớp: {classes[selectedClassIndex]?.name}
                  </CardTitle>
                  <Button
                    onClick={() => setSelectedClassIndex(null)}
                    variant="outline"
                    className="bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                  >
                    Quay lại
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[rgba(15,23,42,0.8)] border-b border-white/10">
                        <th className="p-3 text-left text-xs font-semibold text-[#a5b4fc] uppercase sticky left-0 bg-[rgba(15,23,42,0.8)]">
                          Học viên
                        </th>
                        {classes[selectedClassIndex]?.feedbackSessions.map(session => (
                          <th key={session} className="p-3 text-center text-xs font-semibold text-[#a5b4fc] uppercase min-w-[300px]">
                            Buổi {session}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classes[selectedClassIndex]?.students.map((student, studentIndex) => (
                        <tr key={studentIndex} className="border-b border-white/10">
                          <td className="p-3 text-sm font-medium text-[#f8fafc] sticky left-0 bg-[rgba(15,23,42,0.6)]">
                            <div className="space-y-2">
                              <div className="font-semibold">{student}</div>
                              <Button
                                onClick={() => {
                                  setSelectedStudentDetail({
                                    classIndex: selectedClassIndex!,
                                    studentIndex,
                                    studentName: student
                                  });
                                  setShowStudentDetailModal(true);
                                }}
                                size="sm"
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs"
                              >
                                👤 Xem chi tiết học viên
                              </Button>
                            </div>
                          </td>
                          {classes[selectedClassIndex]?.feedbackSessions.map(session => (
                            <td key={session} className="p-3">
                              <div className="space-y-2">
                                <textarea
                                  value={classComments[session]?.[studentIndex] || ''}
                                  onChange={(e) => {
                                    const newComments = { ...classComments };
                                    if (!newComments[session]) newComments[session] = {};
                                    newComments[session][studentIndex] = e.target.value;
                                    setClassComments(newComments);
                                    // Auto-save after debounce
                                    autoSaveClassComments();
                                  }}
                                  rows={4}
                                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[rgba(15,23,42,0.6)] text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Nhập nhận xét..."
                                  ref={(el) => {
                                    if (el) {
                                      // Store reference for AI modal
                                    }
                                  }}
                                />
                                <Button
                                  onClick={() => {
                                    if (!apiKey) {
                                      setShowApiKeyModal(true);
                                      return;
                                    }
                                    const classData = classes[selectedClassIndex!];
                                    // Reset AI modal state
                                    setClassAiScores({
                                      attitudeFocus: 5,
                                      attitudeQuestion: 5,
                                      assemblySpeed: 5,
                                      assemblyAccuracy: 5,
                                      assemblyCreativity: 5,
                                      programmingMemory: 5,
                                      programmingNewKnowledge: 5,
                                      programmingCreativity: 5,
                                      teamwork: 5
                                    });
                                    setClassAiPromptType('simple');
                                    setClassAiSubject(classData.subject);
                                    setClassAiTeacherNote('');
                                    setClassAiResult('');
                                    setClassAiIncludeTeamwork(true);
                                    
                                    setClassAiModalState({
                                      classIndex: selectedClassIndex!,
                                      session,
                                      studentIndex,
                                      studentName: student,
                                      subject: classData.subject,
                                      targetTextarea: null
                                    });
                                    setShowClassAiModal(true);
                                  }}
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Nhận xét bằng AI
                                </Button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={saveClassComments}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    Lưu nhận xét
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Chỉ cho đóng khi đã có API key (click outside)
            if (e.target === e.currentTarget && hasApiKey) {
              setShowApiKeyModal(false);
              setApiKeyTestResult(null);
            }
          }}
        >
          <Card 
            className="glass-card border-white/10 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-[#a5b4fc]">
                {hasApiKey ? 'Nhập API Key' : '⚠️ Cần Nhập API Key'}
              </CardTitle>
              {!hasApiKey && (
                <p className="text-sm text-[#cbd5e1] mt-2">
                  Bạn cần nhập API key để sử dụng tính năng AI. Vui lòng nhập API key để tiếp tục.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#cbd5e1]">
                Để sử dụng tính năng AI, bạn cần nhập API key của Google Gemini.
              </p>
              <p className="text-sm text-[#cbd5e1]">
                Nếu chưa có API key, bạn có thể lấy tại:{' '}
                <a
                  href="https://aistudio.google.com/apikey?hl=vi"
                  target="_blank"
                  rel="noopener"
                  className="text-indigo-400 underline"
                >
                  https://aistudio.google.com/apikey?hl=vi
                </a>
              </p>
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  API Key <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setApiKeyTestResult(null); // Reset test result when input changes
                  }}
                  placeholder="Nhập API key của bạn..."
                  className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                  autoFocus
                />
              </div>

              {/* Test Result */}
              {apiKeyTestResult && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    apiKeyTestResult.success
                      ? "bg-green-500/20 border border-green-500/30 text-green-400"
                      : "bg-red-500/20 border border-red-500/30 text-red-400"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {apiKeyTestResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span>{apiKeyTestResult.message}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {hasApiKey && (
                  <Button
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setApiKeyTestResult(null);
                    }}
                    variant="outline"
                    className="flex-1 bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                  >
                    Bỏ qua
                  </Button>
                )}
                <Button
                  onClick={testApiKey}
                  disabled={isTestingApiKey || !apiKeyInput.trim()}
                  variant="outline"
                  className={cn(
                    "bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)] disabled:opacity-50",
                    hasApiKey ? "" : "flex-1"
                  )}
                >
                  {isTestingApiKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    'Kiểm tra'
                  )}
                </Button>
                <Button
                  onClick={saveApiKey}
                  disabled={apiKeyTestResult !== null && !apiKeyTestResult.success}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lưu API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Class AI Modal */}
      {showClassAiModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClassAiModal(false);
            }
          }}
        >
          <Card 
            className="glass-card border-white/10 max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#a5b4fc] flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Nhận xét bằng AI
                </CardTitle>
                <Button
                  onClick={() => setShowClassAiModal(false)}
                  variant="outline"
                  size="sm"
                  className="bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-[#cbd5e1] mt-2">
                Tạo nhận xét cho {classAiModalState.studentName} - Buổi {classAiModalState.session}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    Lựa chọn Prompt AI
                  </label>
                  <Select
                    value={classAiPromptType}
                    onChange={(e) => setClassAiPromptType(e.target.value)}
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc]"
                  >
                    <option value="positive">Tích cực, đầy đủ</option>
                    <option value="improvement">Tập trung cải thiện</option>
                    <option value="comprehensive">Toàn diện, chuyên sâu</option>
                    <option value="simple">Ngắn gọn, đơn giản</option>
                    <option value="direct-positive-encouraging">Trực tiếp, tích cực, khuyến khích</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                    Môn học (tùy chọn)
                  </label>
                  <Input
                    value={classAiSubject}
                    onChange={(e) => setClassAiSubject(e.target.value)}
                    placeholder="Môn học (VD: VEXcodeGO)"
                    className="bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] placeholder:text-[#cbd5e1]/50"
                  />
                </div>
              </div>

              {/* Scoring Sections */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Attitude */}
                <Card className="glass-card border-white/10 border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-[#a5b4fc] text-base">Thái độ học tập</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Mức độ tập trung</label>
                      <Select
                        value={classAiScores.attitudeFocus}
                        onChange={(e) => setClassAiScores({ ...classAiScores, attitudeFocus: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Chủ động đặt câu hỏi</label>
                      <Select
                        value={classAiScores.attitudeQuestion}
                        onChange={(e) => setClassAiScores({ ...classAiScores, attitudeQuestion: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="text-sm font-medium text-[#cbd5e1]">
                      Điểm thái độ: <span className="text-green-400 font-bold">{calculateClassAiScores().attitudeScore}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Assembly */}
                <Card className="glass-card border-white/10 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-[#a5b4fc] text-base">Kỹ năng lắp ráp mô hình</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Tốc độ</label>
                      <Select
                        value={classAiScores.assemblySpeed}
                        onChange={(e) => setClassAiScores({ ...classAiScores, assemblySpeed: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Độ chính xác</label>
                      <Select
                        value={classAiScores.assemblyAccuracy}
                        onChange={(e) => setClassAiScores({ ...classAiScores, assemblyAccuracy: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Sáng tạo</label>
                      <Select
                        value={classAiScores.assemblyCreativity}
                        onChange={(e) => setClassAiScores({ ...classAiScores, assemblyCreativity: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="text-sm font-medium text-[#cbd5e1]">
                      Điểm lắp ráp: <span className="text-blue-400 font-bold">{calculateClassAiScores().assemblyScore}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Programming */}
                <Card className="glass-card border-white/10 border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="text-[#a5b4fc] text-base">Kỹ năng lập trình</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Ghi nhớ kiến thức cũ</label>
                      <Select
                        value={classAiScores.programmingMemory}
                        onChange={(e) => setClassAiScores({ ...classAiScores, programmingMemory: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Tiếp thu kiến thức mới</label>
                      <Select
                        value={classAiScores.programmingNewKnowledge}
                        onChange={(e) => setClassAiScores({ ...classAiScores, programmingNewKnowledge: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-[#cbd5e1]">Vận dụng sáng tạo</label>
                      <Select
                        value={classAiScores.programmingCreativity}
                        onChange={(e) => setClassAiScores({ ...classAiScores, programmingCreativity: parseInt(e.target.value) })}
                        className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                          <option key={score} value={score}>
                            {score}/10 - {COMMENTS_BY_SCORE[score]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="text-sm font-medium text-[#cbd5e1]">
                      Điểm lập trình: <span className="text-purple-400 font-bold">{calculateClassAiScores().programmingScore}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Teamwork */}
                <Card className={cn(
                  "glass-card border-white/10 border-l-4 transition-all",
                  classAiIncludeTeamwork ? "border-l-yellow-500" : "border-l-gray-500 opacity-60"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#a5b4fc] text-base">Kỹ năng làm việc nhóm</CardTitle>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={classAiIncludeTeamwork}
                          onChange={(e) => setClassAiIncludeTeamwork(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-[rgba(15,23,42,0.6)] text-indigo-600 focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="text-xs text-[#cbd5e1]">
                          {classAiIncludeTeamwork ? 'Bật' : 'Tắt'}
                        </span>
                      </label>
                    </div>
                  </CardHeader>
                  {classAiIncludeTeamwork && (
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-[#cbd5e1]">Thái độ làm việc nhóm</label>
                        <Select
                          value={classAiScores.teamwork}
                          onChange={(e) => setClassAiScores({ ...classAiScores, teamwork: parseInt(e.target.value) })}
                          className="w-28 bg-[rgba(15,23,42,0.6)] border-white/10 text-[#f8fafc] text-sm"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map(score => (
                            <option key={score} value={score}>
                              {score}/10 - {COMMENTS_BY_SCORE[score]}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="text-sm font-medium text-[#cbd5e1]">
                        Điểm tổng: <span className="text-yellow-400 font-bold">{calculateClassAiScores().overallScore}</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Teacher Note */}
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  Ghi chú / Điều chỉnh của giáo viên (tùy chọn)
                </label>
                <textarea
                  value={classAiTeacherNote}
                  onChange={(e) => setClassAiTeacherNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[rgba(15,23,42,0.6)] text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập ghi chú hoặc chỉnh sửa của giáo viên trước khi tạo nhận xét AI..."
                />
              </div>

              {/* Previous Comments Context */}
              {collectPreviousComments().length > 0 && (
                <Card className="glass-card border-white/10 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-[#a5b4fc] text-base flex items-center gap-2">
                      📚 Ngữ cảnh từ các buổi học trước
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#cbd5e1] mb-3 italic">
                      AI sẽ sử dụng thông tin này để tạo nhận xét có ngữ cảnh và phù hợp với quá trình học tập.
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-[rgba(15,23,42,0.4)] rounded-lg p-3">
                      {collectPreviousComments().map((item, idx) => (
                        <div key={idx} className="text-sm text-[#cbd5e1] border-l-2 border-blue-500/50 pl-2">
                          <span className="font-semibold text-blue-400">Buổi {item.session}:</span>
                          <p className="text-xs mt-1">{item.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Result */}
              <div>
                <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
                  Nhận xét chi tiết từ AI
                </label>
                <textarea
                  value={classAiResult}
                  onChange={(e) => setClassAiResult(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[rgba(15,23,42,0.6)] text-[#f8fafc] placeholder:text-[#cbd5e1]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Kết quả nhận xét sẽ hiển thị ở đây..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={insertClassAIComment}
                  disabled={!classAiResult.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50"
                >
                  Chèn vào ô
                </Button>
                <Button
                  onClick={generateClassAIComment}
                  disabled={isGeneratingClassAI}
                  className="bg-gradient-to-r from-emerald-400 to-lime-500 hover:from-emerald-500 hover:to-lime-600 text-white"
                >
                  {isGeneratingClassAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Tạo nhận xét AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Detail Modal */}
      {showStudentDetailModal && selectedStudentDetail && studentDetailData && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStudentDetailModal(false);
            }
          }}
        >
          <Card 
            className="glass-card border-white/10 max-w-5xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[#a5b4fc] text-2xl flex items-center gap-2">
                    📊 Chi tiết học viên
                  </CardTitle>
                  <p className="text-sm text-[#cbd5e1] mt-2">
                    Lớp: {classes[selectedStudentDetail.classIndex]?.name} | Học viên: {selectedStudentDetail.studentName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={printStudentDetail}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    In thông tin
                  </Button>
                  <Button
                    onClick={() => setShowStudentDetailModal(false)}
                    size="sm"
                    className="bg-[rgba(30,41,59,0.6)] border-white/10 text-[#cbd5e1] hover:bg-[rgba(30,41,59,0.8)]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
              {studentDetailData.sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl text-[#cbd5e1] mb-2">Chưa có dữ liệu</h3>
                  <p className="text-[#94a3b8]">Học viên này chưa có nhận xét nào được ghi nhận.</p>
                </div>
              ) : (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="glass-card border-white/10 border-l-4 border-l-blue-500">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{studentDetailData.totalSessions}</div>
                        <div className="text-sm text-[#cbd5e1] mt-1">Tổng số buổi</div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-white/10 border-l-4 border-l-green-500">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{studentDetailData.averageScores.attitude}</div>
                        <div className="text-sm text-[#cbd5e1] mt-1">Điểm thái độ TB</div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-white/10 border-l-4 border-l-yellow-500">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{studentDetailData.averageScores.assembly}</div>
                        <div className="text-sm text-[#cbd5e1] mt-1">Điểm lắp ráp TB</div>
                      </CardContent>
                    </Card>
                    <Card className="glass-card border-white/10 border-l-4 border-l-purple-500">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{studentDetailData.averageScores.programming}</div>
                        <div className="text-sm text-[#cbd5e1] mt-1">Điểm lập trình TB</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Score */}
                  <Card className="glass-card border-white/10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-[#a5b4fc] mb-2">{studentDetailData.averageScores.overall}</div>
                      <div className="text-lg text-[#cbd5e1]">🏆 Điểm tổng kết trung bình</div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress Chart */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-[#a5b4fc] text-lg">📈 Tiến độ qua các buổi</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: '300px' }}>
                          <Line
                            data={{
                              labels: studentDetailData.sessions.map(s => `Buổi ${s.session}`),
                              datasets: [
                                {
                                  label: '🎯 Thái độ',
                                  data: studentDetailData.sessions.map(s => s.scores.attitude),
                                  borderColor: 'rgb(34, 197, 94)',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  borderWidth: 3,
                                  tension: 0.4,
                                },
                                {
                                  label: '🔧 Lắp ráp',
                                  data: studentDetailData.sessions.map(s => s.scores.assembly),
                                  borderColor: 'rgb(234, 179, 8)',
                                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                  borderWidth: 3,
                                  tension: 0.4,
                                },
                                {
                                  label: '💻 Lập trình',
                                  data: studentDetailData.sessions.map(s => s.scores.programming),
                                  borderColor: 'rgb(147, 51, 234)',
                                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                  borderWidth: 3,
                                  tension: 0.4,
                                },
                                {
                                  label: '🏆 Điểm tổng',
                                  data: studentDetailData.sessions.map(s => s.scores.overall),
                                  borderColor: 'rgb(99, 102, 241)',
                                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                  borderWidth: 4,
                                  tension: 0.4,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  labels: {
                                    color: '#cbd5e1',
                                  },
                                },
                              },
                              scales: {
                                y: {
                                  min: 0,
                                  max: 10,
                                  ticks: {
                                    color: '#94a3b8',
                                  },
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)',
                                  },
                                },
                                x: {
                                  ticks: {
                                    color: '#94a3b8',
                                  },
                                  grid: {
                                    color: 'rgba(255, 255, 255, 0.1)',
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Distribution Chart */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-[#a5b4fc] text-lg">🎯 Phân bổ điểm trung bình</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div style={{ height: '300px' }}>
                          <Doughnut
                            data={{
                              labels: ['🎯 Thái độ', '🔧 Lắp ráp', '💻 Lập trình'],
                              datasets: [{
                                data: [
                                  studentDetailData.averageScores.attitude,
                                  studentDetailData.averageScores.assembly,
                                  studentDetailData.averageScores.programming,
                                ],
                                backgroundColor: [
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(234, 179, 8, 0.8)',
                                  'rgba(147, 51, 234, 0.8)',
                                ],
                                borderColor: [
                                  'rgb(34, 197, 94)',
                                  'rgb(234, 179, 8)',
                                  'rgb(147, 51, 234)',
                                ],
                                borderWidth: 3,
                              }],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    color: '#cbd5e1',
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#a5b4fc]">📝 Chi tiết từng buổi học</h3>
                    {studentDetailData.sessions.map((sessionData, idx) => (
                      <Card key={idx} className="glass-card border-white/10">
                        <CardHeader>
                          <CardTitle className="text-[#a5b4fc] text-base">
                            🎯 Buổi {sessionData.session}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-400">{sessionData.scores.attitude.toFixed(1)}</div>
                              <div className="text-xs text-[#cbd5e1]">Thái độ</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-400">{sessionData.scores.assembly.toFixed(1)}</div>
                              <div className="text-xs text-[#cbd5e1]">Lắp ráp</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-400">{sessionData.scores.programming.toFixed(1)}</div>
                              <div className="text-xs text-[#cbd5e1]">Lập trình</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-400">{sessionData.scores.overall.toFixed(1)}</div>
                              <div className="text-xs text-[#cbd5e1]">Tổng</div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-[rgba(15,23,42,0.4)] rounded-lg">
                            <p className="text-sm text-[#cbd5e1] whitespace-pre-line">{sessionData.comment}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
