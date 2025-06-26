import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building2 } from 'lucide-react';
import Timeline from '@/components/common/Timeline';
import { Candidate, TimelineEntry } from '@/types/models';
import { candidateService } from '@/services/candidate.service';

interface CandidateTimelineDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTimelineUpdate?: (timeline: TimelineEntry[]) => void;
}

const CandidateTimelineDialog: React.FC<CandidateTimelineDialogProps> = ({
  candidate,
  open,
  onOpenChange,
  onTimelineUpdate
}) => {
  if (!candidate) return null;

  const getStatusColor = (status: string) => {
    const validStatuses: Candidate['status'][] = ['new', 'interview', 'rejected'];
    const candidateStatus = validStatuses.includes(status as Candidate['status']) ? status as Candidate['status'] : 'new';
    return candidateService.getStatusColor(candidateStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Timeline - {candidateService.getCandidateFullName(candidate)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Candidate Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg">
                      {candidateService.getCandidateFullName(candidate)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {candidate.currentRole || 'Position not specified'}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="mt-2 border-current/20"
                      style={{ 
                        backgroundColor: `${getStatusColor(candidate.status)}20`,
                        color: getStatusColor(candidate.status),
                        borderColor: `${getStatusColor(candidate.status)}40`
                      }}
                    >
                      {candidateService.getStatusDisplayText(candidate.status)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="break-all">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{candidate.phone}</span>
                    </div>
                    {candidate.currentCompany && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{candidate.currentCompany}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Quick Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{candidate.experienceYears} years</span>
                      </div>
                      {candidate.department && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium">{candidate.department}</span>
                        </div>
                      )}
                      {candidate.expectedSalary && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Salary:</span>
                          <span className="font-medium">₹{candidate.expectedSalary.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-2">
              <Timeline
                referenceId={candidate._id}
                referenceType="candidate"
                title={`Application Timeline (${candidate.timeline?.length || 0} entries)`}
                showAddButton={true}
                maxHeight="calc(80vh - 200px)"
                onTimelineUpdate={onTimelineUpdate}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateTimelineDialog; 