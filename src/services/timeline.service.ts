import axiosInstance from '../lib/axios';
import { TimelineEntry } from '../types/models';

export interface CreateTimelineEntryRequest {
  referenceType: 'candidate' | 'interview' | 'job' | 'employee';
  referenceId: string;
  type: TimelineEntry['type'];
  subType: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface UpdateTimelineEntryRequest {
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TimelineFilters {
  referenceType?: string;
  type?: string;
  subType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TimelineResponse {
  data: TimelineEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class TimelineService {
  private baseUrl = '/api/v1/timeline';

  // GET timeline entries for a reference
  async getTimelineByReference(
    referenceId: string, 
    filters: TimelineFilters = {}
  ): Promise<TimelineResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = `${this.baseUrl}/reference/${referenceId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get<TimelineResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }

  // POST create timeline entry
  async createTimelineEntry(data: CreateTimelineEntryRequest): Promise<TimelineEntry> {
    try {
      const response = await axiosInstance.post<{ data: TimelineEntry }>(
        `${this.baseUrl}/reference/${data.referenceId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating timeline entry:', error);
      throw error;
    }
  }

  // PUT update timeline entry
  async updateTimelineEntry(
    entryId: string, 
    data: UpdateTimelineEntryRequest
  ): Promise<TimelineEntry> {
    try {
      const response = await axiosInstance.put<{ data: TimelineEntry }>(
        `${this.baseUrl}/${entryId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating timeline entry:', error);
      throw error;
    }
  }

  // DELETE timeline entry
  async deleteTimelineEntry(entryId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${entryId}`);
    } catch (error) {
      console.error('Error deleting timeline entry:', error);
      throw error;
    }
  }

  // GET single timeline entry
  async getTimelineEntry(entryId: string): Promise<TimelineEntry> {
    try {
      const response = await axiosInstance.get<{ data: TimelineEntry }>(
        `${this.baseUrl}/${entryId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching timeline entry:', error);
      throw error;
    }
  }

  // Convenience methods for different reference types
  
  // Candidate timeline methods
  async getCandidateTimeline(candidateId: string, filters: Omit<TimelineFilters, 'referenceType'> = {}): Promise<TimelineResponse> {
    return this.getTimelineByReference(candidateId, { ...filters, referenceType: 'candidate' });
  }

  async addCandidateTimelineEntry(candidateId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> {
    return this.createTimelineEntry({
      ...data,
      referenceType: 'candidate',
      referenceId: candidateId
    });
  }

  // Interview timeline methods
  async getInterviewTimeline(interviewId: string, filters: Omit<TimelineFilters, 'referenceType'> = {}): Promise<TimelineResponse> {
    return this.getTimelineByReference(interviewId, { ...filters, referenceType: 'interview' });
  }

  async addInterviewTimelineEntry(interviewId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> {
    return this.createTimelineEntry({
      ...data,
      referenceType: 'interview',
      referenceId: interviewId
    });
  }

  // Job timeline methods
  async getJobTimeline(jobId: string, filters: Omit<TimelineFilters, 'referenceType'> = {}): Promise<TimelineResponse> {
    return this.getTimelineByReference(jobId, { ...filters, referenceType: 'job' });
  }

  async addJobTimelineEntry(jobId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> {
    return this.createTimelineEntry({
      ...data,
      referenceType: 'job',
      referenceId: jobId
    });
  }

  // Employee timeline methods
  async getEmployeeTimeline(employeeId: string, filters: Omit<TimelineFilters, 'referenceType'> = {}): Promise<TimelineResponse> {
    return this.getTimelineByReference(employeeId, { ...filters, referenceType: 'employee' });
  }

  async addEmployeeTimelineEntry(employeeId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> {
    return this.createTimelineEntry({
      ...data,
      referenceType: 'employee',
      referenceId: employeeId
    });
  }
}

export const timelineService = new TimelineService();
export default timelineService; 