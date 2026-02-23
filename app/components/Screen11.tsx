'use client';

import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronDown, ChevronUp,
    ClipboardCheck,
    DollarSign,
    ExternalLink, FileText,
    PlayCircle,
    Star,
    Users, Video,
} from 'lucide-react';
import { useState } from 'react';

// ─── NavBtn — nút điều hướng tới màn hình khác trong app ────────────────────
function NavBtn({ screen, label, onNavigate }: { screen: string; label: string; onNavigate?: (s: string) => void }) {
    if (!onNavigate) return null;
    return (
        <button onClick={() => onNavigate(screen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/35 transition-colors">
            <PlayCircle className="w-3.5 h-3.5" />
            {label}
        </button>
    );
}

// ─── Resource Card (Link dạng card) ──────────────────────────────────────────
type RC = { href: string; icon: React.ElementType; label: string; desc?: string; color?: string };
function ResourceCard({ href, icon: Icon, label, desc, color = 'blue' }: RC) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/15',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/15',
        violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/15',
        slate: 'bg-slate-500/10 border-slate-500/20 text-slate-300 hover:bg-slate-500/15',
    };
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${colors[color]}`}>
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-sm font-semibold leading-tight">{label}</p>
                {desc && <p className="text-xs opacity-70 mt-0.5 leading-relaxed">{desc}</p>}
            </div>
            <ExternalLink className="w-3 h-3 ml-auto mt-0.5 flex-shrink-0 opacity-50" />
        </a>
    );
}

// ─── Callout ─────────────────────────────────────────────────────────────────
function Callout({ icon, text, color = 'amber' }: { icon: string; text: string; color?: string }) {
    const c: Record<string, string> = {
        amber: 'bg-amber-500/10 border-amber-500/25 text-amber-200',
        blue: 'bg-blue-500/10 border-blue-500/25 text-blue-200',
        emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200',
    };
    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${c[color]}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="text-sm leading-relaxed">{text}</p>
        </div>
    );
}

// ─── Step Item ───────────────────────────────────────────────────────────────
function Step({ n, title, children, last = false }: { n: number; title: string; children: React.ReactNode; last?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{n}</div>
                {!last && <div className="w-px flex-1 bg-white/10 my-1" />}
            </div>
            <div className="pb-6 flex-1">
                <p className="font-bold text-white text-base mb-2 leading-tight">{title}</p>
                <div className="space-y-3">{children}</div>
            </div>
        </div>
    );
}

// ─── Checklist ───────────────────────────────────────────────────────────────
function Check({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2">
            {items.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    );
}

// ─── Collapsible Rubric Table — responsive ────────────────────────────────────
type RubricRow = { criterion: string; s5: string; s4: string; s3: string; s2: string; s1: string };
const SCORE_META = [
    { key: 's5', label: '5⭑', cls: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 's4', label: '4⭑', cls: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { key: 's3', label: '3⭑', cls: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { key: 's2', label: '2⭑', cls: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { key: 's1', label: '1⭑', cls: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
] as const;

function RubricTable({ groupLabel, color, rows }: { groupLabel: string; color: string; rows: RubricRow[] }) {
    const [open, setOpen] = useState(false);
    const labelCls: Record<string, string> = {
        indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400',
    };
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left">
                <span className={`text-xs font-bold uppercase tracking-wider ${labelCls[color] ?? 'text-slate-400'}`}>{groupLabel}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                    {rows.length} tiêu chí
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
            </button>
            {open && (
                <>
                    {/* Mobile: card per criterion */}
                    <div className="md:hidden divide-y divide-white/5 border-t border-white/10">
                        {rows.map((r, i) => (
                            <div key={i} className="p-3 space-y-1.5">
                                <p className="text-white text-sm font-semibold mb-2">{r.criterion}</p>
                                {SCORE_META.map(({ key, label, cls, bg }) => (
                                    <div key={key} className={`flex gap-2.5 rounded-lg border px-2.5 py-1.5 ${bg}`}>
                                        <span className={`text-xs font-bold flex-shrink-0 w-6 ${cls}`}>{label}</span>
                                        <span className="text-xs text-slate-300 leading-relaxed">{r[key]}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* Desktop: table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-t border-white/10 bg-white/[0.03]">
                                    <th className="text-left px-4 py-2 text-slate-400 font-semibold w-1/4">Tiêu chí</th>
                                    {SCORE_META.map(({ label, cls }) => (
                                        <th key={label} className={`px-3 py-2 font-bold text-center ${cls}`}>{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} className="border-t border-white/5 even:bg-white/[0.02]">
                                        <td className="px-4 py-2.5 text-white font-medium align-top leading-tight">{r.criterion}</td>
                                        {SCORE_META.map(({ key }) => (
                                            <td key={key} className="px-3 py-2.5 text-slate-400 align-top leading-relaxed">{r[key]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Rubric Data ─────────────────────────────────────────────────────────────
const RUBRIC_10: RubricRow[] = [
    { criterion: 'Tác phong', s5: 'Chỉnh chu, sư phạm, tự tin, ngôn ngữ cơ thể tốt', s4: 'Chỉnh chu, tự tin truyền đạt', s3: 'Nghiêm túc nhưng còn lúng túng', s2: 'Tác phong tạm, chưa lưu loát', s1: 'Luộm thuộm, thiếu tự tin' },
    { criterion: 'Chuyên môn', s5: 'Nắm đầu ra tất cả lộ trình, yếu tố cốt lõi từng môn', s4: 'Linh hoạt, bổ sung kịch bản, nắm đầu ra tổng quan', s3: 'Nắm cơ bản, giải thích được khi HS hỏi', s2: 'Dạy theo kịch bản, chưa giải thích thêm', s1: 'Chưa nắm kiến thức chuyên môn' },
    { criterion: 'Kế hoạch giảng', s5: 'Xuất sắc, sáng tạo, linh hoạt theo nhu cầu HS', s4: 'Chuẩn bị kỹ, bổ sung yếu tố mới', s3: 'Chạy theo giáo án, chưa mở rộng', s2: 'Xem qua kịch bản nhưng chưa nhớ bài', s1: 'Chưa chuẩn bị gì' },
    { criterion: 'Quản lý thời gian', s5: 'Hiệu quả, linh hoạt ứng biến tình huống', s4: 'Phân bổ hợp lý, điều chỉnh được', s3: 'Phân bổ cơ bản, khó điều chỉnh', s2: 'Cố gắng nhưng bị lệch kế hoạch', s1: 'Không phân bổ được' },
    { criterion: 'Hoạt động giảng', s5: 'Sáng tạo, HS tích cực tham gia', s4: 'Phù hợp nội dung & độ tuổi, không khí sôi nổi', s3: 'Cơ bản, chưa tạo tương tác tốt', s2: 'Áp dụng nhưng không phù hợp', s1: 'Không tạo được không khí học tập' },
    { criterion: 'Đặt câu hỏi', s5: 'Linh hoạt, dẫn dắt HS suy nghĩ sâu', s4: 'Dùng tốt câu hỏi đóng & mở', s3: 'Cơ bản, HS chưa hiểu rõ mục đích', s2: 'Ít câu hỏi, chủ yếu câu đóng', s1: 'Không dùng hoặc không liên quan' },
    { criterion: 'Công cụ & thiết bị', s5: 'Linh hoạt nhiều công cụ, kết hợp tốt', s4: 'Thành thạo, thao tác nhanh', s3: 'Dùng được cơ bản, chưa nhanh', s2: 'Dùng chậm, gặp khó khăn', s1: 'Không sử dụng được' },
    { criterion: 'Giao tiếp', s5: 'Linh hoạt, chuyên nghiệp với cả PH', s4: 'Hiệu quả, tương tác tốt', s3: 'Giao tiếp được nhưng chưa sâu', s2: 'Đơn điệu, một chiều', s1: 'Lắp bắp, thiếu tự tin' },
    { criterion: 'Định hướng học tập', s5: 'Chi tiết, linh hoạt theo từng cá nhân & PH', s4: 'Rõ ràng, phù hợp độ tuổi và nhu cầu HS', s3: 'Định hướng được nhưng chưa linh hoạt', s2: 'Chung chung, chưa bám độ tuổi', s1: 'Không định hướng, chưa nắm độ tuổi' },
    { criterion: 'Xử lý tình huống', s5: 'Khéo léo, biến tình huống thành cơ hội', s4: 'Xử lý tốt, không gián đoạn lớp', s3: 'Xử lý được nhưng chưa thuyết phục', s2: 'Lúng túng, gây gián đoạn', s1: 'Mất kiểm soát, không xử lý được' },
];

const RUBRIC_A: RubricRow[] = [
    { criterion: '1. Kế hoạch giảng dạy', s5: 'Xuất sắc, sáng tạo, linh hoạt điều chỉnh theo HS', s4: 'Chuẩn bị kỹ, bổ sung yếu tố mới', s3: 'Chạy theo giáo án, không mở rộng', s2: 'Xem qua kịch bản nhưng chưa nhớ bài', s1: 'Chưa chuẩn bị, chưa đọc kịch bản' },
    { criterion: '2. Mục tiêu bài giảng', s5: 'Cụ thể, đo lường được, HS đạt được sau buổi', s4: 'Cụ thể, phù hợp năng lực, có thể đo lường', s3: 'Phù hợp nhưng khó đo lường', s2: 'Cụ thể nhưng chưa phù hợp năng lực HS', s1: 'Sai mục tiêu hoặc không phù hợp thời lượng' },
    { criterion: '3. Slide bài giảng', s5: 'Rõ, liên kết, bắt mắt thu hút HS', s4: 'Rõ, thống nhất, hiệu ứng tốt', s3: 'Rõ ràng, trật tự hợp lý', s2: 'Rõ nhưng sắp xếp chưa hợp lý', s1: 'Rối, thiếu liền mạch' },
    { criterion: '4. Phương tiện & dụng cụ', s5: 'Sáng tạo, thu hút, HS tự giác vận dụng', s4: 'Hợp lý, gây hứng thú', s3: 'Hợp lý, liên hệ được bài học', s2: 'Dùng nhưng chưa hiệu quả', s1: 'Không sử dụng' },
    { criterion: '5. Kiến thức công cụ', s5: 'Tốt, gợi mở bài cũ, dùng hiệu quả', s4: 'Tốt, dùng hiệu quả trong giảng dạy', s3: 'Tốt nhưng chưa kết hợp hiệu quả', s2: 'Một số kiến thức chưa chuẩn', s1: 'Sơ sài, chưa hiểu rõ' },
];

const RUBRIC_B: RubricRow[] = [
    { criterion: '6. Diễn giải (5W1H)', s5: 'Sinh động, dễ hiểu, gần gũi, đủ 5W1H', s4: 'Rõ ràng, mạch lạc, đủ 5W1H', s3: 'Đủ 5W1H nhưng chưa mạch lạc', s2: 'Phức tạp, chưa đủ 5W1H', s1: 'Sai, rườm rà, vấp nhiều' },
    { criterion: '7. Mô phỏng công cụ', s5: 'Kết hợp linh hoạt làm mẫu + diễn giải', s4: 'Trực quan, dễ hiểu, làm mẫu chi tiết', s3: 'Trực quan, dễ hiểu', s2: 'Chưa chính xác hoặc khó hiểu', s1: 'Chưa mô phỏng' },
    { criterion: '8. Câu hỏi kiểm tra KT', s5: 'Đánh giá nhanh, diện rộng toàn lớp', s4: 'Thường xuyên, chưa đánh giá diện rộng', s3: 'Đúng yêu cầu nhưng chưa thường xuyên', s2: 'Chưa đúng loại (đóng/mở)', s1: 'Không có câu hỏi' },
    { criterion: '9. Tổ chức hoạt động', s5: 'HS học qua trải nghiệm, GV theo dõi chặt', s4: 'Bổ trợ mục tiêu, GV ít theo dõi', s3: 'Bổ trợ mục tiêu nhưng GV không theo dõi', s2: 'Có tổ chức nhưng chưa bổ trợ rõ', s1: 'Chưa tổ chức hoặc sai tính chất' },
    { criterion: '10. Kết quả hoạt động', s5: '>80% HS đạt, hào hứng, sinh động', s4: '50–80% HS đạt, ít hào hứng', s3: '>50% bổ trợ mục tiêu, ít hào hứng', s2: 'Không đạt kết quả bổ trợ', s1: 'Chưa tổ chức hoặc sai tính chất' },
    { criterion: '11. Hoạt động thực hành', s5: 'Rõ mục tiêu, độ khó tăng dần, hỗ trợ SP cuối', s4: 'Rõ mục tiêu, tăng dần, chưa hỗ trợ SP cuối', s3: 'Hỗ trợ mục tiêu, SP cuối, chưa tăng dần', s2: 'Chưa rõ mục tiêu, không tăng dần', s1: 'Không có nhiệm vụ hoặc không hỗ trợ' },
    { criterion: '12. Tổ chức thực hành', s5: 'Linh hoạt, theo dõi, hỗ trợ kịp thời', s4: 'Theo dõi, hỗ trợ kịp thời', s3: 'Theo dõi nhưng hỗ trợ không kịp hoặc làm hộ', s2: 'Theo dõi còn hời hợt', s1: 'Không theo dõi' },
    { criterion: '13. Kết quả thực hành', s5: 'GV chữa, phân tích tư duy; HS tự sửa đủ', s4: 'GV chiếu kết quả; HS hiểu, tự sửa đủ', s3: 'HS hiểu & sửa một phần', s2: 'GV chiếu nhưng không kiểm tra từng HS', s1: 'Không chữa' },
    { criterion: '14. Hoạt động game hoá', s5: 'Liên bài, phân hoá độ khó, mọi HS tham gia', s4: 'Liên bài, mọi HS tham gia', s3: 'Liên bài nhưng ít HS hoặc chỉ định', s2: 'Ít liên quan nội dung', s1: 'Chưa tổ chức hoặc sai tính chất' },
    { criterion: '15. Kết quả game hoá', s5: 'Cạnh tranh, giải trí; GV tổng kết kiến thức', s4: 'HS hào hứng, GV chưa tổng kết', s3: 'Ít cạnh tranh, GV không tổng kết', s2: 'Không cạnh tranh, không giải trí', s1: 'Chưa tổ chức' },
];

const RUBRIC_C: RubricRow[] = [
    { criterion: '16. Diễn đạt', s5: 'Truyền cảm, thu hút, tạo hứng thú', s4: 'Lưu loát, liên kết bài học', s3: 'Dễ hiểu, không ngập ngừng', s2: 'Ngập ngừng, vấp nhiều', s1: 'Khó hiểu, rối' },
    { criterion: '17. Tác phong sư phạm', s5: 'Tự tin, ngôn ngữ cơ thể hiệu quả', s4: 'Tự tin, có ngôn ngữ cơ thể', s3: 'Tự tin nhưng đôi khi chưa chuẩn', s2: 'Tạm ổn, thiếu tự tin', s1: 'Rụt rè, thiếu tự tin' },
    { criterion: '18. Phân bổ thời lượng', s5: 'Hợp lý, linh hoạt khi sự cố phát sinh', s4: 'Hợp lý cho các hoạt động', s3: 'Đúng giờ, chưa phân bổ hợp lý từng HĐ', s2: 'Thời gian bị lạm dụng', s1: 'Quá giờ quy định' },
    { criterion: '19. Hệ thống khen thưởng', s5: 'Tạo động lực, quản lý lớp hiệu quả', s4: 'Hợp lý khi tính điểm, chưa rõ hiệu quả', s3: 'Khen thường xuyên, tính điểm chưa hợp lý', s2: 'Khen nhưng chưa thường xuyên', s1: 'Không dùng' },
    { criterion: '20. Tham gia & kiểm soát', s5: 'Kiểm soát chặt cả HS tham gia và không tham gia', s4: 'Liên kết chặt giữa 2 nhóm HS', s3: 'Giao nhiệm vụ cho nhóm không tham gia', s2: 'Giao nhiệm vụ nhưng chưa kiểm soát', s1: 'Không kiểm soát nhóm không tham gia' },
    { criterion: '21. Hệ thống nhóm', s5: 'HS tự phân công vai trò, làm nhóm hiệu quả', s4: 'Phù hợp bối cảnh, mọi HS tham gia hiệu quả', s3: 'Phù hợp nhưng chưa thấy hiệu quả', s2: 'Chưa phù hợp bối cảnh lớp', s1: 'Chưa sử dụng' },
    { criterion: '22. Hệ thống chú ý', s5: 'Thường xuyên, đồng nhất, hiệu quả rõ', s4: 'Thường xuyên, đồng nhất, phần nào hiệu quả', s3: 'Phù hợp nhưng chưa thường xuyên', s2: 'Dùng nhưng chưa đảm bảo chú ý HS', s1: 'Chưa sử dụng' },
    { criterion: '23. Xử lý tình huống', s5: 'Kịp thời, khéo léo, tái lập không khí lớp', s4: 'Khéo léo, thuyết phục nhưng chưa kịp thời', s3: 'Xử lý được nhưng chưa khéo', s2: 'Nhận biết nhưng không xử lý được', s1: 'Không xử lý' },
    { criterion: '24. Quản lý lớp học', s5: 'Liên tục giám sát qua phương tiện không lời', s4: 'Thường xuyên giám sát, xử lý hiệu quả', s3: 'Xác lập tiêu chuẩn, duy trì >50%', s2: 'Tiêu chuẩn có nhưng không duy trì', s1: 'Bị động, không kiểm soát' },
    { criterion: '25. Môi trường lớp học', s5: 'HS chủ động, vui vẻ, hào hứng liên tục', s4: 'Trơn tru, hiệu quả, vui vẻ', s3: 'Trơn tru, hài hòa', s2: 'Đôi khi trầm, thiếu động lực', s1: 'Lộn xộn, không tổ chức' },
    { criterion: '26. Kỹ năng giao tiếp', s5: 'Linh hoạt, sâu sắc với HS; chuyên nghiệp với PH', s4: 'Hiệu quả với HS; rõ ràng với PH', s3: 'Giao tiếp được với HS; hạn chế với PH', s2: 'Đơn điệu; khó khăn khi giao tiếp PH', s1: 'Lắp bắp, thiếu tự tin; không biết giao tiếp PH' },
];

// ─── Phase Tabs ───────────────────────────────────────────────────────────────
const PHASES = [
    { id: 'p1', emoji: '①', label: 'Cấp tài khoản', sub: 'Quan sát → Duyệt giảng' },
    { id: 'p2', emoji: '②', label: 'Sau khi có LMS', sub: 'TA → Duyệt giảng LEC' },
    { id: 'p3', emoji: '③', label: 'LEC → Super Mentor', sub: 'LEC → BGK' },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function Screen11({ onNavigate }: { onNavigate?: (screen: string) => void }) {
    const [phase, setPhase] = useState('p1');

    return (
        <div className="max-w-5xl mx-auto pb-16 px-2">

            {/* Header */}
            <div className="pt-2 pb-6 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white">Lộ Trình Ứng Viên → LEC</h1>
                <p className="text-slate-400 mt-1">Tài liệu hướng dẫn từng bước dành cho giáo viên mới</p>

                {/* Journey bar */}
                <div className="flex items-center gap-1 mt-4 flex-wrap">
                    {[
                        { label: 'Ứng viên', c: 'bg-slate-700 text-slate-300' },
                        { label: '→', c: 'text-slate-600 bg-transparent border-0 px-0' },
                        { label: 'Quan sát', c: 'bg-indigo-600/70 text-indigo-100' },
                        { label: '→', c: 'text-slate-600 bg-transparent border-0 px-0' },
                        { label: 'Duyệt giảng', c: 'bg-indigo-600/70 text-indigo-100' },
                        { label: '→', c: 'text-slate-600 bg-transparent border-0 px-0' },
                        { label: 'TA', c: 'bg-blue-600/70 text-blue-100' },
                        { label: '→', c: 'text-slate-600 bg-transparent border-0 px-0' },
                        { label: 'LEC', c: 'bg-emerald-600/70 text-emerald-100' },
                        { label: '→', c: 'text-slate-600 bg-transparent border-0 px-0' },
                        { label: 'Super Mentor', c: 'bg-amber-600/70 text-amber-100' },
                    ].map((s, i) => (
                        <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-semibold border border-transparent ${s.c}`}>{s.label}</span>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 mb-8 flex-wrap">
                {PHASES.map(p => (
                    <button key={p.id} onClick={() => setPhase(p.id)}
                        className={`px-5 py-3 rounded-xl text-left transition-all border flex-1 min-w-[140px]
              ${phase === p.id
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white'}`}>
                        <div className="text-base font-bold">{p.emoji} {p.label}</div>
                        <div className={`text-xs mt-0.5 ${phase === p.id ? 'text-indigo-200' : 'text-slate-500'}`}>{p.sub}</div>
                    </button>
                ))}
            </div>

            {/* ══ PHASE 1 ══════════════════════════════════════════════════════════ */}
            {phase === 'p1' && (
                <div className="space-y-1">
                    <Step n={1} title="Quan sát lớp học — 5 buổi">
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Tham gia trực tiếp vào lớp học cùng GV phụ trách. Quan sát cách dạy, quản lý lớp và tương tác với học viên để hiểu thực tế.
                        </p>
                        <ul className="space-y-2">
                            {[
                                'Thông báo với GV khi đến: "Hôm nay em có buổi quan sát"',
                                'Điền form quan sát sau mỗi buổi',
                            ].map((t, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span>{t}</span>
                                </li>
                            ))}
                            <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Liên hệ Leader nhận mã lớp &amp; khung giờ: <a href="https://zalo.me/0337061506" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 font-medium">Zalo 0337061506</a></span>
                            </li>
                        </ul>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Tài liệu & lịch lớp</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard href="https://drive.google.com/file/d/1xTWTOjqB6tZIl4Xc7YBPQaOgLdXbfmbr/view" icon={ClipboardCheck} label="Form quan sát" desc="Điền sau mỗi buổi" color="blue" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1qjqo6nrQKegFPzu4t8D4W2Q5-fJ829ghNvTDWjRD1r4/edit" icon={Calendar} label="Lịch lớp HCM1" desc="Xem lịch khu vực HCM1" color="slate" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1DRASt1UR8drUTLH-WGvguJRWudq3Z02eicwxxmPphek/edit" icon={Calendar} label="Lịch lớp HCM4" desc="Xem lịch khu vực HCM4" color="slate" />
                        </div>
                    </Step>

                    <Step n={2} title="Tham gia quan sát ca trải nghiệm (Trial)">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">3 việc trong buổi trải nghiệm</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { t: '① Giới thiệu', d: 'Tự giới thiệu bản thân, mời HS giới thiệu để tạo tương tác.' },
                                { t: '② Dẫn dắt', d: 'Dựa vào sở thích HS để kết nối vào nội dung bài học.' },
                                { t: '③ Giảng dạy', d: 'Dạy theo đúng giáo trình, không bỏ bước nào.' },
                            ].map(item => (
                                <div key={item.t} className="rounded-xl bg-indigo-900/20 border border-indigo-500/20 p-3">
                                    <p className="text-indigo-300 font-bold text-xs mb-1">{item.t}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">4 bước sau buổi trải nghiệm</p>
                        <div className="space-y-2">
                            {/* ① Trao đổi với Tư vấn */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">①</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Trao đổi với Tư vấn</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Báo cáo thái độ &amp; năng lực HS trước khi gặp phụ huynh.</p>
                                </div>
                            </div>

                            {/* ② Nhận xét với Phụ huynh */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">②</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Nhận xét với Phụ huynh</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Phản hồi kết quả học của HS theo đúng hướng dẫn.</p>
                                    <a href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/v.-quy-trinh-van-hanh-buoi-trai-nghiem/quy-trinh-mot-ca-trai-nghiem/huong-dan-nhan-xet-voi-phu-huynh" target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-3 h-3" />Hướng dẫn
                                    </a>
                                </div>
                            </div>

                            {/* ③ Điền phiếu đánh giá — NavBtn tới screen2 */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">③</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-white text-sm">Điền phiếu đánh giá năng lực HS</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Điền form sau trải nghiệm. Check lại phiếu tại mục 2 trong app.</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <a href="https://forms.office.com/pages/responsepage.aspx?id=oAYARH-DxUGWTsVLZQsVNRdxoHOrh4tAlfWX5PKv_NxUQVhJTDFWV1RaV1gwQzBaRklDU1hJQVFHSi4u" target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                                            <ExternalLink className="w-3 h-3" />Form phiếu TN
                                        </a>
                                        <NavBtn screen="screen2" label="Mở màn hình Tìm phiếu" onNavigate={onNavigate} />
                                    </div>
                                </div>
                            </div>

                            {/* ④ Cập nhật kết quả lên LMS */}
                            <div className="flex gap-3 bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                                <span className="text-indigo-400 font-bold text-base w-5 flex-shrink-0">④</span>
                                <div>
                                    <p className="font-semibold text-white text-sm">Cập nhật kết quả lên LMS</p>
                                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Ghi kết quả vào hệ thống LMS sau buổi.</p>
                                    <a href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/v.-quy-trinh-van-hanh-buoi-trai-nghiem/quy-trinh-mot-ca-trai-nghiem/huong-dan-danh-gia-ket-qua-trai-nghiem-tren-lms" target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-3 h-3" />Hướng dẫn LMS
                                    </a>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Tài liệu buổi trải nghiệm</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                            <ResourceCard href="https://docs.google.com/presentation/d/1RCD9a3IATcrGwY2AQObbqBxRknhQuIu5/edit" icon={Video} label="Slide quy trình Trial" desc="Trình chiếu trong buổi TN" color="violet" />
                            <ResourceCard href="https://drive.google.com/drive/folders/1bhaEu1lCv-30FloGSFY8tZhEFK1cYFCm" icon={BookOpen} label="Giáo trình mới" desc="New curriculum" color="emerald" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1VxhunGGaUk2schjQzF0vxwquNWdEdR42z6DnDFL2McY/edit" icon={BookOpen} label="Giáo trình cũ" desc="Old curriculum" color="slate" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4">Tài liệu thiết bị & kỹ thuật</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            <ResourceCard href="https://drive.google.com/file/d/1pkqQIScGELY2ygX2THWFQNJsC5PGXTBJ/view?usp=drive_link" icon={BookOpen} label="Tài liệu VEX GO" desc="Tìm hiểu thiết bị" color="blue" />
                            <ResourceCard href="https://drive.google.com/file/d/1yzkuIgLwzMJmXgwUO3f0uLn5cViShxCT/view?usp=sharing" icon={BookOpen} label="Tài liệu VEX IQ" desc="Tìm hiểu thiết bị" color="blue" />
                            <ResourceCard href="https://spike.legoeducation.com/essential/start/" icon={BookOpen} label="Tài liệu SPIKE Essential" desc="Tìm hiểu thiết bị" color="amber" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1g-vaMbXvdEk25TVvgoMUi19vrJabdkLCOsfDzueqWPY/edit?gid=1780248855#gid=1780248855" icon={FileText} label="Lỗi kỹ thuật robot" desc="Lỗi thường gặp và cách xử lý" color="red" />
                        </div>
                    </Step>

                    <Step n={3} title="Duyệt giảng với Leader → Được cấp tài khoản" last>
                        <Callout icon="💡" text="Chủ động nhắn Leader thời gian rảnh để được sắp xếp buổi duyệt!" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Leader kiểm tra 3 mục</p>
                        <Check items={[
                            'Trả lời câu hỏi về những gì đã quan sát trong lớp học',
                            'Thực hành lại đầy đủ 1 ca trải nghiệm',
                            'Giải thích sự khác nhau giữa các câu lệnh lập trình từng khóa RBT',
                        ]} />
                        <ResourceCard href="https://apprbt.vercel.app/" icon={Star} label="Kiểm tra câu lệnh RBT" desc="Ôn tập tại mục 1 — dùng cho mục kiểm tra thứ 3" color="amber" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Rubric đánh giá — 10 tiêu chí (thang 1→5)</p>
                        <RubricTable groupLabel="10 tiêu chí duyệt giảng lần 1" color="indigo" rows={RUBRIC_10} />
                    </Step>
                </div>
            )}

            {/* ══ PHASE 2 ══════════════════════════════════════════════════════════ */}
            {phase === 'p2' && (
                <div className="space-y-1">
                    <Step n={1} title="Liên hệ TC (Teacher Coordinator)">
                        <p className="text-sm text-slate-400">Nhắn tin giới thiệu tới <a href="https://zalo.me/0385914843" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 font-medium">Zalo 0385914843</a>:</p>
                        <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 font-mono text-sm text-slate-300 leading-relaxed">
                            "Em tên [Tên], mã LMS [mã], đang là GV RBT khu vực [HCM1/HCM4].
                            Sau duyệt giảng với leader, em có thể tham gia trial các level:
                            <span className="text-indigo-300 font-bold"> PRE / ARM / SEMI / KIND 4+</span>"
                        </div>
                    </Step>

                    <Step n={2} title="3 việc cần làm mỗi tuần">
                        <div className="space-y-3">
                            {[
                                {
                                    n: '1', t: 'Đăng ký lịch làm', d: 'Điền form đăng ký trước mỗi tuần. Nhớ update môn học có thể trải nghiệm, giờ bận và lý do cụ thể — giúp TC dễ nắm và điều chỉnh khung giờ cho phù hợp.', cards: [
                                        { href: 'https://docs.google.com/forms/d/e/1FAIpQLScZuVAlACc1Pnoz7GU85xkwTdcHdJh6vMdbeYJwEIaxeE_q2Q/viewform', icon: ClipboardCheck, label: 'Form đăng ký lịch', color: 'emerald' },
                                    ]
                                },
                                {
                                    n: '2', t: 'Kiểm tra lịch cơ sở (6h tối mỗi ngày)', d: 'Vào 6h tối xem có ca trực không → vào LMS check giáo trình để chuẩn bị.', cards: [
                                        { href: 'https://docs.google.com/spreadsheets/d/1qjqo6nrQKegFPzu4t8D4W2Q5-fJ829ghNvTDWjRD1r4/edit', icon: Calendar, label: 'Lịch HCM1', color: 'blue' },
                                        { href: 'https://docs.google.com/spreadsheets/d/1DRASt1UR8drUTLH-WGvguJRWudq3Z02eicwxxmPphek/edit', icon: Calendar, label: 'Lịch HCM4', color: 'blue' },
                                    ]
                                },
                                {
                                    n: '3', t: 'Kiểm tra công & phản hồi lương', d: 'Nếu thiếu công → điền sheet để TC đảm bảo quyền lợi.', cards: [
                                        { href: 'https://docs.google.com/spreadsheets/d/1jow0T_fuAiWRGUOjp22euWRg0Blh5Ix-Y5Z9AiD7Q-s/edit', icon: DollarSign, label: 'Sheet feedback lương', color: 'amber' },
                                        { href: 'https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/huong-dan-kiem-tra-cong-luong', icon: FileText, label: 'H.dẫn kiểm tra công', color: 'blue' },
                                    ]
                                },
                            ].map(item => (
                                <div key={item.n} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.n}</span>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{item.t}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{item.d}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9">
                                        {item.cards.map(c => <ResourceCard key={c.href} {...c} icon={c.icon} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien" icon={BookOpen} label="📖 Quy trình quy định dành cho GV" desc="Đọc đầy đủ — quan trọng!" color="violet" />
                    </Step>

                    <Step n={3} title="Đầu việc TA có thể tham gia">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-emerald-900/15 border border-emerald-500/20 p-4">
                                <p className="font-bold text-emerald-300 mb-1.5">🧑‍💻 Trợ giảng lớp học</p>
                                <p className="text-slate-400 text-xs leading-relaxed">Hỗ trợ lớp có trên 9 học viên — tuỳ mức handle của GV đứng lớp.</p>
                            </div>
                            <div className="rounded-xl bg-blue-900/15 border border-blue-500/20 p-4">
                                <p className="font-bold text-blue-300 mb-1.5">🎯 Chạy ca trải nghiệm</p>
                                <p className="text-slate-400 text-xs leading-relaxed mb-2">Dẫn buổi trial cho HS mới theo đúng quy trình đã duyệt.</p>
                                <ResourceCard href="https://docs.google.com/presentation/d/1RCD9a3IATcrGwY2AQObbqBxRknhQuIu5/edit" icon={Video} label="Slide trial" color="blue" />
                            </div>
                        </div>
                    </Step>

                    <Step n={4} title="Duyệt giảng lên LEC (Giáo viên đứng lớp)" last>
                        <Callout icon="🎯" text="Mục tiêu giai đoạn TA: chuẩn bị đủ kiến thức để được duyệt giảng lên LEC!" />
                        <Callout icon="⏱️" text="Buổi duyệt giảng kéo dài 15–20 phút — thực hành dạy thử 1 phần bài học trước BGK/Leader." color="blue" />
                        <Check items={[
                            'Đăng ký vào group duyệt giảng trên Zalo',
                            'Soạn slide theo mẫu (xem slide mẫu K12 hoặc 4+)',
                            'Thực hành dạy nhiều lần trước khi duyệt',
                        ]} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard href="https://zalo.me/g/xqgakm321" icon={Users} label="Group đăng ký duyệt giảng" desc="Đăng ký lịch duyệt" color="emerald" />
                            <ResourceCard href="https://drive.google.com/file/d/1At4vzPyq1JZJpbcnBTaulzkMv12moh--/view" icon={Video} label="Slide mẫu K12" desc="Dành cho khoá K12" color="blue" />
                            <ResourceCard href="https://drive.google.com/file/d/11ej6lpoCJ1cJNYhr-TGwUtXgdh1jg5Pq/view" icon={Video} label="Slide mẫu 4+" desc="Dành cho khoá 4+" color="blue" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Rubric đánh giá LEC — 26 tiêu chí (thang 1→5)</p>
                        <div className="space-y-2">
                            <RubricTable groupLabel="A — Đánh giá sự chuẩn bị (tiêu chí 1–5)" color="indigo" rows={RUBRIC_A} />
                            <RubricTable groupLabel="B — Phương pháp giảng dạy (tiêu chí 6–15)" color="emerald" rows={RUBRIC_B} />
                            <RubricTable groupLabel="C — Kỹ năng sư phạm (tiêu chí 16–26)" color="amber" rows={RUBRIC_C} />
                        </div>
                    </Step>
                </div>
            )}

            {/* ══ PHASE 3 ══════════════════════════════════════════════════════════ */}
            {phase === 'p3' && (
                <div className="space-y-1">
                    <Step n={1} title="Kết quả sau khi lên LEC">
                        <Check items={[
                            'Đứng giảng dạy chính thức tại lớp',
                            'Tham gia quy trình deal lương sau 6 tháng làm việc',
                            'Leader đánh giá và hỗ trợ deal lương đợt đầu tiên',
                        ]} />
                        <Callout icon="📌" text="Trong 6 tháng đầu: sẵn sàng hỗ trợ tất cả tình huống và không ngừng học hỏi để đạt kết quả tốt nhất." color="blue" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Tài liệu lương</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/chi-tiet-luong" icon={DollarSign} label="Chi tiết bảng lương" color="emerald" />
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/dieu-kien-danh-gia-luong" icon={ClipboardCheck} label="Điều kiện đánh giá" color="blue" />
                            <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien/iv.-quy-trinh-quy-dinh-chung/quy-dinh-danh-gia-luong/chi-so-danh-gia" icon={Star} label="Chỉ số đánh giá" color="amber" />
                        </div>
                    </Step>

                    <Step n={2} title="Vai trò BGK → Trở thành Super Mentor" last>
                        {/* Roadmap */}
                        <div className="flex flex-col gap-0">
                            {[
                                { icon: '🟢', label: 'LEC đứng lớp ổn định' },
                                { icon: '📚', label: 'Nắm vững giáo trình & bộ môn' },
                                { icon: '📝', label: 'Đề xuất duyệt giảng Super Mentor với Leader' },
                                { icon: '🎓', label: 'Đào tạo chuyên sâu & duyệt đạt' },
                                { icon: '�', label: 'Tham gia vai trò BGK' },
                                { icon: '⭐', label: 'Super Mentor', highlight: true },
                            ].map((item, i, arr) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg mt-0.5">{item.icon}</span>
                                        {i < arr.length - 1 && <div className="w-px h-5 bg-white/15 my-0.5" />}
                                    </div>
                                    <p className={`text-sm py-1 ${item.highlight ? 'text-amber-300 font-bold text-base' : 'text-slate-300'}`}>{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Khi nắm vững bộ môn và giáo trình, bạn tham gia <strong className="text-white">chấm điểm học viên trong buổi thi số 14</strong> nhằm tìm ra Top 1, 2, 3… — đảm bảo tính công bằng và công nhận nỗ lực của các em.
                            </p>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">BGK quan sát và chấm trong 3 giai đoạn</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { ph: '① Lắp ráp', d: 'Đi xung quanh, quan sát và đặt câu hỏi gợi mở trong lúc HS làm.' },
                                { ph: '② Lập trình', d: 'Quan sát quá trình, đặt thêm câu hỏi để hiểu tư duy của HS.' },
                                { ph: '③ Thuyết trình', d: 'Sau khi HS trình bày xong, đặt câu hỏi để làm rõ nội dung còn thiếu.' },
                            ].map(item => (
                                <div key={item.ph} className="rounded-xl bg-amber-900/15 border border-amber-500/20 p-3">
                                    <p className="text-amber-300 font-bold text-xs mb-1">{item.ph}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-3">Câu hỏi BGK — tối thiểu 3 câu/HS</p>
                        <div className="flex flex-wrap gap-2">
                            {['Sáng tạo', 'Làm việc nhóm', 'Lập trình', 'Thuyết trình', 'Câu hỏi gợi mở'].map(t => (
                                <span key={t} className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/20">{t}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1WrQyJD3mU7plrikePg01TWuiQB5MTjV_tHEM9isNxjM/edit" icon={ClipboardCheck} label="Bộ câu hỏi BGK mẫu" desc="Tham khảo trước khi chấm" color="amber" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1UPb8q8rJXWeFfaZNIkxAbUnGcDmAz3uE/edit" icon={Star} label="Bảng điểm 4+" color="blue" />
                            <ResourceCard href="https://docs.google.com/spreadsheets/d/1E4rLWCul0DrBFZv5kvKKgc2h4mhlYWAr/edit" icon={Star} label="Bảng điểm K12" color="blue" />
                        </div>

                        <Callout icon="💡" text="Đề xuất với Leader để có buổi duyệt giảng và đào tạo chuyên sâu — đây là bước cuối để đạt role Super Mentor." />
                    </Step>
                </div>
            )}

            {/* Footer */}
            <div className="mt-12 border-t border-white/10 pt-6">
                <p className="text-slate-500 text-xs text-center mb-3">Mọi thắc mắc liên hệ Leader hoặc TC</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <ResourceCard href="https://cxohok12.gitbook.io/quy-trinh-quy-dinh-danh-cho-giao-vien" icon={BookOpen} label="📖 Quy trình GV" desc="Đọc đầy đủ quy định" color="blue" />
                    <ResourceCard href="https://apprbt.vercel.app/" icon={Star} label="🔍 AppRBT" desc="Ôn tập câu lệnh RBT" color="violet" />
                    <ResourceCard href="https://tmsmindx.vercel.app/" icon={DollarSign} label="💰 Deal lương" desc="Xem chỉ số deal" color="emerald" />
                </div>
            </div>

        </div>
    );
}
