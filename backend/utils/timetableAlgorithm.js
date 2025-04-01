/**
 * Timetable Generation Using Genetic Algorithm
 * Implements an evolutionary approach to create optimized conflict-free timetables
 */

// Configuration parameters for the GA
const GA_CONFIG = {
  populationSize: 50,        // Number of timetables in each generation
  maxGenerations: 100,       // Maximum number of generations to evolve
  tournamentSize: 5,         // Number of individuals in tournament selection
  crossoverRate: 0.8,        // Probability of crossover
  mutationRate: 0.2,         // Probability of mutation
  elitismCount: 2            // Number of best solutions to carry forward unchanged
};

// Helper function to check if a slot is available for teacher, room, and class
const isSlotAvailable = (schedule, day, period, teacherName, roomName, className) => {
  return !schedule.some(slot => 
    slot.day === day && 
    slot.period === period && 
    (slot.teacher === teacherName || slot.room === roomName || slot.class === className)
  );
};

// Create a random timetable (one individual in the population)
const createRandomTimetable = (classes, teachers, rooms, courses, constraints = {}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periodsPerDay = constraints.periodsPerDay || 7;
  const schedule = [];
  
  // For each class
  for (const classData of classes) {
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
        continue; // Skip if no eligible teachers
      }
      
      // Assign required number of hours
      let assignedHours = 0;
      let maxAttempts = 100; // Prevent infinite loops
      
      while (assignedHours < hoursPerWeek && maxAttempts > 0) {
        maxAttempts--;
        
        // Randomly select day, period, teacher and room
        const day = days[Math.floor(Math.random() * days.length)];
        const period = Math.floor(Math.random() * periodsPerDay) + 1;
        const teacher = eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Check if slot is available and teacher is available at this time
        const teacherAvailable = !teacher.availability || 
                                !teacher.availability[day] || 
                                teacher.availability[day][period - 1];
                                
        if (teacherAvailable && isSlotAvailable(schedule, day, period, teacher.name, room.name, classData.name)) {
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
        }
      }
    }
  }
  
  return {
    name: 'Random Timetable',
    createdAt: new Date(),
    schedule
  };
};

// Calculate fitness of a timetable (higher is better)
const calculateFitness = (timetable, classes, teachers, courses, constraints = {}) => {
  const schedule = timetable.schedule;
  let fitness = 0;
  
  // 1. Give base score for each successfully scheduled class
  fitness += schedule.length * 10;
  
  // 2. Check for constraint violations
  const violations = {
    teacherConflicts: 0,
    roomConflicts: 0,
    classConflicts: 0,
    teacherAvailabilityViolations: 0,
    gapsInTeacherSchedule: 0,
    gapsInClassSchedule: 0,
    subjectDistribution: 0  // Subjects should be distributed across the week, not back-to-back
  };
  
  // Check for direct conflicts
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const a = schedule[i];
      const b = schedule[j];
      
      if (a.day === b.day && a.period === b.period) {
        // Same teacher can't be in two places
        if (a.teacher === b.teacher) {
          violations.teacherConflicts++;
        }
        
        // Same room can't be used by two classes
        if (a.room === b.room) {
          violations.roomConflicts++;
        }
        
        // Same class can't have two subjects at once
        if (a.class === b.class) {
          violations.classConflicts++;
        }
      }
    }
  }
  
  // Check teacher availability
  for (const slot of schedule) {
    const teacher = teachers.find(t => t.name === slot.teacher);
    
    if (teacher && teacher.availability && 
        teacher.availability[slot.day] && 
        !teacher.availability[slot.day][slot.period - 1]) {
      violations.teacherAvailabilityViolations++;
    }
  }
  
  // Check for gaps in teacher schedules
  const teacherSchedules = {};
  for (const slot of schedule) {
    if (!teacherSchedules[slot.teacher]) {
      teacherSchedules[slot.teacher] = {};
    }
    if (!teacherSchedules[slot.teacher][slot.day]) {
      teacherSchedules[slot.teacher][slot.day] = [];
    }
    teacherSchedules[slot.teacher][slot.day].push(slot.period);
  }
  
  for (const teacher in teacherSchedules) {
    for (const day in teacherSchedules[teacher]) {
      const periods = teacherSchedules[teacher][day].sort((a, b) => a - b);
      
      // Count gaps > 1 period
      for (let i = 1; i < periods.length; i++) {
        const gap = periods[i] - periods[i-1] - 1;
        if (gap > 1) {
          violations.gapsInTeacherSchedule += gap;
        }
      }
    }
  }
  
  // Check for gaps in class schedules
  const classSchedules = {};
  for (const slot of schedule) {
    if (!classSchedules[slot.class]) {
      classSchedules[slot.class] = {};
    }
    if (!classSchedules[slot.class][slot.day]) {
      classSchedules[slot.class][slot.day] = [];
    }
    classSchedules[slot.class][slot.day].push(slot.period);
  }
  
  for (const className in classSchedules) {
    for (const day in classSchedules[className]) {
      const periods = classSchedules[className][day].sort((a, b) => a - b);
      
      // Count gaps in student day
      for (let i = 1; i < periods.length; i++) {
        const gap = periods[i] - periods[i-1] - 1;
        if (gap > 1) {
          violations.gapsInClassSchedule += gap;
        }
      }
    }
  }
  
  // Check subject distribution across the week
  const classSubjectDistribution = {};
  for (const slot of schedule) {
    const key = `${slot.class}_${slot.subject}`;
    if (!classSubjectDistribution[key]) {
      classSubjectDistribution[key] = {};
    }
    if (!classSubjectDistribution[key][slot.day]) {
      classSubjectDistribution[key][slot.day] = 0;
    }
    classSubjectDistribution[key][slot.day]++;
  }
  
  // Penalize multiple sessions of the same subject on the same day
  for (const key in classSubjectDistribution) {
    for (const day in classSubjectDistribution[key]) {
      if (classSubjectDistribution[key][day] > 1) {
        violations.subjectDistribution += classSubjectDistribution[key][day] - 1;
      }
    }
  }
  
  // Calculate penalty based on violations
  const penaltyScore = 
    violations.teacherConflicts * 100 +
    violations.roomConflicts * 100 +
    violations.classConflicts * 100 +
    violations.teacherAvailabilityViolations * 50 +
    violations.gapsInTeacherSchedule * 2 +
    violations.gapsInClassSchedule * 3 +
    violations.subjectDistribution * 5;
  
  // Subtract penalties from base fitness
  fitness -= penaltyScore;
  
  // 3. Calculate how many required subject hours were successfully scheduled
  const scheduledHours = {};
  for (const slot of schedule) {
    const key = `${slot.class}_${slot.subject}`;
    if (!scheduledHours[key]) {
      scheduledHours[key] = 0;
    }
    scheduledHours[key]++;
  }
  
  // Check if all required hours are scheduled
  let requiredHoursScore = 0;
  for (const classData of classes) {
    for (const subjectName of classData.subjects) {
      const course = courses.find(c => c.name === subjectName);
      const requiredHours = course ? course.hoursPerWeek : 1;
      const key = `${classData.name}_${subjectName}`;
      const actualHours = scheduledHours[key] || 0;
      
      // Reward for matching required hours exactly
      if (actualHours === requiredHours) {
        requiredHoursScore += 50;
      } else {
        // Penalize for not meeting requirements
        requiredHoursScore -= Math.abs(requiredHours - actualHours) * 20;
      }
    }
  }
  
  fitness += requiredHoursScore;
  
  return Math.max(1, fitness); // Ensure fitness is at least 1
};

// Tournament selection - select individuals for reproduction
const tournamentSelection = (population, fitnesses) => {
  const tournament = [];
  const tournamentFitnesses = [];
  
  for (let i = 0; i < GA_CONFIG.tournamentSize; i++) {
    const index = Math.floor(Math.random() * population.length);
    tournament.push(population[index]);
    tournamentFitnesses.push(fitnesses[index]);
  }
  
  // Find the index of the winner (highest fitness)
  const winnerIndex = tournamentFitnesses.indexOf(Math.max(...tournamentFitnesses));
  return tournament[winnerIndex];
};

// Crossover two parent timetables to create offspring
const crossover = (parent1, parent2, classes, teachers, rooms, courses, constraints) => {
  if (Math.random() > GA_CONFIG.crossoverRate) {
    // Just return a copy of parent1 if no crossover
    return JSON.parse(JSON.stringify(parent1));
  }
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const child = {
    name: 'Crossover Timetable',
    createdAt: new Date(),
    schedule: []
  };
  
  // Randomly select crossover point (which day to split at)
  const crossoverPoint = Math.floor(Math.random() * days.length);
  
  // Take schedule from parent1 for days before crossover point
  for (let i = 0; i <= crossoverPoint; i++) {
    const day = days[i];
    const slotsForDay = parent1.schedule.filter(slot => slot.day === day);
    child.schedule.push(...JSON.parse(JSON.stringify(slotsForDay)));
  }
  
  // Take schedule from parent2 for days after crossover point
  for (let i = crossoverPoint + 1; i < days.length; i++) {
    const day = days[i];
    const slotsForDay = parent2.schedule.filter(slot => slot.day === day);
    child.schedule.push(...JSON.parse(JSON.stringify(slotsForDay)));
  }
  
  // Fix any conflicts that might have been introduced by crossover
  resolveConflicts(child, classes, teachers, rooms);
  
  return child;
};

// Resolve conflicts in a timetable
const resolveConflicts = (timetable, classes, teachers, rooms) => {
  const schedule = timetable.schedule;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periodsPerDay = 7; // Should match constraints
  
  // Find and resolve direct conflicts (same teacher, room, or class at same time)
  for (let day of days) {
    for (let period = 1; period <= periodsPerDay; period++) {
      // Get all slots for this day and period
      const slotsForTimeslot = schedule.filter(
        slot => slot.day === day && slot.period === period
      );
      
      if (slotsForTimeslot.length <= 1) continue;
      
      // Check for conflicts
      const teachers = new Set();
      const rooms = new Set();
      const classes = new Set();
      
      const conflictIndices = [];
      
      for (let i = 0; i < slotsForTimeslot.length; i++) {
        const slot = slotsForTimeslot[i];
        
        // Check for conflicts
        if (teachers.has(slot.teacher) || 
            rooms.has(slot.room) || 
            classes.has(slot.class)) {
          // Mark this slot as conflicting
          conflictIndices.push(schedule.indexOf(slot));
        }
        
        teachers.add(slot.teacher);
        rooms.add(slot.room);
        classes.add(slot.class);
      }
      
      // Remove conflicting slots
      for (let i = conflictIndices.length - 1; i >= 0; i--) {
        schedule.splice(conflictIndices[i], 1);
      }
    }
  }
};

// Mutate a timetable
const mutate = (timetable, classes, teachers, rooms, constraints = {}) => {
  if (Math.random() > GA_CONFIG.mutationRate) {
    return timetable; // No mutation
  }
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periodsPerDay = constraints.periodsPerDay || 7;
  
  // Clone the timetable
  const mutatedTimetable = JSON.parse(JSON.stringify(timetable));
  const schedule = mutatedTimetable.schedule;
  
  // Choose mutation type randomly
  const mutationType = Math.floor(Math.random() * 3);
  
  switch (mutationType) {
    case 0: // Move a random slot to a new day/period
      if (schedule.length > 0) {
        const slotIndex = Math.floor(Math.random() * schedule.length);
        const slot = schedule[slotIndex];
        
        // Try up to 10 times to find a valid new timeslot
        for (let attempt = 0; attempt < 10; attempt++) {
          const newDay = days[Math.floor(Math.random() * days.length)];
          const newPeriod = Math.floor(Math.random() * periodsPerDay) + 1;
          
          // Check if new slot is available
          if (isSlotAvailable(schedule.filter((_, i) => i !== slotIndex), 
                              newDay, newPeriod, slot.teacher, slot.room, slot.class)) {
            slot.day = newDay;
            slot.period = newPeriod;
            break;
          }
        }
      }
      break;
      
    case 1: // Swap two random slots
      if (schedule.length > 1) {
        const index1 = Math.floor(Math.random() * schedule.length);
        let index2 = Math.floor(Math.random() * schedule.length);
        
        // Ensure index2 is different from index1
        while (index2 === index1) {
          index2 = Math.floor(Math.random() * schedule.length);
        }
        
        // Swap day and period
        const slot1 = schedule[index1];
        const slot2 = schedule[index2];
        
        const tempDay = slot1.day;
        const tempPeriod = slot1.period;
        
        slot1.day = slot2.day;
        slot1.period = slot2.period;
        
        slot2.day = tempDay;
        slot2.period = tempPeriod;
      }
      break;
      
    case 2: // Change room for a random slot
      if (schedule.length > 0 && rooms.length > 1) {
        const slotIndex = Math.floor(Math.random() * schedule.length);
        const slot = schedule[slotIndex];
        
        // Choose a different room
        let newRoomIndex = Math.floor(Math.random() * rooms.length);
        while (rooms[newRoomIndex].name === slot.room) {
          newRoomIndex = Math.floor(Math.random() * rooms.length);
        }
        
        // Check if the new room is available for this timeslot
        if (isSlotAvailable(schedule.filter((_, i) => i !== slotIndex), 
                            slot.day, slot.period, slot.teacher, rooms[newRoomIndex].name, slot.class)) {
          slot.room = rooms[newRoomIndex].name;
        }
      }
      break;
  }
  
  return mutatedTimetable;
};

// Main genetic algorithm function
const generateTimetableGA = (classes, teachers, rooms, courses, constraints = {}) => {
  console.log('Starting genetic algorithm timetable generation...');
  
  // Initialize population
  let population = [];
  for (let i = 0; i < GA_CONFIG.populationSize; i++) {
    population.push(createRandomTimetable(classes, teachers, rooms, courses, constraints));
  }
  
  let bestTimetable = null;
  let bestFitness = -Infinity;
  
  // Evolution loop
  for (let generation = 0; generation < GA_CONFIG.maxGenerations; generation++) {
    // Calculate fitness for each individual
    const fitnesses = population.map(timetable => 
      calculateFitness(timetable, classes, teachers, courses, constraints)
    );
    
    // Find the best individual
    const maxFitness = Math.max(...fitnesses);
    const bestIndex = fitnesses.indexOf(maxFitness);
    
    if (maxFitness > bestFitness) {
      bestFitness = maxFitness;
      bestTimetable = JSON.parse(JSON.stringify(population[bestIndex]));
      console.log(`Generation ${generation}: New best fitness: ${bestFitness}`);
    }
    
    // Create new population
    const newPopulation = [];
    
    // Elitism - carry over best individuals
    const sortedIndices = [...Array(fitnesses.length).keys()]
      .sort((a, b) => fitnesses[b] - fitnesses[a]);
      
    for (let i = 0; i < GA_CONFIG.elitismCount; i++) {
      newPopulation.push(JSON.parse(JSON.stringify(population[sortedIndices[i]])));
    }
    
    // Create rest of new population
    while (newPopulation.length < GA_CONFIG.populationSize) {
      // Select parents
      const parent1 = tournamentSelection(population, fitnesses);
      const parent2 = tournamentSelection(population, fitnesses);
      
      // Create child through crossover
      let child = crossover(parent1, parent2, classes, teachers, rooms, courses, constraints);
      
      // Mutate child
      child = mutate(child, classes, teachers, rooms, constraints);
      
      newPopulation.push(child);
    }
    
    // Replace old population
    population = newPopulation;
  }
  
  // Final optimization phase
  optimizeTimetable(bestTimetable.schedule);
  
  bestTimetable.name = 'GA Generated Timetable';
  bestTimetable.fitness = bestFitness;
  
  return bestTimetable;
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
  generateTimetableGA
};