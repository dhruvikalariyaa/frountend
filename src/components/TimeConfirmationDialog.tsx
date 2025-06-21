import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Timer, 
  Coffee,
  Save,
  LogOut,
  BellRing,
  Zap,
  History
} from 'lucide-react';
import { timeTrackingService } from '@/services/timeTrackingService';
import type { TimeTracking } from '@/services/timeTrackingService';
import { motion } from 'framer-motion';

interface TimeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'checkin' | 'checkout' | 'break' | 'endbreak';
  timeWorked?: TimeTracking;
  breakDuration?: TimeTracking;
  totalBreakTime?: TimeTracking;
}

const TimeConfirmationDialog: React.FC<TimeConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  timeWorked,
  breakDuration,
  totalBreakTime
}) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const MotionDiv = motion.div;

  const getDialogTitle = () => {
    switch (type) {
      case 'checkin':
        return 'Start Your Day';
      case 'checkout':
        return 'End Your Day';
      case 'break':
        return 'Take a Break';
      case 'endbreak':
        return 'End Break';
      default:
        return '';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'checkin':
        return 'bg-green-100 text-green-600';
      case 'checkout':
        return 'bg-red-100 text-red-600';
      case 'break':
        return 'bg-amber-100 text-amber-600';
      case 'endbreak':
        return 'bg-purple-100 text-purple-600';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'checkin':
        return <CheckCircle2 className="h-6 w-6 stroke-2" />;
      case 'checkout':
        return <XCircle className="h-6 w-6 stroke-2" />;
      case 'break':
      case 'endbreak':
        return <Coffee className="h-6 w-6 stroke-2" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-b from-white to-gray-50 max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getIconColor()}`}>
              {getIcon()}
            </div>
            {getDialogTitle()}
          </DialogTitle>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Time & Date Section */}
            <div className="relative">
              <div className="absolute -left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm transition-all duration-200 hover:shadow-md hover:from-blue-100 hover:to-indigo-100">
                  <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow ring-4 ring-blue-50">
                    <Clock className="h-6 w-6 stroke-2 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900 mb-1">Current Time</div>
                    <div className="text-3xl font-bold text-blue-700 tabular-nums tracking-tight">
                      {currentTime}
                    </div>
                  </div>
                </div>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="group mt-4"
              >
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-200 shadow-sm transition-all duration-200 hover:shadow-md hover:from-purple-100 hover:to-fuchsia-100">
                  <div className="p-3 bg-white rounded-lg shadow-sm group-hover:shadow ring-4 ring-purple-50">
                    <Calendar className="h-6 w-6 stroke-2 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-purple-900 mb-1">Current Date</div>
                    <div className="text-lg font-bold text-purple-700">
                      {currentDate}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            </div>

            {/* Break Timer */}
            {(type === 'break' || type === 'endbreak') && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="group"
              >
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm transition-all duration-200 hover:shadow-md hover:from-amber-100 hover:to-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow ring-4 ring-amber-50">
                      <Coffee className="h-5 w-5 stroke-2 text-amber-600" />
                    </div>
                    <span className="font-semibold text-amber-900 text-lg">
                      {type === 'break' ? 'Break Guidelines' : 'Break Summary'}
                    </span>
                  </div>
                  
                  {type === 'break' ? (
                    <>
                      <div className="flex items-center gap-3 text-amber-800 mb-3">
                        <BellRing className="h-4 w-4 stroke-2" />
                        <div className="text-sm">
                          Recommended break: <span className="font-bold">15-30 minutes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-amber-800 mb-3">
                        <Zap className="h-4 w-4 stroke-2" />
                        <div className="text-sm">
                          Take regular breaks to maintain productivity
                        </div>
                      </div>
                      {totalBreakTime && (
                        <div className="flex items-center gap-3 text-amber-800 pt-3 border-t border-amber-200">
                          <History className="h-4 w-4 stroke-2" />
                          <div className="text-sm">
                            Total breaks today: <span className="font-bold tabular-nums">{timeTrackingService.formatTime(totalBreakTime)}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-amber-800">
                      <Timer className="h-4 w-4 stroke-2" />
                      <div className="text-sm">
                        Break duration: <span className="font-bold tabular-nums">{timeTrackingService.formatTime(breakDuration!)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </MotionDiv>
            )}

            {/* Checkout Warning */}
            {type === 'checkout' && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="group"
              >
                <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow ring-4 ring-red-50">
                      <AlertTriangle className="h-5 w-5 stroke-2 text-red-600" />
                    </div>
                    <span className="font-semibold text-red-900 text-lg">Important Reminders</span>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center gap-3 text-red-800">
                      <Save className="h-4 w-4 stroke-2" />
                      <div className="text-sm">
                        Please save all your work before checking out
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-red-800">
                      <LogOut className="h-4 w-4 stroke-2" />
                      <div className="text-sm">
                        Remember to log out after checking out
                      </div>
                    </div>
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Summary Section */}
            {type === 'checkout' && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="group"
              >
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 shadow-sm transition-all duration-200 hover:shadow-md hover:from-emerald-100 hover:to-teal-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow ring-4 ring-emerald-50">
                      <Timer className="h-5 w-5 stroke-2 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-emerald-900 text-lg">Day Summary</span>
                  </div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center gap-3 text-emerald-800">
                      <Clock className="h-4 w-4 stroke-2" />
                      <div className="text-sm">
                        Total time worked: <span className="font-bold tabular-nums">{timeTrackingService.formatTime(timeWorked!)}</span>
                      </div>
                    </div>
                    {totalBreakTime && (
                      <div className="flex items-center gap-3 text-emerald-800">
                        <Coffee className="h-4 w-4 stroke-2" />
                        <div className="text-sm">
                          Total breaks: <span className="font-bold tabular-nums">{timeTrackingService.formatTime(totalBreakTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionDiv>
            )}
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-gray-700 hover:bg-gray-100 border-2 transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className={`flex-1 h-12 gap-2 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${
                type === 'checkin'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border border-green-700/20'
                  : type === 'checkout'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-700/20'
                  : type === 'break'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-700/20'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white border border-purple-700/20'
              }`}
            >
              {type === 'checkin' && (
                <>
                  <CheckCircle2 className="h-5 w-5 stroke-2" />
                  <span>Confirm Check In</span>
                </>
              )}
              {type === 'checkout' && (
                <>
                  <XCircle className="h-5 w-5 stroke-2" />
                  <span>Confirm Check Out</span>
                </>
              )}
              {type === 'break' && (
                <>
                  <Coffee className="h-5 w-5 stroke-2" />
                  <span>Start Break</span>
                </>
              )}
              {type === 'endbreak' && (
                <>
                  <Coffee className="h-5 w-5 stroke-2" />
                  <span>End Break</span>
                </>
              )}
            </Button>
          </MotionDiv>
        </div>
      </DialogContent>
    </Dialog>
  );
};




export default TimeConfirmationDialog; 