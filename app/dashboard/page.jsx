"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Grid,
  Home,
  Layout,
  LogOut,
  Menu,
  MessageSquare,
  PieChart,
  Plus,
  School,
  Search,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import "../../sass/fonts.scss"
import Sidebar from "@/components/Sidebar";

// Dummy data for the dashboard
const scheduleData = [
  { id: 1, day: "Monday", subject: "Mathematics", time: "9:00 AM", room: "Room 101", teacher: "Dr. Smith" },
  { id: 2, day: "Monday", subject: "Physics", time: "11:00 AM", room: "Lab 3", teacher: "Prof. Johnson" },
  { id: 3, day: "Tuesday", subject: "Computer Science", time: "10:00 AM", room: "IT Lab", teacher: "Ms. Davis" },
  { id: 4, day: "Wednesday", subject: "Chemistry", time: "2:00 PM", room: "Lab 2", teacher: "Dr. Wilson" },
];

const stats = [
  { id: 1, name: "Total Classes", value: "32", icon: <Layout className="text-indigo-500" size={20} /> },
  { id: 2, name: "Teachers", value: "18", icon: <Users className="text-emerald-500" size={20} /> },
  { id: 3, name: "Rooms", value: "12", icon: <Grid className="text-amber-500" size={20} /> },
  { id: 4, name: "Subjects", value: "24", icon: <FileText className="text-rose-500" size={20} /> },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              {/* Mobile Menu Toggle */}
              <button onClick={toggleSidebar} className="lg:hidden mr-4 text-slate-400 hover:text-white">
                <Menu size={24} />
              </button>
              
              {/* Search Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {/* Right Side Nav Items */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Clock size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Calendar size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <MessageSquare size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-slate-400">Welcome back, John! Here's what's happening today.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300"
              >
                <Plus size={16} />
                <span>Generate Timetable</span>
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: stat.id * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      {stat.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-400">{stat.name}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts and Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Charts */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Weekly Schedule Analytics</h3>
                  <div className="flex items-center space-x-2">
                    <button className="px-2 py-1 text-xs bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">
                      Last Week
                    </button>
                    <button className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-md">
                      This Week
                    </button>
                  </div>
                </div>
                <div className="h-60 flex items-center justify-center">
                  <div className="p-2 rounded-full bg-slate-700/50">
                    <BarChart3 size={48} className="text-slate-400" />
                  </div>
                  <p className="ml-2 text-slate-400 text-sm">
                    Interactive charts will be rendered here with real data
                  </p>
                </div>
              </motion.div>

              {/* Usage Distribution */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Room Utilization</h3>
                  <button className="text-xs text-slate-400 hover:text-white">View All</button>
                </div>
                <div className="h-60 flex flex-col items-center justify-center">
                  <div className="p-3 rounded-full bg-slate-700/50 mb-4">
                    <PieChart size={48} className="text-slate-400" />
                  </div>
                  <div className="space-y-3 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="text-xs">Lectures (45%)</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[45%] bg-emerald-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs">Labs (30%)</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[30%] bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-xs">Seminars (25%)</span>
                      </div>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[25%] bg-amber-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Today's Schedule */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Today's Schedule</h3>
                <div className="flex items-center">
                  <button className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 mr-3">
                    <Download size={14} className="mr-1" />
                    Export
                  </button>
                  <button className="text-xs text-slate-400 hover:text-white">View Full Schedule</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Day</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {scheduleData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm">{item.day}</td>
                        <td className="px-4 py-3 text-sm">{item.time}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                            <span className="text-sm font-medium">{item.subject}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.room}</td>
                        <td className="px-4 py-3 text-sm">{item.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Recent Activities & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Activities</h3>
                  <button className="text-xs text-slate-400 hover:text-white">View All</button>
                </div>
                
                <div className="space-y-4">
                  <Activity 
                    icon={<Calendar className="text-emerald-500" size={16} />}
                    title="New Timetable Generated"
                    description="Computer Science - Fall Semester"
                    time="2 hours ago"
                  />
                  <Activity 
                    icon={<User className="text-blue-500" size={16} />}
                    title="New Teacher Added"
                    description="Jane Smith (Mathematics)"
                    time="3 hours ago"
                  />
                  <Activity 
                    icon={<Layout className="text-amber-500" size={16} />}
                    title="Room Assignment Updated"
                    description="Physics Lab relocated to Building B"
                    time="Yesterday"
                  />
                  <Activity 
                    icon={<FileText className="text-rose-500" size={16} />}
                    title="Subject Hours Updated"
                    description="Chemistry hours increased to 5 per week"
                    time="2 days ago"
                  />
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4"
              >
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction 
                    icon={<Plus size={16} />}
                    label="Add Teacher"
                    color="bg-blue-500 hover:bg-blue-600"
                  />
                  <QuickAction 
                    icon={<Plus size={16} />}
                    label="Add Class"
                    color="bg-amber-500 hover:bg-amber-600"
                  />
                  <QuickAction 
                    icon={<Plus size={16} />}
                    label="Add Room"
                    color="bg-emerald-500 hover:bg-emerald-600"
                  />
                  <QuickAction 
                    icon={<Plus size={16} />}
                    label="Add Subject"
                    color="bg-rose-500 hover:bg-rose-600"
                  />
                  <QuickAction 
                    icon={<Calendar size={16} />}
                    label="Schedule View"
                    color="bg-indigo-500 hover:bg-indigo-600"
                    className="col-span-2"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Activity Component
function Activity({ icon, title, description, time }) {
  return (
    <div className="flex items-start">
      <div className="p-2 rounded-lg bg-slate-700/50 mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span className="text-xs text-slate-500">{time}</span>
    </div>
  );
}

// Quick Action Button
function QuickAction({ icon, label, color, className = "" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${color} ${className} text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all duration-300`}
    >
      {icon}
      {label}
    </motion.button>
  );
}