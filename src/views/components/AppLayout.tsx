"use client";

import React, { useState } from "react";
import { Navbar } from "@/views/components/Navbar";
import { Sidebar } from "@/views/components/Sidebar";
import { SessionUser, UserRole } from "@/models/types";

interface AppLayoutProps {
  user: SessionUser;
  role: UserRole;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar user={user} onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1">
        <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
