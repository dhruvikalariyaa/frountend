import { format, addDays } from 'date-fns';

// Types
export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  employeeId: string;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late';
  workingHours: string;
  notes?: string;
}

export interface AttendanceStats {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalHoursThisWeek: number;
  presentPercentage: string;
  absentPercentage: string;
  latePercentage: string;
  hoursPercentage: string;
}

// Mock data
const mockEmployees: Employee[] = [
  { id: 1, name: "Raj Patel", department: "Engineering", position: "Senior Developer", employeeId: "EMP001" },
  { id: 2, name: "Priya Shah", department: "Marketing", position: "Marketing Manager", employeeId: "EMP002" },
  { id: 3, name: "Amit Kumar", department: "Sales", position: "Sales Executive", employeeId: "EMP003" },
  { id: 4, name: "Neha Sharma", department: "HR", position: "HR Manager", employeeId: "EMP004" },
  { id: 5, name: "Vikram Singh", department: "Engineering", position: "Full Stack Developer", employeeId: "EMP005" },
  { id: 6, name: "Meera Desai", department: "Finance", position: "Financial Analyst", employeeId: "EMP006" },
  { id: 7, name: "Arjun Reddy", department: "Operations", position: "Operations Manager", employeeId: "EMP007" },
  { id: 8, name: "Ananya Gupta", department: "Marketing", position: "Digital Marketing Specialist", employeeId: "EMP008" },
  { id: 9, name: "Karthik Iyer", department: "Engineering", position: "Backend Developer", employeeId: "EMP009" },
  { id: 10, name: "Zara Khan", department: "Design", position: "UI/UX Designer", employeeId: "EMP010" }
];

// Helper functions
const generateMockAttendance = () => {
  const data: AttendanceRecord[] = [];
  const today = new Date();

  mockEmployees.forEach(employee => {
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Higher probability of being present on weekdays
      const attendanceProbability = isWeekend ? 0.2 : 0.9;
      const isPresent = Math.random() < attendanceProbability;
      
      let checkIn = '-';
      let checkOut = '-';
      let status: 'Present' | 'Late' | 'Absent' = 'Absent';
      let workingHours = '0h';

      if (isPresent) {
        const lateCheckInProbability = 0.2;
        const isLate = Math.random() < lateCheckInProbability;
        
        const hour = isLate ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2);
        const minute = Math.floor(Math.random() * 60);
        checkIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const checkOutHour = 17 + Math.floor(Math.random() * 3);
        const checkOutMinute = Math.floor(Math.random() * 60);
        checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;
        
        status = isLate ? 'Late' : 'Present';
        
        const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (hour * 60 + minute);
        workingHours = `${Math.floor(totalMinutes / 60)}h`;
      }

      data.push({
        id: data.length + 1,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        date: format(date, 'yyyy-MM-dd'),
        status,
        checkIn,
        checkOut,
        workingHours
      });
    }
  });

  return data;
};

// Service class
class AttendanceService {
  private attendanceData: AttendanceRecord[] = generateMockAttendance();

  // GET methods
  async getEmployees(): Promise<Employee[]> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/employees');
    return mockEmployees;
  }

  async getAttendanceRecords(filters: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: number;
    department?: string;
    status?: string;
    search?: string;
  }): Promise<AttendanceRecord[]> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/attendance', { params: filters });
    
    let filteredData = [...this.attendanceData];

    if (filters.startDate && filters.endDate) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= filters.startDate! && recordDate <= filters.endDate!;
      });
    }

    if (filters.employeeId) {
      filteredData = filteredData.filter(record => record.employeeId === filters.employeeId);
    }

    if (filters.department && filters.department !== 'all') {
      filteredData = filteredData.filter(record => record.department === filters.department);
    }

    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter(record => 
        record.status.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(record =>
        record.employeeName.toLowerCase().includes(searchLower) ||
        record.employeeId.toString().includes(searchLower)
      );
    }

    return filteredData;
  }

  async getAttendanceStats(date: Date): Promise<AttendanceStats> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/attendance/stats', { params: { date } });
    
    const todayStr = format(date, 'yyyy-MM-dd');
    const todayRecords = this.attendanceData.filter(record => record.date === todayStr);
    
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const absent = todayRecords.filter(r => r.status === 'Absent').length;
    const late = todayRecords.filter(r => r.status === 'Late').length;
    
    const weekStart = addDays(date, -7);
    const weekRecords = this.attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= date;
    });

    const totalHours = weekRecords.reduce((acc, curr) => {
      const hours = parseInt(curr.workingHours) || 0;
      return acc + hours;
    }, 0);

    return {
      presentToday: present,
      absentToday: absent,
      lateToday: late,
      totalHoursThisWeek: totalHours,
      presentPercentage: "+5%",
      absentPercentage: "-2%",
      latePercentage: "0%",
      hoursPercentage: "+3%"
    };
  }

  // POST methods
  async markAttendance(data: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    // When integrating with real API, replace with actual API call
    // return await axios.post('/api/attendance', data);
    
    const newRecord = {
      ...data,
      id: this.attendanceData.length + 1
    };
    
    this.attendanceData.unshift(newRecord);
    return newRecord;
  }

  // Export methods
  async exportAttendance(filters: {
    startDate: Date;
    endDate: Date;
    department?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/attendance/export', { params: filters });
    
    return this.getAttendanceRecords(filters);
  }
}

export const attendanceService = new AttendanceService(); 