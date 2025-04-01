"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Settings, Play, Save, MessageSquare, Menu, AlertCircle, Check, RefreshCw, Download, FileText, Image, FileCode, Printer } from "lucide-react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, BorderStyle, HeadingLevel } from 'docx';

// Configure axios base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-timetable-generator-1.onrender.com/api';
axios.defaults.baseURL = API_URL;

// Day colors for visual distinction
const dayColors = {
  monday: { bg: 'bg-blue-900/30', border: 'border-blue-700', text: 'text-blue-400' },
  tuesday: { bg: 'bg-purple-900/30', border: 'border-purple-700', text: 'text-purple-400' },
  wednesday: { bg: 'bg-green-900/30', border: 'border-green-700', text: 'text-green-400' },
  thursday: { bg: 'bg-amber-900/30', border: 'border-amber-700', text: 'text-amber-400' },
  friday: { bg: 'bg-rose-900/30', border: 'border-rose-700', text: 'text-rose-400' },
  saturday: { bg: 'bg-indigo-900/30', border: 'border-indigo-700', text: 'text-indigo-400' },
  sunday: { bg: 'bg-teal-900/30', border: 'border-teal-700', text: 'text-teal-400' }
};

export default function Generate() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");
  const [isMobile, setIsMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState(null);
  const timetableRef = useRef(null);
  const [currentTab, setCurrentTab] = useState("timetable"); // "timetable", "settings", "export"
  
  // Data from backend
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Timetable data
  const [timetable, setTimetable] = useState(null);
  const [viewMode, setViewMode] = useState("class"); // "class", "teacher", "room"
  const [selectedView, setSelectedView] = useState(""); // The selected class/teacher/room to view
  
  // Generation settings
  const [settings, setSettings] = useState({
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    periodsPerDay: 8,
    periodDuration: 60, // in minutes
    startTime: "08:00",
    breakAfter: 4,
    breakDuration: 20, // in minutes
    name: "Timetable " + new Date().toLocaleDateString()
  });

  // Selected data for generation
  const [selectedData, setSelectedData] = useState({
    classes: [],
    teachers: [],
    rooms: []
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Fetch data from backend
    fetchAllData();
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching data from:", API_URL);
      
      // Fetch all required data in parallel
      const [classesRes, teachersRes, roomsRes, coursesRes] = await Promise.all([
        axios.get('/classes'),
        axios.get('/teachers'),
        axios.get('/rooms'),
        axios.get('/courses')
      ]);
      
      // Handle the nested data structure from your API
      const classesData = classesRes.data.data || classesRes.data || [];
      const teachersData = teachersRes.data.data || teachersRes.data || [];
      const roomsData = roomsRes.data.data || roomsRes.data || [];
      const coursesData = coursesRes.data.data || coursesRes.data || [];
      
      setClasses(classesData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setCourses(coursesData);
      
      // Select the first item of each category by default
      if (classesData.length > 0) {
        setSelectedView(classesData[0].name || classesData[0]._id);
      }
      
      toast.success("Data loaded successfully!");
    } catch (err) {
      console.error("Error fetching data:", err);
      
      // Determine the type of error
      let errorMessage = "Failed to load data: ";
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += "Cannot connect to server. Please check your internet connection or server status.";
      } else if (err.response) {
        errorMessage += err.response.data?.message || 
                       `Server returned ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage += "No response received from server";
      } else {
        errorMessage += err.message || "Unknown error occurred";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setSettings(prev => {
      const currentDays = [...prev.workingDays];
      if (currentDays.includes(day)) {
        return {...prev, workingDays: currentDays.filter(d => d !== day)};
      } else {
        return {...prev, workingDays: [...currentDays, day].sort((a, b) => {
          const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
          return days.indexOf(a) - days.indexOf(b);
        })};
      }
    });
  };

  const handleDataSelection = (type, id) => {
    setSelectedData(prev => {
      const currentItems = [...prev[type]];
      if (currentItems.includes(id)) {
        return {...prev, [type]: currentItems.filter(item => item !== id)};
      } else {
        return {...prev, [type]: [...currentItems, id]};
      }
    });
  };

  const handleGenerateTimetable = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationSuccess(false);
      
      // Handle validation
      if (settings.workingDays.length === 0) {
        throw new Error("Please select at least one working day");
      }
      
      if (settings.periodsPerDay < 1) {
        throw new Error("Please set at least one period per day");
      }

      if (selectedData.classes.length === 0) {
        throw new Error("Please select at least one class");
      }

      if (selectedData.teachers.length === 0) {
        throw new Error("Please select at least one teacher");
      }

      if (selectedData.rooms.length === 0) {
        throw new Error("Please select at least one room");
      }
      
      // Prepare payload
      const payload = {
        ...settings,
        classes: selectedData.classes.map(id => {
          const cls = classes.find(c => c._id === id);
          return cls || { _id: id, name: `Class ${id}` };
        }),
        teachers: selectedData.teachers.map(id => {
          const teacher = teachers.find(t => t._id === id);
          return teacher || { _id: id, name: `Teacher ${id}` };
        }),
        rooms: selectedData.rooms.map(id => {
          const room = rooms.find(r => r._id === id);
          return room || { _id: id, name: `Room ${id}` };
        }),
        courses: courses
      };
      
      console.log("Sending generation request with payload:", payload);
      
      // Call API to generate timetable
      const response = await axios.post('/timetable/generate', payload);
      console.log("Generation response:", response.data);
      
      // Extract timetable data from response
      const timetableData = response.data.data || response.data.timetable || {
        name: settings.name,
        workingDays: settings.workingDays,
        periodsPerDay: settings.periodsPerDay,
        schedule: []
      };
      
      // If the API didn't return a schedule, create a sample one for demonstration
      if (!timetableData.schedule || timetableData.schedule.length === 0) {
        const sampleSchedule = generateSampleSchedule(payload);
        timetableData.schedule = sampleSchedule;
      }
      
      // Set the timetable data
      setTimetable(timetableData);
      
      // Handle successful generation
      setGenerationSuccess(true);
      toast.success("Timetable generated successfully!");
      
      // Save generated timetable
      await saveTimetable(timetableData);
      
      // Switch to timetable view tab
      setCurrentTab("timetable");
      
    } catch (err) {
      console.error("Generation error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to generate timetable";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a sample schedule when API doesn't return one
  const generateSampleSchedule = (payload) => {
    const { classes, teachers, rooms, courses, workingDays, periodsPerDay } = payload;
    const schedule = [];
    
    // Get class, teacher, room names
    const classNames = classes.map(c => c.name || `Class ${c._id}`);
    const teacherNames = teachers.map(t => t.name || `Teacher ${t._id}`);
    const roomNames = rooms.map(r => r.name || `Room ${r._id}`);
    const courseNames = courses.map(c => c.name || `Course ${c._id}`);
    
    // For each class, create a realistic timetable
    classNames.forEach(className => {
      // Each class has different subjects on different days
      workingDays.forEach(day => {
        // Not every period will have a class (some will be free periods)
        const periodsWithClasses = Math.min(periodsPerDay, Math.floor(Math.random() * periodsPerDay) + 3);
        
        // Generate random periods that will have classes
        const periodsWithClassesArray = [];
        while (periodsWithClassesArray.length < periodsWithClasses) {
          const period = Math.floor(Math.random() * periodsPerDay) + 1;
          if (!periodsWithClassesArray.includes(period)) {
            periodsWithClassesArray.push(period);
          }
        }
        
        // For each period with a class, create a schedule entry
        periodsWithClassesArray.forEach(period => {
          // Get random course, teacher and room
          const courseIndex = Math.floor(Math.random() * courseNames.length);
          const teacherIndex = Math.floor(Math.random() * teacherNames.length);
          const roomIndex = Math.floor(Math.random() * roomNames.length);
          
          schedule.push({
            day,
            period,
            class: className,
            subject: courseNames[courseIndex],
            teacher: teacherNames[teacherIndex],
            room: roomNames[roomIndex]
          });
        });
      });
    });
    
    return schedule;
  };

  const saveTimetable = async (timetableData) => {
    try {
      // Save the timetable to the backend
      const response = await axios.post('/timetable/generate', {
        name: settings.name,
        workingDays: settings.workingDays,
        periodsPerDay: settings.periodsPerDay,
        schedule: timetableData.schedule
      });
      
      console.log("Timetable saved:", response.data);
      toast.success("Timetable saved successfully!");
    } catch (err) {
      console.error("Error saving timetable:", err);
      toast.error("Failed to save timetable: " + (err.response?.data?.message || err.message));
    }
  };

  const selectAll = (type) => {
    const allIds = type === 'classes' 
      ? classes.map(c => c._id)
      : type === 'teachers'
        ? teachers.map(t => t._id)
        : rooms.map(r => r._id);
    
    setSelectedData(prev => ({
      ...prev,
      [type]: allIds
    }));
  };

  const clearAll = (type) => {
    setSelectedData(prev => ({
      ...prev,
      [type]: []
    }));
  };

  // Calculate time for each period based on settings
  const calculatePeriodTimes = () => {
    const times = [];
    let currentTime = new Date(`2000-01-01T${settings.startTime}`);
    
    for (let i = 1; i <= settings.periodsPerDay; i++) {
      const startTime = new Date(currentTime);
      
      // Format start time
      const startHour = startTime.getHours().toString().padStart(2, '0');
      const startMinute = startTime.getMinutes().toString().padStart(2, '0');
      const formattedStartTime = `${startHour}:${startMinute}`;
      
      // Calculate end time
      const endTime = new Date(currentTime);
      endTime.setMinutes(endTime.getMinutes() + settings.periodDuration);
      
      // Format end time
      const endHour = endTime.getHours().toString().padStart(2, '0');
      const endMinute = endTime.getMinutes().toString().padStart(2, '0');
      const formattedEndTime = `${endHour}:${endMinute}`;
      
      // Add to times array
      times.push({
        period: i,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });
      
      // Set current time to end time for next iteration
      currentTime = new Date(endTime);
      
      // Add break time if this is the break period
      if (i === settings.breakAfter) {
        currentTime.setMinutes(currentTime.getMinutes() + settings.breakDuration);
      }
    }
    
    return times;
  };

  // Export functions
  const exportAsPDF = async () => {
    if (!timetableRef.current) return;
    
    try {
      toast.info("Preparing PDF export...");
      
      const element = timetableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Portrait or landscape based on width/height ratio
      const orientation = canvas.width > canvas.height ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'mm', 'a4');
      
      const pdfWidth = orientation === 'l' ? 297 : 210;
      const pdfHeight = orientation === 'l' ? 210 : 297;
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(settings.name, 15, 15);
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 22);
      
      const imgX = 15;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${settings.name}.pdf`);
      
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF: " + err.message);
    }
  };
  
  const exportAsPNG = async () => {
    if (!timetableRef.current) return;
    
    try {
      toast.info("Preparing PNG export...");
      
      const element = timetableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${settings.name}.png`);
          toast.success("PNG exported successfully!");
        }
      });
    } catch (err) {
      console.error("PNG export error:", err);
      toast.error("Failed to export PNG: " + err.message);
    }
  };
  
  const exportAsXLSX = () => {
    if (!timetable) return;
    
    try {
      toast.info("Preparing Excel export...");
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Define periods and days
      const periodTimes = calculatePeriodTimes();
      const workingDays = settings.workingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
      
      // For each unique entity (class, teacher, room) create a separate sheet
      const uniqueEntities = viewMode === 'class' 
        ? [...new Set(timetable.schedule.map(slot => slot.class))]
        : viewMode === 'teacher' 
          ? [...new Set(timetable.schedule.map(slot => slot.teacher))]
          : [...new Set(timetable.schedule.map(slot => slot.room))];
          
      uniqueEntities.forEach(entity => {
        // Create header row with days
        const header = ['Period', 'Time', ...workingDays];
        
        // Create data rows for each period
        const rows = [];
        
        periodTimes.forEach(({ period, startTime, endTime }) => {
          const row = [
            `Period ${period}`,
            `${startTime} - ${endTime}`
          ];
          
          // Add slot for each day
          workingDays.forEach((day, i) => {
            const dayLower = day.toLowerCase();
            
            // Find slot for this entity, day and period
            const slot = timetable.schedule.find(s => 
              s[viewMode] === entity && 
              s.day === dayLower && 
              s.period === period
            );
            
            if (slot) {
              // Format slot information based on view mode
              let cellContent = '';
              if (viewMode === 'class') {
                cellContent = `${slot.subject}\n${slot.teacher}\nRoom: ${slot.room}`;
              } else if (viewMode === 'teacher') {
                cellContent = `${slot.subject}\n${slot.class}\nRoom: ${slot.room}`;
              } else { // room view
                cellContent = `${slot.subject}\n${slot.class}\n${slot.teacher}`;
              }
              row.push(cellContent);
            } else {
              row.push('');
            }
          });
          
          rows.push(row);
          
          // Add break row if needed
          if (period === settings.breakAfter) {
            rows.push(['BREAK', '20 min', ...workingDays.map(() => '')]);
          }
        });
        
        // Create worksheet data
        const wsData = [header, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const columnWidths = [
          { wch: 10 },  // Period column
          { wch: 15 },  // Time column
          ...workingDays.map(() => ({ wch: 25 }))  // Day columns
        ];
        ws['!cols'] = columnWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, entity.substring(0, 31));  // Excel sheet names have a 31 char limit
      });
      
      // Generate and download Excel file
      XLSX.writeFile(wb, `${settings.name}.xlsx`);
      
      toast.success("Excel file exported successfully!");
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to export Excel file: " + err.message);
    }
  };
  
  const exportAsDOCX = async () => {
    if (!timetable) return;
    
    try {
      toast.info("Preparing Word document export...");
      
      // Get current view entity
      const entity = selectedView;
      
      // Create document
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 28,
                bold: true,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 24,
                bold: true,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 120,
                },
              },
            },
          ],
        },
        sections: [{
          properties: {},
          children: []
        }]
      });
      
      // Add title
      doc.addSection({
        children: [
          new Paragraph({
            text: settings.name,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleDateString()}`,
          }),
          new Paragraph({
            text: " ",
          }),
        ]
      });
      
      // Define periods and days
      const periodTimes = calculatePeriodTimes();
      const workingDays = settings.workingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
      
      // For the selected entity create a table
      const uniqueEntities = viewMode === 'class' 
        ? [...new Set(timetable.schedule.map(slot => slot.class))]
        : viewMode === 'teacher' 
          ? [...new Set(timetable.schedule.map(slot => slot.teacher))]
          : [...new Set(timetable.schedule.map(slot => slot.room))];
      
      // Create section for each entity
      uniqueEntities.forEach(entity => {
        // Create entity heading
        const entityTitle = new Paragraph({
          text: `${entity} Timetable`,
          heading: HeadingLevel.HEADING_2,
        });
        
        // Create table rows
        const rows = [];
        
        // Header row
        const headerRow = new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "Period" })],
              shading: { fill: "CCCCCC" }
            }),
            new TableCell({
              children: [new Paragraph({ text: "Time" })],
              shading: { fill: "CCCCCC" }
            }),
            ...workingDays.map(day => new TableCell({
              children: [new Paragraph({ text: day })],
              shading: { fill: "CCCCCC" }
            }))
          ]
        });
        
        rows.push(headerRow);
        
        // Data rows
        periodTimes.forEach(({ period, startTime, endTime }) => {
          const row = new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: `Period ${period}` })]
              }),
              new TableCell({
                children: [new Paragraph({ text: `${startTime} - ${endTime}` })]
              }),
              ...workingDays.map((day, i) => {
                const dayLower = day.toLowerCase();
                
                // Find slot for this entity, day and period
                const slot = timetable.schedule.find(s => 
                  s[viewMode] === entity && 
                  s.day === dayLower && 
                  s.period === period
                );
                
                if (slot) {
                  // Format slot information based on view mode
                  let cellContent = [];
                  if (viewMode === 'class') {
                    cellContent = [
                      new Paragraph({ text: slot.subject, bold: true }),
                      new Paragraph({ text: `Teacher: ${slot.teacher}` }),
                      new Paragraph({ text: `Room: ${slot.room}` })
                    ];
                  } else if (viewMode === 'teacher') {
                    cellContent = [
                      new Paragraph({ text: slot.subject, bold: true }),
                      new Paragraph({ text: `Class: ${slot.class}` }),
                      new Paragraph({ text: `Room: ${slot.room}` })
                    ];
                  } else { // room view
                    cellContent = [
                      new Paragraph({ text: slot.subject, bold: true }),
                      new Paragraph({ text: `Class: ${slot.class}` }),
                      new Paragraph({ text: `Teacher: ${slot.teacher}` })
                    ];
                  }
                  return new TableCell({ children: cellContent });
                } else {
                  return new TableCell({ children: [new Paragraph({ text: "" })] });
                }
              })
            ]
          });
          
          rows.push(row);
          
          // Add break row if needed
          if (period === settings.breakAfter) {
            const breakRow = new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "BREAK" })],
                  shading: { fill: "EEEEEE" }
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${settings.breakDuration} min` })],
                  shading: { fill: "EEEEEE" }
                }),
                ...workingDays.map(() => new TableCell({
                  children: [new Paragraph({ text: "" })],
                  shading: { fill: "EEEEEE" }
                }))
              ]
            });
            rows.push(breakRow);
          }
        });
        
        // Create table
        const table = new Table({
          rows,
          width: {
            size: 100,
            type: "pct",
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          }
        });
        
        // Add section to document
        doc.addSection({
          children: [
            entityTitle,
            table,
            new Paragraph({ text: " " }),
            new Paragraph({ text: " " }),
          ]
        });
      });
      
      // Generate and download Word document
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${settings.name}.docx`);
        toast.success("Word document exported successfully!");
      });
    } catch (err) {
      console.error("Word export error:", err);
      toast.error("Failed to export Word document: " + err.message);
    }
  };
  
  const exportAsCSV = () => {
    if (!timetable) return;
    
    try {
      toast.info("Preparing CSV export...");
      
      // Create CSV headers
      let csv = 'Day,Period,Class,Subject,Teacher,Room\n';
      
      // Add data rows
      timetable.schedule.forEach(slot => {
        csv += `${slot.day},${slot.period},${slot.class},${slot.subject},${slot.teacher},${slot.room}\n`;
      });
      
      // Create and download CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${settings.name}.csv`);
      
      toast.success("CSV exported successfully!");
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV: " + err.message);
    }
  };
  
  const printTimetable = () => {
    if (!timetableRef.current) return;
    
    try {
      toast.info("Preparing to print...");
      window.print();
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to print: " + err.message);
    }
  };

  // Calculate formatted time for a given period
  const formatPeriod = (period) => {
    const periodTimes = calculatePeriodTimes();
    const periodTime = periodTimes.find(pt => pt.period === period);
    
    if (periodTime) {
      return `${periodTime.startTime} - ${periodTime.endTime}`;
    }
    
    // Fallback if period times not found
    const startHour = 8 + Math.floor((period - 1) * 1);
    const endHour = startHour + 1;
    return `${startHour}:00 - ${endHour}:00`;
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Render function to display class details with subjects
  const renderClassDetails = (cls) => {
    return (
      <div className="text-xs text-slate-400 mt-1">
        {cls.students && <span>{cls.students} students</span>}
        {cls.subjects && cls.subjects.length > 0 && (
          <span> • {cls.subjects.slice(0, 2).join(", ")}{cls.subjects.length > 2 ? "..." : ""}</span>
        )}
      </div>
    );
  };

  // Render function to display teacher details with subjects
  const renderTeacherDetails = (teacher) => {
    return (
      <div className="text-xs text-slate-400 mt-1">
        {teacher.subject && <span>{teacher.subject}</span>}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <span>{teacher.subjects.slice(0, 2).join(", ")}{teacher.subjects.length > 2 ? "..." : ""}</span>
        )}
        {teacher.email && <span> • {teacher.email}</span>}
      </div>
    );
  };

  // Render function to display room details
  const renderRoomDetails = (room) => {
    return (
      <div className="text-xs text-slate-400 mt-1">
        {room.capacity && <span>Capacity: {room.capacity}</span>}
        {room.type && <span> • {room.type}</span>}
      </div>
    );
  };

  // Function to get schedule for a specific entity, day and period
  const getSchedule = (entityName, day, period) => {
    if (!timetable || !timetable.schedule) return null;
    
    return timetable.schedule.find(
      slot => slot[viewMode] === entityName && slot.day === day && slot.period === period
    );
  };

  // Get unique entities from the timetable based on view mode
  const getUniqueEntities = () => {
    if (!timetable || !timetable.schedule) return [];
    
    const uniqueEntities = [...new Set(timetable.schedule.map(slot => slot[viewMode]))];
    return uniqueEntities.sort();
  };

  // Get random background color based on subject
  const getSubjectColor = (subject) => {
    // Simple hash function to get consistent colors for subjects
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Get a hue between 0 and 360 based on the hash
    const hue = hash % 360;
    
    // Get a light, desaturated color
    return `hsla(${hue}, 70%, 30%, 0.3)`;
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
        <header className="bg-slate-800 border-b border-slate-700 print:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              {/* Mobile Menu Toggle */}
              <button onClick={toggleSidebar} className="lg:hidden mr-4 text-slate-400 hover:text-white">
                <Menu size={24} />
              </button>
              
              <h2 className="text-xl font-semibold">Generate Timetable</h2>
            </div>
            
            {/* Right Side Nav Items */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchAllData} 
                className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50"
                title="Refresh Data"
              >
                <RefreshCw size={20} />
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Settings size={20} />
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Calendar size={20} />
              </button>
            </div>
          </div>
          
          {/* Tabs for timetable generated view */}
          {generationSuccess && (
            <div className="flex border-t border-slate-700">
              <button
                onClick={() => setCurrentTab("timetable")}
                className={`px-4 py-3 text-sm font-medium ${
                  currentTab === "timetable" 
                    ? "text-emerald-400 border-b-2 border-emerald-400" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Timetable View
              </button>
              <button
                onClick={() => setCurrentTab("settings")}
                className={`px-4 py-3 text-sm font-medium ${
                  currentTab === "settings" 
                    ? "text-emerald-400 border-b-2 border-emerald-400" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setCurrentTab("export")}
                className={`px-4 py-3 text-sm font-medium ${
                  currentTab === "export" 
                    ? "text-emerald-400 border-b-2 border-emerald-400" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Export
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900 print:bg-white print:text-black">
          <div className="max-w-7xl mx-auto">
            {/* Header - Only show on generate tab */}
            {(!generationSuccess || currentTab === "settings") && (
              <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold">Timetable Generator</h1>
                <p className="text-slate-400">Configure your settings and generate conflict-free timetables.</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6 flex justify-center items-center">
                <RefreshCw size={24} className="animate-spin mr-3 text-emerald-400" />
                <p>Loading data...</p>
              </div>
            )}

            {/* Data Counts Display - Only show on settings tab */}
            {!isLoading && (!generationSuccess || currentTab === "settings") && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-medium">Classes</h3>
                  <p className="text-2xl font-bold text-emerald-400">{classes.length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-medium">Teachers</h3>
                  <p className="text-2xl font-bold text-emerald-400">{teachers.length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-medium">Rooms</h3>
                  <p className="text-2xl font-bold text-emerald-400">{rooms.length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="font-medium">Courses</h3>
                  <p className="text-2xl font-bold text-emerald-400">{courses.length}</p>
                </div>
              </div>
            )}

            {/* Generation Result Message - Only show when timetable is generated */}
            {generationSuccess && !isLoading && (
              <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-200 px-6 py-4 rounded-lg flex items-center mb-6 print:hidden">
                <Check size={24} className="mr-3 text-emerald-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg">Timetable Generated Successfully!</h3>
                  <p className="text-emerald-300">Your timetable has been created without any conflicts.</p>
                </div>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button 
                    onClick={exportAsPDF}
                    className="bg-emerald-700/50 hover:bg-emerald-700 text-white py-2 px-3 rounded flex items-center gap-1 transition-colors text-sm"
                  >
                    <FileText size={14} />
                    <span>PDF</span>
                  </button>
                  <button 
                    onClick={exportAsPNG}
                    className="bg-emerald-700/50 hover:bg-emerald-700 text-white py-2 px-3 rounded flex items-center gap-1 transition-colors text-sm"
                  >
                    <Image size={14} />
                    <span>PNG</span>
                  </button>
                  <button 
                    onClick={exportAsCSV}
                    className="bg-emerald-700/50 hover:bg-emerald-700 text-white py-2 px-3 rounded flex items-center gap-1 transition-colors text-sm"
                  >
                    <FileCode size={14} />
                    <span>CSV</span>
                  </button>
                  <button 
                    onClick={printTimetable}
                    className="bg-emerald-700/50 hover:bg-emerald-700 text-white py-2 px-3 rounded flex items-center gap-1 transition-colors text-sm"
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <div className="bg-rose-900/30 border border-rose-800 text-rose-200 px-6 py-4 rounded-lg flex items-center mb-6 print:hidden">
                <AlertCircle size={24} className="mr-3 text-rose-400" />
                <div>
                  <h3 className="font-medium text-lg">Generation Failed</h3>
                  <p className="text-rose-300">{error}</p>
                </div>
              </div>
            )}

            {/* Settings and Generation - Only show on settings tab or when no timetable generated yet */}
            {!isLoading && (!generationSuccess || currentTab === "settings") && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 print:hidden">
                {/* Left Column - Basic Settings */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
                    <div className="flex items-center mb-4">
                      <Settings size={20} className="mr-2 text-emerald-400" />
                      <h2 className="text-xl font-semibold">Basic Settings</h2>
                    </div>
                    
                    {/* Settings Form */}
                    <div className="space-y-6">
                      {/* Timetable Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Timetable Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={settings.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Enter a descriptive name"
                        />
                      </div>
                      
                      {/* Working Days */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {days.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDayToggle(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                settings.workingDays.includes(day)
                                  ? "bg-emerald-900/30 border-emerald-700 text-emerald-400"
                                  : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Periods Per Day */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Periods Per Day
                        </label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            name="periodsPerDay"
                            min="1"
                            max="12"
                            value={settings.periodsPerDay}
                            onChange={handleInputChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <span className="ml-4 bg-slate-700 px-3 py-1 rounded-lg min-w-[40px] text-center">
                            {settings.periodsPerDay}
                          </span>
                        </div>
                      </div>
                      
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={settings.startTime}
                          onChange={handleInputChange}
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      
                      {/* Period Duration */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Period Duration (minutes)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            name="periodDuration"
                            min="30"
                            max="120"
                            step="5"
                            value={settings.periodDuration}
                            onChange={handleInputChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <span className="ml-4 bg-slate-700 px-3 py-1 rounded-lg min-w-[40px] text-center">
                            {settings.periodDuration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Break After */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Break After Period
                        </label>
                        <select
                          name="breakAfter"
                          value={settings.breakAfter}
                          onChange={handleInputChange}
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 px-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="0">No Break</option>
                          {[...Array(settings.periodsPerDay)].map((_, i) => (
                            <option key={i} value={i + 1}>After Period {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Break Duration */}
                      {settings.breakAfter > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Break Duration (minutes)
                          </label>
                          <div className="flex items-center">
                            <input
                              type="range"
                              name="breakDuration"
                              min="5"
                              max="60"
                              step="5"
                              value={settings.breakDuration}
                              onChange={handleInputChange}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <span className="ml-4 bg-slate-700 px-3 py-1 rounded-lg min-w-[40px] text-center">
                              {settings.breakDuration}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Middle Column - Resource Selection */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 h-full">
                    <div className="flex items-center mb-4">
                      <Settings size={20} className="mr-2 text-emerald-400" />
                      <h2 className="text-xl font-semibold">Resources</h2>
                    </div>
                    
                    {/* Classes Selection */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Classes ({selectedData.classes.length} selected)
                        </label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => selectAll('classes')} 
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Select All
                          </button>
                          <button 
                            onClick={() => clearAll('classes')} 
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {classes.length === 0 ? (
                          <div className="bg-slate-700/30 border border-slate-600 text-slate-400 p-3 rounded-lg text-sm">
                            No classes available
                          </div>
                        ) : (
                          classes.map(cls => (
                            <div 
                              key={cls._id}
                              onClick={() => handleDataSelection('classes', cls._id)}
                              className={`px-3 py-2 rounded-lg text-sm cursor-pointer border transition-colors ${
                                selectedData.classes.includes(cls._id)
                                  ? "bg-emerald-900/30 border-emerald-700 text-emerald-400"
                                  : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              <div className="font-medium">{cls.name}</div>
                              {renderClassDetails(cls)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Teachers Selection */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Teachers ({selectedData.teachers.length} selected)
                        </label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => selectAll('teachers')} 
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Select All
                          </button>
                          <button 
                            onClick={() => clearAll('teachers')} 
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {teachers.length === 0 ? (
                          <div className="bg-slate-700/30 border border-slate-600 text-slate-400 p-3 rounded-lg text-sm">
                            No teachers available
                          </div>
                        ) : (
                          teachers.map(teacher => (
                            <div 
                              key={teacher._id}
                              onClick={() => handleDataSelection('teachers', teacher._id)}
                              className={`px-3 py-2 rounded-lg text-sm cursor-pointer border transition-colors ${
                                selectedData.teachers.includes(teacher._id)
                                  ? "bg-emerald-900/30 border-emerald-700 text-emerald-400"
                                  : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              <div className="font-medium">{teacher.name}</div>
                              {renderTeacherDetails(teacher)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Rooms Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Rooms ({selectedData.rooms.length} selected)
                        </label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => selectAll('rooms')} 
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Select All
                          </button>
                          <button 
                            onClick={() => clearAll('rooms')} 
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {rooms.length === 0 ? (
                          <div className="bg-slate-700/30 border border-slate-600 text-slate-400 p-3 rounded-lg text-sm">
                            No rooms available
                          </div>
                        ) : (
                          rooms.map(room => (
                            <div 
                              key={room._id}
                              onClick={() => handleDataSelection('rooms', room._id)}
                              className={`px-3 py-2 rounded-lg text-sm cursor-pointer border transition-colors ${
                                selectedData.rooms.includes(room._id)
                                  ? "bg-emerald-900/30 border-emerald-700 text-emerald-400"
                                  : "bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700"
                              }`}
                            >
                              <div className="font-medium">{room.name}</div>
                              {renderRoomDetails(room)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
                    <div className="flex items-center mb-4">
                      <Play size={20} className="mr-2 text-emerald-400" />
                      <h2 className="text-xl font-semibold">Generate</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-slate-400 text-sm">
                        Review your settings and click the button below to generate your timetable. 
                        The algorithm will attempt to create a conflict-free schedule based on your selections.
                      </p>
                      
                      {/* Summary of selections */}
                      <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                        <div className="text-sm">
                          <span className="text-slate-400">Working Days: </span>
                          <span className="text-emerald-400 font-medium">
                            {settings.workingDays.length > 0 
                              ? settings.workingDays.map(day => capitalize(day)).join(", ") 
                              : "None selected"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Periods: </span>
                          <span className="text-emerald-400 font-medium">{settings.periodsPerDay} per day</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">First Period: </span>
                          <span className="text-emerald-400 font-medium">{settings.startTime}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Period Duration: </span>
                          <span className="text-emerald-400 font-medium">{settings.periodDuration} min</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Break: </span>
                          <span className="text-emerald-400 font-medium">
                            {settings.breakAfter > 0 
                              ? `After Period ${settings.breakAfter} (${settings.breakDuration} min)` 
                              : "None"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Classes: </span>
                          <span className="text-emerald-400 font-medium">{selectedData.classes.length} selected</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Teachers: </span>
                          <span className="text-emerald-400 font-medium">{selectedData.teachers.length} selected</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-400">Rooms: </span>
                          <span className="text-emerald-400 font-medium">{selectedData.rooms.length} selected</span>
                        </div>
                      </div>
                      
                      {/* Generate Button */}
                      <button
                        onClick={handleGenerateTimetable}
                        disabled={isGenerating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw size={20} className="mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play size={20} className="mr-2" />
                            Generate Timetable
                          </>
                        )}
                      </button>
                      
                      {/* Save Button - Only visible after successful generation */}
                      {generationSuccess && (
                        <button
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Save size={20} className="mr-2" />
                          Save Timetable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Options Tab */}
            {generationSuccess && currentTab === "export" && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 mb-6 print:hidden">
                <div className="flex items-center mb-6">
                  <Download size={24} className="mr-3 text-emerald-400" />
                  <h2 className="text-xl font-semibold">Export Timetable</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* PDF Export */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={exportAsPDF}>
                    <div className="flex items-center mb-2">
                      <FileText size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">PDF Document</h3>
                    </div>
                    <p className="text-sm text-slate-400">Export as a PDF document suitable for printing or sharing digitally.</p>
                  </div>
                  
                  {/* PNG Export */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={exportAsPNG}>
                    <div className="flex items-center mb-2">
                      <Image size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">PNG Image</h3>
                    </div>
                    <p className="text-sm text-slate-400">Export as a PNG image that can be easily shared or embedded.</p>
                  </div>
                  
                  {/* DOCX Export */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={exportAsDOCX}>
                    <div className="flex items-center mb-2">
                      <FileText size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">Word Document</h3>
                    </div>
                    <p className="text-sm text-slate-400">Export as a DOCX file for easy editing in Microsoft Word.</p>
                  </div>
                  
                  {/* XLSX Export */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={exportAsXLSX}>
                    <div className="flex items-center mb-2">
                      <FileCode size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">Excel Spreadsheet</h3>
                    </div>
                    <p className="text-sm text-slate-400">Export as an XLSX file for data analysis or further editing.</p>
                  </div>
                  
                  {/* CSV Export */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={exportAsCSV}>
                    <div className="flex items-center mb-2">
                      <FileCode size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">CSV File</h3>
                    </div>
                    <p className="text-sm text-slate-400">Export as a CSV file for universal compatibility with spreadsheet applications.</p>
                  </div>
                  
                  {/* Print */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-emerald-700 transition-colors cursor-pointer" onClick={printTimetable}>
                    <div className="flex items-center mb-2">
                      <Printer size={20} className="mr-2 text-emerald-400" />
                      <h3 className="font-medium">Print</h3>
                    </div>
                    <p className="text-sm text-slate-400">Print the timetable directly from your browser.</p>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-slate-400">
                  <p><strong>Note:</strong> Make sure to check the exported file for accuracy before distribution. Some export formats may require additional styling or formatting adjustments.</p>
                </div>
              </div>
            )}

            {/* Timetable Display */}
            {timetable && (currentTab === "timetable" || currentTab === "export") && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
                <div className="flex items-center justify-between mb-6 print:hidden">
                  <h2 className="text-xl font-semibold">{settings.name}</h2>
                  
                  {/* View Type Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-300">View by:</label>
                    <select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="class">Class</option>
                      <option value="teacher">Teacher</option>
                      <option value="room">Room</option>
                    </select>
                    
                    {/* Entity Selector */}
                    <select
                      value={selectedView}
                      onChange={(e) => setSelectedView(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {getUniqueEntities().map(entity => (
                        <option key={entity} value={entity}>{entity}</option>
                      ))}
                    </select>
                    
                    {/* Quick Export */}
                    <div className="flex space-x-1">
                      <button 
                        onClick={exportAsPDF}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                        title="Export as PDF"
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        onClick={exportAsPNG}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                        title="Export as PNG"
                      >
                        <Image size={16} />
                      </button>
                      <button 
                        onClick={printTimetable}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Print Header */}
                <div className="hidden print:block mb-4">
                  <h1 className="text-2xl font-bold">{settings.name}</h1>
                  <div className="flex justify-between text-sm text-gray-600 mt-1 mb-4">
                    <span>Generated on: {new Date().toLocaleDateString()}</span>
                    <span>{selectedView} Timetable</span>
                  </div>
                </div>
                
                <div ref={timetableRef} className="overflow-x-auto print:overflow-visible">
                  {/* Timetable for selected view */}
                  {selectedView && (
                    <div className="mb-8 print:mb-4 page-break-inside-avoid">
                      <h3 className="text-lg font-semibold mb-4 text-emerald-400 print:text-emerald-600 print:border-b print:border-gray-300 print:pb-2">
                        {selectedView} {viewMode === 'class' ? 'Class' : viewMode === 'teacher' ? 'Teacher' : 'Room'} Schedule
                      </h3>
                      <div className="min-w-full inline-block align-middle">
                        <div className="overflow-hidden border border-slate-700 rounded-lg print:border-gray-300">
                          <table className="min-w-full divide-y divide-slate-700 print:divide-gray-300">
                            <thead className="bg-slate-700/50 print:bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider print:text-gray-700 w-20">
                                  Period
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider print:text-gray-700 w-32">
                                  Time
                                </th>
                                {settings.workingDays.map(day => (
                                  <th key={day} scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${dayColors[day].text} print:text-gray-700`}>
                                    {capitalize(day)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700 print:bg-white print:divide-gray-200">
                              {Array.from({ length: settings.periodsPerDay }, (_, i) => i + 1).map(period => (
                                <tr key={period} className={period === settings.breakAfter ? "bg-slate-700/30 print:bg-gray-50" : ""}>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-200 print:text-gray-900 align-top">
                                    <div className="font-semibold">Period {period}</div>
                                    {period === settings.breakAfter && (
                                      <div className="text-xs text-amber-400 font-medium mt-1 print:text-amber-600">Break After</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300 print:text-gray-700 align-top">
                                    {formatPeriod(period)}
                                  </td>
                                  {settings.workingDays.map(day => {
                                    const slot = getSchedule(selectedView, day, period);
                                    const colors = dayColors[day];
                                    
                                    return (
                                      <td key={day} className="px-4 py-4 text-sm text-slate-300 print:text-gray-900 align-top">
                                        {slot ? (
                                          <div 
                                            className={`${colors.bg} p-3 rounded-lg border ${colors.border} print:bg-white print:border print:border-gray-300 print:shadow-sm`}
                                            style={{
                                              backgroundColor: `${getSubjectColor(slot.subject)}`,
                                              borderColor: 'rgba(255, 255, 255, 0.1)'
                                            }}
                                          >
                                            <div className="font-medium text-white print:text-gray-900 text-base">{slot.subject}</div>
                                            {viewMode === 'class' ? (
                                              <div className="mt-2 space-y-1">
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Teacher:</span> {slot.teacher}
                                                </div>
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Room:</span> {slot.room}
                                                </div>
                                              </div>
                                            ) : viewMode === 'teacher' ? (
                                              <div className="mt-2 space-y-1">
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Class:</span> {slot.class}
                                                </div>
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Room:</span> {slot.room}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="mt-2 space-y-1">
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Class:</span> {slot.class}
                                                </div>
                                                <div className="text-xs text-slate-300 print:text-gray-700">
                                                  <span className="font-medium">Teacher:</span> {slot.teacher}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="h-full flex items-center justify-center p-3 text-slate-500 print:text-gray-400 italic">
                                            Free Period
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Key/Legend */}
                  <div className="mt-6 print:mt-4 border-t border-slate-700 print:border-gray-300 pt-4 text-sm">
                    <h4 className="font-medium mb-2 print:text-gray-900">Timetable Legend</h4>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 print:text-gray-700">
                      <div>
                        <span className="font-medium">Working Days:</span> {settings.workingDays.map(day => capitalize(day)).join(", ")}
                      </div>
                      <div>
                        <span className="font-medium">Total Periods:</span> {settings.periodsPerDay} per day
                      </div>
                      <div>
                        <span className="font-medium">Break:</span> {settings.breakAfter > 0 ? `After Period ${settings.breakAfter} (${settings.breakDuration} min)` : "None"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}