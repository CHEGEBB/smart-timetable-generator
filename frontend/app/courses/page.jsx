"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  Filter, 
  Menu, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash, 
  UserPlus, 
  X,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../sass/fonts.scss";
import { getCourses, createCourse, deleteCourse } from "@/services/courseService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Department colors for visual distinction
const departmentColors = {
  "Computer Science": "emerald",
  "Mathematics": "blue",
  "Physics": "amber",
  "English": "purple",
  "Chemistry": "rose",
  "Biology": "teal",
};

export default function Courses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    department: "",
    credit: "",
    instructor: "",
    students: ""
  });
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await getCourses();
        setCourses(response.data);
        setFilteredCourses(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.error || "Failed to fetch courses");
        setIsLoading(false);
        toast.error(err.error || "Failed to fetch courses");
      }
    };
    
    fetchCourses();
  }, []);
  
  // Get unique departments for filter
  const departments = ["All", ...new Set(courses.map(course => course.department))];

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

  // Filter courses based on search term and selected department
  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment !== "All") {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses, selectedDepartment]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setNewCourse({
        code: "",
        name: "",
        department: "",
        credit: "",
        instructor: "",
        students: ""
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    try {
      // Create course data object from form
      const courseData = {
        ...newCourse,
        credit: parseInt(newCourse.credit),
        students: parseInt(newCourse.students)
      };
      
      // Submit to API
      const response = await createCourse(courseData);
      
      // Add new course to state
      setCourses(prev => [...prev, response.data]);
      
      // Show success message
      toast.success("Course created successfully!");
      
      // Close modal and reset form
      toggleModal();
    } catch (err) {
      toast.error(err.error || "Failed to create course");
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      // Confirm before delete
      if (window.confirm("Are you sure you want to delete this course?")) {
        await deleteCourse(id);
        setCourses(courses.filter(course => course._id !== id));
        toast.success("Course deleted successfully!");
      }
    } catch (err) {
      toast.error(err.error || "Failed to delete course");
    }
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
                  placeholder="Search courses..." 
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Courses</h1>
                <p className="text-slate-400">Manage your courses and add new ones to the system.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Course</span>
                </motion.button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-rose-900/30 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            )}

            {/* Courses Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course._id || course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium bg-${departmentColors[course.department] || 'slate'}-900/30 text-${departmentColors[course.department] || 'slate'}-400 border border-${departmentColors[course.department] || 'slate'}-800/50`}>
                        {course.code}
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors">
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                          onClick={() => handleDeleteCourse(course._id || course.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-1 line-clamp-1">{course.name}</h3>
                    <div className="flex items-center text-slate-400 text-sm mb-3">
                      <Book size={14} className="mr-1" />
                      <span>{course.credit} Credits</span>
                      <span className="mx-2">•</span>
                      <span>{course.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xs">{course.instructor?.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="ml-2 text-sm">{course.instructor}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <UserPlus size={12} className="mr-1" />
                        <span>{course.students} Students</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {!isLoading && !error && filteredCourses.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Book size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Course</span>
                </motion.button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Add Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={toggleModal}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">Add New Course</h2>
                  <button
                    onClick={toggleModal}
                    className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddCourse}>
                  <div className="space-y-4">
                    {/* Course Code */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Book size={16} />
                      </div>
                      <input
                        type="text"
                        name="code"
                        value={newCourse.code}
                        onChange={handleInputChange}
                        required
                        placeholder="Course Code"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Course Name */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Book size={16} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={newCourse.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Course Name"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Department */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Book size={16} />
                      </div>
                      <input
                        type="text"
                        name="department"
                        value={newCourse.department}
                        onChange={handleInputChange}
                        required
                        placeholder="Department"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Credit Hours */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Clock size={16} />
                        </div>
                        <input
                          type="number"
                          name="credit"
                          value={newCourse.credit}
                          onChange={handleInputChange}
                          required
                          placeholder="Credit Hours"
                          min="1"
                          max="6"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Student Capacity */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <UserPlus size={16} />
                        </div>
                        <input
                          type="number"
                          name="students"
                          value={newCourse.students}
                          onChange={handleInputChange}
                          required
                          placeholder="Student Capacity"
                          min="1"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <UserPlus size={16} />
                      </div>
                      <input
                        type="text"
                        name="instructor"
                        value={newCourse.instructor}
                        onChange={handleInputChange}
                        required
                        placeholder="Instructor Name"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-6"
                    >
                      <Plus size={16} />
                      <span>Add Course</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}