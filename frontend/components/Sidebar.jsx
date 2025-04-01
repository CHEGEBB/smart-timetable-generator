"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Home,
  Layout,
  LogOut,
  School,
  Users,
  BarChart2,
  BookOpen,
  X,
  Menu,
} from "lucide-react";
import "@/sass/fonts.scss";

// Navigation Item Component
function NavItem({ icon, label, path, isActive, onClick }) {
  return (
    <Link 
      href={path || "#"}
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
        isActive 
          ? "bg-emerald-500/10 text-emerald-400" 
          : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
      )}
    </Link>
  );
}

// Navigation Group Component
function NavGroup({ title, children }) {
  return (
    <div className="mt-1">
      <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function Sidebar({ user = { name: "Admin", role: "Administrator" } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if current path matches the navigation item path
  const isActiveRoute = (path) => {
    if (path === "/dashboard" && pathname === "/") return true;
    return pathname.startsWith(path);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    
    // Clear any user data from localStorage
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/');
    
    // Close sidebar on mobile if open
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Check screen size on window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener("resize", checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Generate user initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 rounded-md bg-slate-800 p-2 text-white shadow-md lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto`}
        initial={{ x: isMobile ? -320 : 0 }}
        animate={{ x: isMobile && !isSidebarOpen ? -320 : 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center">
            <Calendar size={24} className="text-emerald-400 mr-2" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Smart Timetable
            </h2>
          </div>
          {isMobile && (
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {/* Main Navigation */}
          <NavGroup title="Main">
            <NavItem 
              icon={<Home size={18} />} 
              label="Dashboard" 
              path="/dashboard" 
              isActive={isActiveRoute("/dashboard")} 
            />
            <NavItem 
              icon={<BarChart2 size={18} />} 
              label="Generate" 
              path="/generate" 
              isActive={isActiveRoute("/generate")} 
            />
          </NavGroup>

          {/* Management */}
          <NavGroup title="Management">
            <NavItem 
              icon={<BookOpen size={18} />} 
              label="Courses" 
              path="/courses" 
              isActive={isActiveRoute("/courses")} 
            />
            <NavItem 
              icon={<Users size={18} />} 
              label="Teachers" 
              path="/teachers" 
              isActive={isActiveRoute("/teachers")} 
            />
            <NavItem 
              icon={<School size={18} />} 
              label="Classes" 
              path="/classes" 
              isActive={isActiveRoute("/classes")} 
            />
            <NavItem 
              icon={<Layout size={18} />} 
              label="Rooms" 
              path="/rooms" 
              isActive={isActiveRoute("/rooms")} 
            />
          </NavGroup>

          {/* Views */}
          <NavGroup title="View Timetables">
            <NavItem 
              icon={<Users size={18} />} 
              label="Teacher View" 
              path="/view/teacher" 
              isActive={isActiveRoute("/view/teacher")} 
            />
            <NavItem 
              icon={<School size={18} />} 
              label="Class View(student)" 
              path="/view/class" 
              isActive={isActiveRoute("/view/class")} 
            />
            <NavItem 
              icon={<Layout size={18} />} 
              label="Room View" 
              path="/view/room" 
              isActive={isActiveRoute("/view/room")} 
            />
          </NavGroup>

          {/* Logout only */}
          <div className="pt-4 border-t border-slate-700">
            <NavItem 
              icon={<LogOut size={18} />} 
              label="Logout" 
              onClick={handleLogout} 
            />
          </div>
        </nav>

        {/* Version Info */}
        <div className="px-4 py-2 mt-auto text-xs text-slate-500 border-t border-slate-700">
          <p>Smart Timetable v1.0.0</p>
        </div>
      </motion.div>
    </>
  );
}