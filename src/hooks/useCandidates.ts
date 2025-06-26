import { useState, useEffect, useCallback } from 'react';
import { candidateService } from '../services/candidate.service';
import { timelineService } from '../services/timeline.service';
import {
  Candidate,
  CandidateFilters,
  CandidatesResponse,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  CandidateStats,
  TimelineEntry
} from '../types/models';

export interface UseCandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  stats: CandidateStats | null;
}

export interface UseCandidatesActions {
  fetchCandidates: (filters?: CandidateFilters) => Promise<void>;
  createCandidate: (data: CreateCandidateRequest) => Promise<Candidate>;
  updateCandidate: (id: string, data: UpdateCandidateRequest) => Promise<Candidate>;
  deleteCandidate: (id: string) => Promise<void>;
  updateCandidateStatus: (id: string, status: Candidate['status'], notes?: string) => Promise<Candidate>;
  searchCandidates: (query: string, filters?: Partial<CandidateFilters>) => Promise<void>;
  fetchCandidateStats: () => Promise<void>;
  exportCandidates: (filters?: CandidateFilters) => Promise<void>;
  uploadResume: (candidateId: string, file: File) => Promise<void>;
  refreshCandidates: () => Promise<void>;
  clearError: () => void;
  // Timeline methods
  getCandidateTimeline: (candidateId: string) => Promise<TimelineEntry[]>;
  addCandidateTimelineEntry: (candidateId: string, data: {
    type: TimelineEntry['type'];
    subType: string;
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }) => Promise<TimelineEntry>;
  updateTimelineEntry: (entryId: string, data: {
    title?: string;
    description?: string;
    metadata?: Record<string, any>;
  }) => Promise<TimelineEntry>;
  deleteTimelineEntry: (entryId: string) => Promise<void>;
}

export interface UseCandidatesReturn extends UseCandidatesState, UseCandidatesActions {}

export const useCandidates = (initialFilters?: CandidateFilters): UseCandidatesReturn => {
  const [state, setState] = useState<UseCandidatesState>({
    candidates: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
    stats: null,
  });

  const [currentFilters, setCurrentFilters] = useState<CandidateFilters>(initialFilters || {});

  const fetchCandidates = useCallback(async (filters?: CandidateFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use the provided filters or keep the current ones
      const filtersToUse = filters || {};
      if (filters) {
        setCurrentFilters(filters);
      }
      
      const response: CandidatesResponse = await candidateService.getCandidates(filtersToUse);
      
      // Validate and filter the response data
      const validCandidates = Array.isArray(response.data) 
        ? response.data.filter(candidate => 
            candidate && 
            typeof candidate === 'object' &&
            candidate._id &&
            candidate.firstName &&
            candidate.lastName &&
            candidate.email
          )
        : [];
      
      setState(prev => ({
        ...prev,
        candidates: validCandidates,
        total: response.total || validCandidates.length,
        page: response.page || 1,
        limit: response.limit || 10,
        hasMore: response.hasMore || false,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      
      let errorMessage = 'Failed to fetch candidates';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        errorMessage = 'Bad request - please check your filters or try again';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - please login again';
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied - insufficient permissions';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        candidates: [], // Ensure candidates is always an array
      }));
    }
  }, []);

  const createCandidate = useCallback(async (data: CreateCandidateRequest): Promise<Candidate> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newCandidate = await candidateService.createCandidate(data);
      
      // Validate the new candidate before adding it
      if (newCandidate && newCandidate._id && newCandidate.firstName && newCandidate.lastName && newCandidate.email) {
        setState(prev => ({
          ...prev,
          candidates: [newCandidate, ...prev.candidates],
          total: prev.total + 1,
          loading: false,
        }));
      } else {
        console.warn('Invalid candidate returned from API:', newCandidate);
        setState(prev => ({ ...prev, loading: false }));
      }
      
      return newCandidate;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create candidate',
      }));
      throw error;
    }
  }, []);

  const updateCandidate = useCallback(async (id: string, data: UpdateCandidateRequest): Promise<Candidate> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedCandidate = await candidateService.updateCandidate(id, data);
      
      // Validate the updated candidate before updating the array
      if (updatedCandidate && updatedCandidate._id && updatedCandidate.firstName && updatedCandidate.lastName && updatedCandidate.email) {
        setState(prev => ({
          ...prev,
          candidates: prev.candidates.map(candidate =>
            candidate && candidate._id === id ? updatedCandidate : candidate
          ).filter(candidate => candidate), // Remove any null/undefined candidates
          loading: false,
        }));
        return updatedCandidate;
      } else {
        console.warn('Invalid updated candidate returned from API:', updatedCandidate);
        // Fallback: refresh the candidates list to get the updated data
        console.log('Refreshing candidates list to get updated data...');
        await fetchCandidates({ page: 1, limit: 10 });
        
        // Find the updated candidate in the refreshed list
        const refreshedCandidate = state.candidates.find(c => c._id === id);
        if (refreshedCandidate) {
          return refreshedCandidate;
        } else {
          throw new Error('Failed to find updated candidate after refresh');
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update candidate',
      }));
      throw error;
    }
  }, [fetchCandidates, state.candidates]);

  const deleteCandidate = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await candidateService.deleteCandidate(id);
      
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.filter(candidate => candidate && candidate._id !== id),
        total: prev.total - 1,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete candidate',
      }));
      throw error;
    }
  }, []);

  const updateCandidateStatus = useCallback(async (
    id: string, 
    status: Candidate['status'], 
    notes?: string
  ): Promise<Candidate> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedCandidate = await candidateService.updateCandidateStatus(id, status, notes);
      
      // Validate the updated candidate before updating the array
      if (updatedCandidate && updatedCandidate._id && updatedCandidate.firstName && updatedCandidate.lastName && updatedCandidate.email) {
        setState(prev => ({
          ...prev,
          candidates: prev.candidates.map(candidate =>
            candidate && candidate._id === id ? updatedCandidate : candidate
          ).filter(candidate => candidate), // Remove any null/undefined candidates
          loading: false,
        }));
        return updatedCandidate;
      } else {
        console.warn('Invalid updated candidate returned from status update API:', updatedCandidate);
        // Fallback: refresh the candidates list to get the updated data
        console.log('Refreshing candidates list to get updated data...');
        await fetchCandidates({ page: 1, limit: 10 });
        
        // Find the updated candidate in the refreshed list
        const refreshedCandidate = state.candidates.find(c => c._id === id);
        if (refreshedCandidate) {
          return refreshedCandidate;
        } else {
          throw new Error('Failed to find updated candidate after refresh');
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update candidate status',
      }));
      throw error;
    }
  }, [fetchCandidates, state.candidates]);

  const searchCandidates = useCallback(async (
    query: string, 
    filters?: Partial<CandidateFilters>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const searchFilters = { ...filters, search: query };
      setCurrentFilters(searchFilters);
      
      const response: CandidatesResponse = await candidateService.searchCandidates(query, filters);
      
      // Validate and filter the response data
      const validCandidates = Array.isArray(response.data) 
        ? response.data.filter(candidate => 
            candidate && 
            typeof candidate === 'object' &&
            candidate._id &&
            candidate.firstName &&
            candidate.lastName &&
            candidate.email
          )
        : [];
      
      setState(prev => ({
        ...prev,
        candidates: validCandidates,
        total: response.total || validCandidates.length,
        page: response.page || 1,
        limit: response.limit || 10,
        hasMore: response.hasMore || false,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to search candidates',
        candidates: [], // Ensure candidates is always an array
      }));
    }
  }, []);

  const fetchCandidateStats = useCallback(async () => {
    try {
      const stats = await candidateService.getCandidateStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch candidate statistics',
      }));
    }
  }, []);

  const exportCandidates = useCallback(async (filters?: CandidateFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const filtersToUse = filters || {};
      const blob = await candidateService.exportCandidates(filtersToUse);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `candidates-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to export candidates',
      }));
    }
  }, []);

  const uploadResume = useCallback(async (candidateId: string, file: File) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await candidateService.uploadResume(candidateId, file);
      
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(candidate =>
          candidate._id === candidateId 
            ? { ...candidate, resumeLink: result.resumeLink }
            : candidate
        ),
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to upload resume',
      }));
      throw error;
    }
  }, []);

  const refreshCandidates = useCallback(async () => {
    await fetchCandidates({ page: 1, limit: 10 });
  }, [fetchCandidates]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Timeline methods
  const getCandidateTimeline = useCallback(async (candidateId: string): Promise<TimelineEntry[]> => {
    try {
      const response = await timelineService.getCandidateTimeline(candidateId);
      return response.data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch candidate timeline',
      }));
      throw error;
    }
  }, []);

  const addCandidateTimelineEntry = useCallback(async (
    candidateId: string, 
    data: {
      type: TimelineEntry['type'];
      subType: string;
      title: string;
      description: string;
      metadata?: Record<string, any>;
    }
  ): Promise<TimelineEntry> => {
    try {
      const timelineEntry = await timelineService.addCandidateTimelineEntry(candidateId, data);
      
      // Update the candidate in the state with the new timeline entry
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(candidate => {
          if (candidate._id === candidateId) {
            return {
              ...candidate,
              timeline: [timelineEntry, ...(candidate.timeline || [])]
            };
          }
          return candidate;
        })
      }));
      
      return timelineEntry;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to add timeline entry',
      }));
      throw error;
    }
  }, []);

  const updateTimelineEntry = useCallback(async (
    entryId: string, 
    data: {
      title?: string;
      description?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<TimelineEntry> => {
    try {
      const updatedEntry = await timelineService.updateTimelineEntry(entryId, data);
      
      // Update the timeline entry in the candidates state
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(candidate => ({
          ...candidate,
          timeline: candidate.timeline?.map(entry => 
            entry._id === entryId ? updatedEntry : entry
          ) || []
        }))
      }));
      
      return updatedEntry;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to update timeline entry',
      }));
      throw error;
    }
  }, []);

  const deleteTimelineEntry = useCallback(async (entryId: string): Promise<void> => {
    try {
      await timelineService.deleteTimelineEntry(entryId);
      
      // Remove the timeline entry from the candidates state
      setState(prev => ({
        ...prev,
        candidates: prev.candidates.map(candidate => ({
          ...candidate,
          timeline: candidate.timeline?.filter(entry => entry._id !== entryId) || []
        }))
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete timeline entry',
      }));
      throw error;
    }
  }, []);

  // Initial fetch - only if initialFilters provided
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      fetchCandidates(initialFilters);
    }
  }, []); // Only run once on mount

  return {
    ...state,
    fetchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateCandidateStatus,
    searchCandidates,
    fetchCandidateStats,
    exportCandidates,
    uploadResume,
    refreshCandidates,
    clearError,
    // Timeline methods
    getCandidateTimeline,
    addCandidateTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
  };
};

export default useCandidates; 