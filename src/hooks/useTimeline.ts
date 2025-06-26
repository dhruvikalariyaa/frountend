import { useState, useCallback } from 'react';
import { timelineService, CreateTimelineEntryRequest, UpdateTimelineEntryRequest, TimelineFilters, TimelineResponse } from '../services/timeline.service';
import { TimelineEntry } from '../types/models';

export interface UseTimelineState {
  timeline: TimelineEntry[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UseTimelineActions {
  fetchTimeline: (referenceId: string, filters?: TimelineFilters) => Promise<void>;
  createTimelineEntry: (data: CreateTimelineEntryRequest) => Promise<TimelineEntry>;
  updateTimelineEntry: (entryId: string, data: UpdateTimelineEntryRequest) => Promise<TimelineEntry>;
  deleteTimelineEntry: (entryId: string) => Promise<void>;
  getTimelineEntry: (entryId: string) => Promise<TimelineEntry>;
  clearError: () => void;
  // Convenience methods for different reference types
  fetchCandidateTimeline: (candidateId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => Promise<void>;
  addCandidateTimelineEntry: (candidateId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>) => Promise<TimelineEntry>;
  fetchInterviewTimeline: (interviewId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => Promise<void>;
  addInterviewTimelineEntry: (interviewId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>) => Promise<TimelineEntry>;
  fetchJobTimeline: (jobId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => Promise<void>;
  addJobTimelineEntry: (jobId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>) => Promise<TimelineEntry>;
  fetchEmployeeTimeline: (employeeId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => Promise<void>;
  addEmployeeTimelineEntry: (employeeId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>) => Promise<TimelineEntry>;
}

export interface UseTimelineReturn extends UseTimelineState, UseTimelineActions {}

export const useTimeline = (): UseTimelineReturn => {
  const [state, setState] = useState<UseTimelineState>({
    timeline: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
  });

  const fetchTimeline = useCallback(async (referenceId: string, filters?: TimelineFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response: TimelineResponse = await timelineService.getTimelineByReference(referenceId, filters);
      
      setState(prev => ({
        ...prev,
        timeline: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        hasMore: response.hasMore || false,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching timeline:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch timeline',
        timeline: [],
      }));
    }
  }, []);

  const createTimelineEntry = useCallback(async (data: CreateTimelineEntryRequest): Promise<TimelineEntry> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newEntry = await timelineService.createTimelineEntry(data);
      
      setState(prev => ({
        ...prev,
        timeline: [newEntry, ...prev.timeline],
        total: prev.total + 1,
        loading: false,
      }));
      
      return newEntry;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create timeline entry',
      }));
      throw error;
    }
  }, []);

  const updateTimelineEntry = useCallback(async (entryId: string, data: UpdateTimelineEntryRequest): Promise<TimelineEntry> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedEntry = await timelineService.updateTimelineEntry(entryId, data);
      
      setState(prev => ({
        ...prev,
        timeline: prev.timeline.map(entry => 
          entry._id === entryId ? updatedEntry : entry
        ),
        loading: false,
      }));
      
      return updatedEntry;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update timeline entry',
      }));
      throw error;
    }
  }, []);

  const deleteTimelineEntry = useCallback(async (entryId: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await timelineService.deleteTimelineEntry(entryId);
      
      setState(prev => ({
        ...prev,
        timeline: prev.timeline.filter(entry => entry._id !== entryId),
        total: prev.total - 1,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete timeline entry',
      }));
      throw error;
    }
  }, []);

  const getTimelineEntry = useCallback(async (entryId: string): Promise<TimelineEntry> => {
    try {
      return await timelineService.getTimelineEntry(entryId);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch timeline entry',
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Convenience methods for different reference types
  const fetchCandidateTimeline = useCallback(async (candidateId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => {
    return fetchTimeline(candidateId, { ...filters, referenceType: 'candidate' });
  }, [fetchTimeline]);

  const addCandidateTimelineEntry = useCallback(async (candidateId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> => {
    return createTimelineEntry({
      ...data,
      referenceType: 'candidate',
      referenceId: candidateId
    });
  }, [createTimelineEntry]);

  const fetchInterviewTimeline = useCallback(async (interviewId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => {
    return fetchTimeline(interviewId, { ...filters, referenceType: 'interview' });
  }, [fetchTimeline]);

  const addInterviewTimelineEntry = useCallback(async (interviewId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> => {
    return createTimelineEntry({
      ...data,
      referenceType: 'interview',
      referenceId: interviewId
    });
  }, [createTimelineEntry]);

  const fetchJobTimeline = useCallback(async (jobId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => {
    return fetchTimeline(jobId, { ...filters, referenceType: 'job' });
  }, [fetchTimeline]);

  const addJobTimelineEntry = useCallback(async (jobId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> => {
    return createTimelineEntry({
      ...data,
      referenceType: 'job',
      referenceId: jobId
    });
  }, [createTimelineEntry]);

  const fetchEmployeeTimeline = useCallback(async (employeeId: string, filters?: Omit<TimelineFilters, 'referenceType'>) => {
    return fetchTimeline(employeeId, { ...filters, referenceType: 'employee' });
  }, [fetchTimeline]);

  const addEmployeeTimelineEntry = useCallback(async (employeeId: string, data: Omit<CreateTimelineEntryRequest, 'referenceType' | 'referenceId'>): Promise<TimelineEntry> => {
    return createTimelineEntry({
      ...data,
      referenceType: 'employee',
      referenceId: employeeId
    });
  }, [createTimelineEntry]);

  return {
    ...state,
    fetchTimeline,
    createTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    getTimelineEntry,
    clearError,
    // Convenience methods
    fetchCandidateTimeline,
    addCandidateTimelineEntry,
    fetchInterviewTimeline,
    addInterviewTimelineEntry,
    fetchJobTimeline,
    addJobTimelineEntry,
    fetchEmployeeTimeline,
    addEmployeeTimelineEntry,
  };
};

export default useTimeline; 