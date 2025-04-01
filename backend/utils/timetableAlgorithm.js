/**
 * Timetable Generation Algorithm
 * Implements a constraint-based scheduling algorithm to create conflict-free timetables
 */

// Helper function to check if a slot is available for teacher, room, and class
const isSlotAvailable = (schedule, day, period, teacherName, roomName, className) => {
  return !schedule.some(slot => 
    slot.day === day && 
    slot.period === period && 
    (slot.teacher === teacherName || slot.room === roomName || slot.class === className)
  );
};

// Generate a timetable based on classes, teachers, rooms, and courses
const generateTimetable = (classes, teachers, rooms, courses, constraints = {}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periodsPerDay = constraints.periodsPerDay || 7;
  const schedule = [];
  
  // Sort classes by the number of subjects (more subjects first for better allocation)
  const sortedClasses = [...classes].sort((a, b) => b.subjects.length - a.subjects.length);
  
  // For each class
  for (const classData of sortedClasses) {
    // For each subject required by the class
    for (const subjectName of classData.subjects) {
      // Find course details to get hours per week
      const course = courses.find(c => c.name === subjectName);
      const hoursPerWeek = course ? course.hoursPerWeek : 1; // Default to 1 if not specified
      
      // Find teachers who can teach this subject
      const eligibleTeachers = teachers.filter(teacher => 
        teacher.subjects.includes(subjectName)
      );
      
      if (eligibleTeachers.length === 0) {
        console.warn(`No eligible teachers found for ${subjectName} in class ${classData.name}`);
        continue;
      }
      
      // Assign required number of hours
      let assignedHours = 0;
      
      // Try to distribute subject hours evenly across the week
      while (assignedHours < hoursPerWeek) {
        let assigned = false;
        
        // Try each day and period
        for (const day of days) {
          if (assigned) break;
          
          for (let period = 1; period <= periodsPerDay; period++) {
            if (assigned) break;
            
            // Try each eligible teacher
            for (const teacher of eligibleTeachers) {
              if (assigned) break;
              
              // Check teacher availability for this slot
              if (!teacher.availability || 
                  !teacher.availability[day] || 
                  !teacher.availability[day][period - 1]) {
                continue;
              }
              
              // Try each available room
              for (const room of rooms) {
                // Check if slot is available for teacher, room, and class
                if (isSlotAvailable(schedule, day, period, teacher.name, room.name, classData.name)) {
                  // Assign the slot
                  schedule.push({
                    day,
                    period,
                    class: classData.name,
                    subject: subjectName,
                    teacher: teacher.name,
                    room: room.name
                  });
                  
                  assignedHours++;
                  assigned = true;
                  break;
                }
              }
            }
          }
        }
        
        // If we couldn't assign a slot, break to avoid infinite loop
        if (!assigned) {
          console.warn(`Could not assign all hours for ${subjectName} in class ${classData.name}`);
          break;
        }
      }
    }
  }
  
  // Additional optimization phase
  optimizeTimetable(schedule);
  
  return {
    name: 'Generated Timetable',
    createdAt: new Date(),
    schedule
  };
};

// Optimization phase to minimize gaps and improve teacher schedules
const optimizeTimetable = (schedule) => {
  // Get unique teachers
  const teachers = [...new Set(schedule.map(slot => slot.teacher))];
  
  for (const teacher of teachers) {
    // Group teacher's schedule by day
    const teacherScheduleByDay = {};
    
    schedule
      .filter(slot => slot.teacher === teacher)
      .forEach(slot => {
        if (!teacherScheduleByDay[slot.day]) {
          teacherScheduleByDay[slot.day] = [];
        }
        teacherScheduleByDay[slot.day].push(slot);
      });
    
    // For each day, minimize gaps in teacher's schedule
    for (const day in teacherScheduleByDay) {
      const daySchedule = teacherScheduleByDay[day].sort((a, b) => a.period - b.period);
      
      // Check for gaps > 1 period
      for (let i = 1; i < daySchedule.length; i++) {
        const gap = daySchedule[i].period - daySchedule[i-1].period - 1;
        if (gap > 1) {
          // Try to move a later class to fill the gap
          const targetPeriod = daySchedule[i-1].period + 1;
          
          // Look for candidate slots that can be moved
          const candidateSlot = schedule.find(slot => 
            slot.teacher !== teacher && 
            slot.day === day && 
            slot.period === targetPeriod &&
            !schedule.some(s => 
              s.day === day && 
              s.period === daySchedule[i].period &&
              (s.class === slot.class || s.room === slot.room)
            )
          );
          
          if (candidateSlot) {
            // Swap periods
            const slotToMove = daySchedule[i];
            const tempPeriod = slotToMove.period;
            slotToMove.period = candidateSlot.period;
            candidateSlot.period = tempPeriod;
          }
        }
      }
    }
  }
};

module.exports = {
  generateTimetable
};