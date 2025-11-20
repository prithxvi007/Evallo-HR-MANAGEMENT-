"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Users2,
  Link2,
  Building2,
  LogOut,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";

export default function Navigation({ currentPage, setCurrentPage, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "employees", label: "Employees", icon: Users },
    { id: "teams", label: "Teams", icon: Users2 },
    { id: "assignments", label: "Assignments", icon: Link2 },
  ];

  const handleLogout = () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    toast.success("Logged out successfully!");
    onLogout();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setCurrentPage("dashboard");
    setMobileMenuOpen(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Top Navigation - Desktop & Mobile Header */}
      <nav className="fixed top-0 left-0 right-0 border-b border-border bg-background/80 backdrop-blur-xl z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-linear-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <Building2 className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent tracking-tight text-left">
                    Evallo
                  </span>
                  <span className="text-xs text-muted-foreground font-medium text-left">
                    HR Management System
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                      currentPage === item.id
                        ? "bg-linear-to-r from-primary to-purple-600 text-primary-foreground shadow-lg"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side - User menu, theme toggle, and mobile button */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User menu - desktop */}
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {getUserInitials(user?.name)}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">HR Management</span>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold">
                          {getUserInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1">
                    </div>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-accent flex items-center gap-2 font-medium transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
              >
                {mobileMenuOpen ? <X size={24} /> : <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {getUserInitials(user?.name)}
                  </div>}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border" ref={mobileMenuRef}>
              
              {/* User Profile Section */}
              <div className="border-t border-border mt-2 pt-4 pb-2">
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground font-semibold text-lg">
                      {getUserInitials(user?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-sm text-muted-foreground truncate">HR Management</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>


                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 rounded-lg text-destructive hover:bg-accent flex items-center gap-3 font-medium transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="text-base">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-xl z-40 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
  key={item.id}
  onClick={() => handlePageChange(item.id)}
  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
    currentPage === item.id
      ? "bg-primary text-primary-foreground shadow-md scale-105"
      : "text-muted-foreground hover:text-foreground hover:bg-accent"
  }`}
>
  <Icon size={18} />
  <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
</button>

            );
          })}
        </div>
      </div>
    </>
  );
}