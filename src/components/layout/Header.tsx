import React from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Bell,
  Calendar,
  User,
  LogOut,
  Settings,
  ChevronDown,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  userName?: string;
  userRole?: "admin" | "user" | "public";
  onToggleSidebar?: () => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

const Header = ({
  userName = "Admin User",
  userRole = "admin",
  onToggleSidebar = () => {},
  onLogout = () => {},
  children,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background flex h-16 items-center px-4 md:px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline-block">
              Provider Schedule
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {children}
          
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" title="Back to Dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </Button>

          {userRole !== "public" ? (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/login">
                <LogIn className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                    alt={userName}
                  />
                  <AvatarFallback>
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm hidden md:flex">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;