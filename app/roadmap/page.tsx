'use client';

/**
 * Public roadmap page — accessible at /roadmap
 * Có sidebar đầy đủ, share được link cho mentor mới
 */

import Screen11 from '@/app/components/Screen11';
import Sidebar from '@/app/components/Sidebar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RoadmapPage() {
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    function handleScreenChange(screen: string) {
        router.push(`/?screen=${screen}`);
    }

    return (
        <div className="flex min-h-screen bg-[#0f1117] text-white">
            {/* Sidebar — desktop only (mobile dùng bottom nav trong component) */}
            <Sidebar
                activeScreen="screen11"
                onScreenChange={handleScreenChange}
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(p => !p)}
            />

            {/* Main content — đẩy sang phải trên desktop, full width trên mobile */}
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* pb-20 để tránh bị bottom nav che trên mobile */}
                <div className="p-4 md:p-6 pb-20 md:pb-6">
                    <Screen11 />
                </div>
            </main>
        </div>
    );
}
