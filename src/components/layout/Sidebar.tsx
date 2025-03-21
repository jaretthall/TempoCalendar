import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Users,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Filter,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for providers and clinic types
  const providers = [
    { id: 1, name: "Dr. Smith", color: "#4CAF50", active: true },
    { id: 2, name: "Dr. Johnson", color: "#2196F3", active: true },
    { id: 3, name: "Dr. Williams", color: "#FFC107", active: true },
    { id: 4, name: "Dr. Brown", color: "#9C27B0", active: false },
  ];

  const clinicTypes = [
    { id: 1, name: "Primary Care", color: "#E91E63", active: true },
    { id: 2, name: "Pediatrics", color: "#3F51B5", active: true },
    { id: 3, name: "Cardiology", color: "#FF5722", active: true },
    { id: 4, name: "Dermatology", color: "#009688", active: false },
  ];

  const navItems = [
    { path: "/", icon: <Home size={20} />, label: "Home" },
    { path: "/calendar", icon: <Calendar size={20} />, label: "Calendar" },
    { path: "/providers", icon: <Users size={20} />, label: "Providers" },
    { path: "/clinics", icon: <Building2 size={20} />, label: "Clinic Types" },
    { path: "/notes", icon: <FileText size={20} />, label: "Notes" },
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside
      className={cn(
        "h-full bg-background border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64 lg:w-72",
      )}
    >
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              {collapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-md mx-auto",
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {item.icon}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center h-10 px-3 rounded-md",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <Filter size={16} />
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium mb-2">Providers</h4>
                <div className="space-y-2">
                  {providers.map((provider) => (
                    <div key={provider.id} className="flex items-center">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full mr-2",
                          provider.active ? "opacity-100" : "opacity-40",
                        )}
                        style={{ backgroundColor: provider.color }}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          provider.active
                            ? "text-foreground"
                            : "text-muted-foreground line-through",
                        )}
                      >
                        {provider.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium mb-2">Clinic Types</h4>
                <div className="space-y-2">
                  {clinicTypes.map((clinic) => (
                    <div key={clinic.id} className="flex items-center">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full mr-2",
                          clinic.active ? "opacity-100" : "opacity-40",
                        )}
                        style={{ backgroundColor: clinic.color }}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          clinic.active
                            ? "text-foreground"
                            : "text-muted-foreground line-through",
                        )}
                      >
                        {clinic.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
