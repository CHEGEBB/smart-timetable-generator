import axios from 'axios';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-timetable-generator-1.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Something went wrong';
    return Promise.reject({ error: message });
  }
);

// Get all data functions
export const getClasses = async () => {
  try {
    const response = await api.get('/classes');
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeachers = async () => {
  try {
    const response = await api.get('/teachers');
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const getRooms = async () => {
  try {
    const response = await api.get('/rooms');
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get('/courses');
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

// Generate a new timetable
export const generateTimetable = async (config) => {
  try {
    const response = await api.post('/timetable/generate', config);
    return response.data.data || response.data.timetable || response.data;
  } catch (error) {
    throw error;
  }
};

// Save a generated timetable
export const saveTimetable = async (timetableData) => {
  try {
    const response = await api.post('/timetable', timetableData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all timetables (just names and creation dates for listing)
export const getAllTimetables = async () => {
  try {
    const response = await api.get('/timetable');
    return response.data.timetables || response.data;
  } catch (error) {
    throw error;
  }
};

// Get a specific timetable by ID
export const getTimetableById = async (id) => {
  try {
    const response = await api.get(`/timetable/${id}`);
    return response.data.timetable || response.data;
  } catch (error) {
    throw error;
  }
};

// Get timetable for a specific teacher
export const getTeacherTimetable = async (name) => {
  try {
    const response = await api.get(`/timetable/teacher/${name}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get timetable for a specific class
export const getClassTimetable = async (name) => {
  try {
    const response = await api.get(`/timetable/class/${name}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get timetable for a specific room
export const getRoomTimetable = async (name) => {
  try {
    const response = await api.get(`/timetable/room/${name}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a timetable
export const deleteTimetable = async (id) => {
  try {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export functions - Client side generation
export const exportTimetableAsPDF = async (timetableRef, name) => {
  if (!timetableRef.current) {
    throw new Error("Timetable reference is required");
  }
  
  try {
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
    pdf.text(name, 15, 15);
    
    // Add generation date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 22);
    
    const imgX = 15;
    const imgY = 30;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${name}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
};

export const exportTimetableAsPNG = async (timetableRef, name) => {
  if (!timetableRef.current) {
    throw new Error("Timetable reference is required");
  }
  
  try {
    const element = timetableRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${name}.png`);
          resolve(true);
        } else {
          reject(new Error("Failed to create PNG blob"));
        }
      });
    });
  } catch (error) {
    console.error("Error exporting PNG:", error);
    throw error;
  }
};

export const exportTimetableAsCSV = (timetable, name) => {
  if (!timetable || !timetable.schedule) {
    throw new Error("Timetable data is required");
  }
  
  try {
    // Create CSV headers
    let csv = 'Day,Period,Class,Subject,Teacher,Room\n';
    
    // Add data rows
    timetable.schedule.forEach(slot => {
      csv += `${slot.day},${slot.period},${slot.class},${slot.subject},${slot.teacher},${slot.room}\n`;
    });
    
    // Create and download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${name}.csv`);
    
    return true;
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
};

export const exportTimetableAsXLSX = (timetable, settings, viewMode, selectedView, name) => {
  if (!timetable || !timetable.schedule) {
    throw new Error("Timetable data is required");
  }
  
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Calculate period times
    const startTime = new Date(`2000-01-01T${settings.startTime}`);
    const periodTimes = [];
    
    for (let i = 1; i <= settings.periodsPerDay; i++) {
      const periodStartTime = new Date(startTime);
      periodStartTime.setMinutes(periodStartTime.getMinutes() + (i-1) * settings.periodDuration);
      
      const periodEndTime = new Date(periodStartTime);
      periodEndTime.setMinutes(periodEndTime.getMinutes() + settings.periodDuration);
      
      // Format times
      const startTimeStr = `${periodStartTime.getHours().toString().padStart(2, '0')}:${periodStartTime.getMinutes().toString().padStart(2, '0')}`;
      const endTimeStr = `${periodEndTime.getHours().toString().padStart(2, '0')}:${periodEndTime.getMinutes().toString().padStart(2, '0')}`;
      
      periodTimes.push({
        period: i,
        startTime: startTimeStr,
        endTime: endTimeStr
      });
      
      // Add break time if needed
      if (i === settings.breakAfter && i < settings.periodsPerDay) {
        startTime.setMinutes(startTime.getMinutes() + settings.breakDuration);
      }
    }
    
    // Define days
    const workingDays = settings.workingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1));
    
    // Determine unique entities based on view mode
    const uniqueEntities = viewMode === 'class' 
      ? [...new Set(timetable.schedule.map(slot => slot.class))]
      : viewMode === 'teacher' 
        ? [...new Set(timetable.schedule.map(slot => slot.teacher))]
        : [...new Set(timetable.schedule.map(slot => slot.room))];
        
    // If a specific view is selected, only export that one
    const entitiesToExport = selectedView ? [selectedView] : uniqueEntities;
        
    entitiesToExport.forEach(entity => {
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
              cellContent = `${slot.subject}\nTeacher: ${slot.teacher}\nRoom: ${slot.room}`;
            } else if (viewMode === 'teacher') {
              cellContent = `${slot.subject}\nClass: ${slot.class}\nRoom: ${slot.room}`;
            } else { // room view
              cellContent = `${slot.subject}\nClass: ${slot.class}\nTeacher: ${slot.teacher}`;
            }
            row.push(cellContent);
          } else {
            row.push('Free Period');
          }
        });
        
        rows.push(row);
        
        // Add break row if needed
        if (period === settings.breakAfter) {
          rows.push(['BREAK', `${settings.breakDuration} min`, ...workingDays.map(() => '')]);
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
    XLSX.writeFile(wb, `${name}.xlsx`);
    
    return true;
  } catch (error) {
    console.error("Error exporting XLSX:", error);
    throw error;
  }
};

// Server-side export
export const exportTimetablePdfFromServer = async (id) => {
  try {
    const response = await api.get(`/timetable/${id}/export/pdf`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    saveAs(blob, `timetable-${id}.pdf`);
    
    return true;
  } catch (error) {
    throw error;
  }
};

export const exportTimetableDocxFromServer = async (id) => {
  try {
    const response = await api.get(`/timetable/${id}/export/docx`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `timetable-${id}.docx`);
    
    return true;
  } catch (error) {
    throw error;
  }
};