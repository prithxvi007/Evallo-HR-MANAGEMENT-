"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import Dashboard from "@/components/pages/dashboard";
import EmployeeList from "@/components/pages/employee-list";
import TeamList from "@/components/pages/team-list";
import Assignments from "@/components/pages/assignments";
import LoginPage from "@/components/pages/login";
import SignupPage from "@/components/pages/signup";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          setIsAuthenticated(true);
          setCurrentPage("dashboard");
        } else {
          setIsAuthenticated(false);
          setCurrentPage("login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setCurrentPage("login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  // Handle signup
  const handleSignup = () => {
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCurrentPage("login");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Evallo...</p>
        </div>
      </div>
    );
  }

  // Render authentication pages
  if (!isAuthenticated) {
    if (currentPage === "signup") {
      return (
        <SignupPage onSignup={handleSignup} setCurrentPage={setCurrentPage} />
      );
    }
    return <LoginPage onLogin={handleLogin} setCurrentPage={setCurrentPage} />;
  }

  // Render main app pages
  const renderPage = () => {
    switch (currentPage) {
      case "employees":
        return <EmployeeList />;
      case "teams":
        return <TeamList />;
      case "assignments":
        return <Assignments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="fade-in pt-24 pb-20 md:pb-0">{renderPage()}</main>
    </div>
  );
}
