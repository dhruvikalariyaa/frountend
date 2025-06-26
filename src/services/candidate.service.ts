import axiosInstance from '../lib/axios';
import {
  Candidate,
  CandidateFilters,
  CandidatesResponse,
  CreateCandidateRequest,
  UpdateCandidateRequest,
  CandidateStats,
  TimelineEntry
} from '../types/models';
import { timelineService } from './timeline.service';

export const CANDIDATE_STATUS_OPTIONS = [
  'new',
  'interview',
  'rejected'
] as const;

export const CANDIDATE_STATUSES = {
  NEW: 'new',
  INTERVIEW: 'interview',
  REJECTED: 'rejected'
} as const;

class CandidateService {
  private baseUrl = '/candidates';

  // GET all candidates with filters
  async getCandidates(filters: CandidateFilters = {}): Promise<CandidatesResponse> {
    try {
      console.log('getCandidates called with filters:', filters);
      
      const params = new URLSearchParams();
      
      // Only add valid, non-empty filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          // Convert numbers to strings for URL params
          const stringValue = typeof value === 'number' ? value.toString() : value;
          if (stringValue && stringValue.trim() !== '') {
            params.append(key, stringValue);
          }
        }
      });

      const queryString = params.toString();
      const url = `${this.baseUrl}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Making request to URL:', url);
      console.log('Query parameters:', queryString);

      const response = await axiosInstance.get<CandidatesResponse>(url);
      
      console.log('getCandidates response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  // GET candidate by ID
  async getCandidateById(id: string): Promise<Candidate> {
    try {
      const response = await axiosInstance.get<{ data: Candidate }>(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }

  // POST create new candidate
  async createCandidate(candidateData: CreateCandidateRequest): Promise<Candidate> {
    try {
      const response = await axiosInstance.post<{ data: Candidate }>(this.baseUrl, candidateData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }

  // PATCH update candidate
  async updateCandidate(id: string, candidateData: UpdateCandidateRequest): Promise<Candidate> {
    try {
      // Get current candidate to compare status if status is being updated
      let currentCandidate: Candidate | null = null;
      let previousStatus: Candidate['status'] | null = null;
      
      if (candidateData.status) {
        try {
          currentCandidate = await this.getCandidateById(id);
          previousStatus = currentCandidate?.status || null;
        } catch (error) {
          console.warn('Could not fetch current candidate for status comparison:', error);
          // Continue with update even if we can't get current status
        }
      }
      
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, candidateData);
      console.log('Update candidate API response:', response.data);
      
      let updatedCandidate: Candidate;
      
      // Check if response has the expected structure
      if (response.data && response.data.data) {
        updatedCandidate = response.data.data;
      } else if (response.data && typeof response.data === 'object' && (response.data as any)._id) {
        // If API returns candidate directly without wrapping in 'data' property
        updatedCandidate = response.data as Candidate;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        // Fallback: fetch the updated candidate by ID
        updatedCandidate = await this.getCandidateById(id);
      }
      
      // Add timeline entry for status change if status was updated and actually changed
      if (candidateData.status && previousStatus && previousStatus !== candidateData.status) {
        try {
          await timelineService.addCandidateTimelineEntry(id, {
            type: 'status_change',
            subType: candidateData.status,
            title: `Status changed to ${this.getStatusDisplayText(candidateData.status)}`,
            description: `Candidate status updated from ${this.getStatusDisplayText(previousStatus)} to ${this.getStatusDisplayText(candidateData.status)} via candidate edit`,
            metadata: {
              previousStatus,
              newStatus: candidateData.status,
              updatedVia: 'candidate_edit',
              updatedAt: new Date().toISOString()
            }
          });
          
          // Fetch the candidate again to get the updated timeline
          updatedCandidate = await this.getCandidateById(id);
        } catch (timelineError) {
          console.warn('Failed to add timeline entry for status change:', timelineError);
          // Don't fail the update if timeline fails
        }
      }
      
      return updatedCandidate;
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  // PATCH update candidate status
  async updateCandidateStatus(id: string, status: Candidate['status'], notes?: string): Promise<Candidate> {
    try {
      // Get current candidate to compare status
      let currentCandidate: Candidate | null = null;
      let previousStatus: Candidate['status'] | null = null;
      
      try {
        currentCandidate = await this.getCandidateById(id);
        previousStatus = currentCandidate?.status || null;
      } catch (error) {
        console.warn('Could not fetch current candidate for status comparison:', error);
        // Continue with status update even if we can't get current status
      }
      
      // Use the regular update endpoint since there might not be a separate status endpoint
      const updateData: UpdateCandidateRequest = { status };
      if (notes) {
        updateData.notes = notes;
      }
      
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, updateData);
      console.log('Update candidate status API response:', response.data);
      
      let updatedCandidate: Candidate;
      
      // Check if response has the expected structure
      if (response.data && response.data.data) {
        updatedCandidate = response.data.data;
      } else if (response.data && typeof response.data === 'object' && (response.data as any)._id) {
        // If API returns candidate directly without wrapping in 'data' property
        updatedCandidate = response.data as Candidate;
      } else {
        console.warn('Unexpected API response structure for status update:', response.data);
        // Fallback: fetch the updated candidate by ID
        updatedCandidate = await this.getCandidateById(id);
      }
      
      // Add timeline entry for status change if status actually changed
      if (previousStatus && previousStatus !== status) {
        try {
          await timelineService.addCandidateTimelineEntry(id, {
            type: 'status_change',
            subType: status,
            title: `Status changed to ${this.getStatusDisplayText(status)}`,
            description: `Candidate status updated from ${this.getStatusDisplayText(previousStatus)} to ${this.getStatusDisplayText(status)}${notes ? `. Notes: ${notes}` : ''}`,
            metadata: {
              previousStatus,
              newStatus: status,
              notes: notes || null,
              updatedAt: new Date().toISOString()
            }
          });
          
          // Fetch the candidate again to get the updated timeline
          updatedCandidate = await this.getCandidateById(id);
        } catch (timelineError) {
          console.warn('Failed to add timeline entry for status change:', timelineError);
          // Don't fail the status update if timeline fails
        }
      }
      
      return updatedCandidate;
    } catch (error) {
      console.error('Error updating candidate status:', error);
      throw error;
    }
  }

  // DELETE candidate
  async deleteCandidate(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  // GET candidate statistics
  async getCandidateStats(): Promise<CandidateStats> {
    try {
      const response = await axiosInstance.get<{ data: CandidateStats }>(`${this.baseUrl}/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching candidate stats:', error);
      throw error;
    }
  }

  // POST add timeline entry - using new timeline API
  async addTimelineEntry(candidateId: string, timelineData: {
    type: TimelineEntry['type'];
    subType: string;
    title: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<TimelineEntry> {
    try {
      // Use the new timeline service
      return await timelineService.addCandidateTimelineEntry(candidateId, timelineData);
    } catch (error) {
      console.error('Error adding timeline entry:', error);
      throw error;
    }
  }

  // GET timeline for candidate - using new timeline API
  async getCandidateTimeline(candidateId: string): Promise<TimelineEntry[]> {
    try {
      // Use the new timeline service
      const response = await timelineService.getCandidateTimeline(candidateId);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate timeline:', error);
      throw error;
    }
  }

  // POST bulk operations
  async bulkUpdateCandidates(candidateIds: string[], updateData: UpdateCandidateRequest): Promise<Candidate[]> {
    try {
      const response = await axiosInstance.post<{ data: Candidate[] }>(`${this.baseUrl}/bulk-update`, {
        candidateIds,
        updateData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error bulk updating candidates:', error);
      throw error;
    }
  }

  // GET export candidates
  async exportCandidates(filters: CandidateFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get(
        `${this.baseUrl}/export${params.toString() ? `?${params.toString()}` : ''}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting candidates:', error);
      throw error;
    }
  }

  // POST upload resume
  async uploadResume(candidateId: string, file: File): Promise<{ resumeLink: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axiosInstance.post<{ data: { resumeLink: string } }>(
        `${this.baseUrl}/${candidateId}/resume`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  // GET search candidates
  async searchCandidates(query: string, filters: Partial<CandidateFilters> = {}): Promise<CandidatesResponse> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getCandidates(searchFilters);
    } catch (error) {
      console.error('Error searching candidates:', error);
      throw error;
    }
  }

  // Helper method to get candidate full name
  getCandidateFullName(candidate: Candidate | undefined | null): string {
    if (!candidate || !candidate.firstName || !candidate.lastName) {
      return 'Unknown Candidate';
    }
    return `${candidate.firstName} ${candidate.lastName}`.trim();
  }

  // Helper method to get status color
  getStatusColor(status: Candidate['status']): string {
    const statusColors = {
      new: '#3B82F6',
      interview: '#8B5CF6',
      rejected: '#EF4444'
    };
    return statusColors[status] || '#6B7280';
  }

  // Helper method to get status display text
  getStatusDisplayText(status: Candidate['status']): string {
    const statusTexts = {
      new: 'New',
      interview: 'Interview',
      rejected: 'Rejected'
    };
    return statusTexts[status] || status;
  }
}

export const candidateService = new CandidateService();
export default candidateService; 