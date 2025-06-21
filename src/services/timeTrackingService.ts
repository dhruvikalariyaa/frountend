import { encrypt, decrypt } from '@/utils/encryption';

export interface TimeTracking {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface BreakRecord {
  startTime: Date;
  endTime?: Date;
  duration: TimeTracking;
  reason?: string;
  approved?: boolean;
}

export interface DailyTimeRecord {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  totalWorkTime: TimeTracking;
  totalBreakTime: TimeTracking;
  breaks: BreakRecord[];
  notes?: string;
  efficiency: number;
}

export interface WeeklyReport {
  weekStartDate: string;
  totalWorkHours: number;
  averageEfficiency: number;
  totalBreakTime: number;
  mostProductiveDay: string;
}

class TimeTrackingService {
  private readonly STORAGE_KEY = 'timeTracking';
  private readonly HISTORY_KEY = 'timeTrackingHistory';
  private readonly MAX_HISTORY_DAYS = 30;

  // Get current tracking state with decryption
  public getCurrentState() {
    const encryptedData = localStorage.getItem(this.STORAGE_KEY);
    if (!encryptedData) return null;
    
    try {
      return JSON.parse(decrypt(encryptedData));
    } catch (error) {
      console.error('Error reading time tracking state:', error);
      return null;
    }
  }

  // Save current state with encryption
  public saveCurrentState(data: any) {
    try {
      const encryptedData = encrypt(JSON.stringify(data));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving time tracking state:', error);
    }
  }

  // Save daily record on checkout
  public saveDailyRecord(record: DailyTimeRecord) {
    try {
      const history = this.getTimeHistory();
      history.unshift(record);
      
      // Keep only last 30 days
      if (history.length > this.MAX_HISTORY_DAYS) {
        history.pop();
      }

      const encryptedHistory = encrypt(JSON.stringify(history));
      localStorage.setItem(this.HISTORY_KEY, encryptedHistory);
    } catch (error) {
      console.error('Error saving daily record:', error);
    }
  }

  // Get time tracking history
  public getTimeHistory(): DailyTimeRecord[] {
    try {
      const encryptedHistory = localStorage.getItem(this.HISTORY_KEY);
      if (!encryptedHistory) return [];

      return JSON.parse(decrypt(encryptedHistory));
    } catch (error) {
      console.error('Error reading time history:', error);
      return [];
    }
  }

  // Generate weekly report
  public generateWeeklyReport(startDate: Date): WeeklyReport {
    const history = this.getTimeHistory();
    const weekRecords = history.filter(record => {
      const recordDate = new Date(record.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      return recordDate >= startDate && recordDate < endDate;
    });

    if (weekRecords.length === 0) {
      return {
        weekStartDate: startDate.toISOString(),
        totalWorkHours: 0,
        averageEfficiency: 0,
        totalBreakTime: 0,
        mostProductiveDay: '-'
      };
    }

    const totalWorkHours = weekRecords.reduce((total, record) => {
      return total + (record.totalWorkTime.hours + record.totalWorkTime.minutes / 60);
    }, 0);

    const averageEfficiency = weekRecords.reduce((total, record) => {
      return total + record.efficiency;
    }, 0) / weekRecords.length;

    const totalBreakTime = weekRecords.reduce((total, record) => {
      return total + (record.totalBreakTime.hours * 60 + record.totalBreakTime.minutes);
    }, 0);

    const mostProductiveDay = weekRecords.reduce((most, record) => {
      return record.efficiency > most.efficiency ? record : most;
    }).date;

    return {
      weekStartDate: startDate.toISOString(),
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      averageEfficiency: Math.round(averageEfficiency),
      totalBreakTime: Math.round(totalBreakTime),
      mostProductiveDay
    };
  }

  // Format time for display
  public formatTime(time: TimeTracking): string {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  }

  // Calculate time difference in minutes
  public calculateTimeDifference(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // Validate break duration
  public validateBreakDuration(duration: number): boolean {
    const MAX_BREAK_DURATION = 60; // 60 minutes
    return duration <= MAX_BREAK_DURATION;
  }

  // Clear all data (for logout)
  public clearData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
  }
}

export const timeTrackingService = new TimeTrackingService(); 