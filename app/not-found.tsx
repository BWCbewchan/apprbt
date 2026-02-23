import { Home, Rocket } from "lucide-react";
import Link from "next/link";
import TetDecoration from "./components/TetDecoration";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col items-center justify-center relative overflow-hidden p-6">
            <TetDecoration />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
                {/* Animated Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center relative backdrop-blur-md transform -rotate-12 hover:rotate-0 transition-all duration-500 group">
                        <Rocket className="w-12 h-12 text-indigo-400 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-500" />
                    </div>
                </div>

                {/* Text */}
                <h1 className="text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-indigo-700 tracking-tighter">
                    404
                </h1>
                <h2 className="text-2xl font-bold mb-3 text-white">Oops! Mất kết nối rồi</h2>
                <p className="text-slate-400 mb-8 leading-relaxed max-w-[280px]">
                    Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã được dời đi.
                </p>

                {/* Action Button */}
                <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-500 overflow-hidden rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                    </div>
                    <Home className="w-5 h-5" />
                    <span>Về trang chủ</span>
                </Link>
            </div>

            {/* Grid Pattern Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            />
        </div>
    );
}
