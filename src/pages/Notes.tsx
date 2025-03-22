import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import CalendarNotes from "@/components/calendar/CalendarNotes";

const Notes = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { session, signOut } = useAuth();
  const [currentDate] = useState<Date>(new Date());

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        userName={session.user ? "Admin User" : undefined}
        userRole={session.user ? "admin" : "public"}
        onToggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <h1 className="text-2xl font-bold mb-6">Calendar Notes</h1>

          <div className="max-w-4xl mx-auto">
            <CalendarNotes
              date={currentDate}
              isAdmin={session.isAdmin}
              currentUser={{
                id: session.user?.id || "guest",
                name: session.user ? "Admin User" : "Guest User",
                avatarUrl: undefined,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notes;
