import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Clock } from 'lucide-react';

interface CheckInOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckInOutDialog: React.FC<CheckInOutDialogProps> = ({ open, onOpenChange }) => {
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const savedCheckIn = localStorage.getItem('checkInTime');
    const savedCheckOut = localStorage.getItem('checkOutTime');

    if (savedCheckIn) {
      setCheckInTime(new Date(savedCheckIn));
    }
    if (savedCheckOut) {
      setCheckOutTime(new Date(savedCheckOut));
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckInOut = () => {
    const now = new Date();
    if (!checkInTime) {
      setCheckInTime(now);
      setCheckOutTime(null);
      localStorage.setItem('checkInTime', now.toISOString());
      localStorage.removeItem('checkOutTime');
    } else {
      setCheckOutTime(now);
      setCheckInTime(null);
      localStorage.setItem('checkOutTime', now.toISOString());
      localStorage.removeItem('checkInTime');
    }
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getClockHands = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    const hourDeg = (hours % 12) * 30 + minutes / 2;
    const minuteDeg = minutes * 6 + seconds / 10;
    const secondDeg = seconds * 6;

    return {
      hour: `rotate(${hourDeg}deg)`,
      minute: `rotate(${minuteDeg}deg)`,
      second: `rotate(${secondDeg}deg)`,
    };
  };

  const hands = getClockHands();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl sm:max-w-lg">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Check-In / Check-Out
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Analog Clock */}
          <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 shadow-inner flex items-center justify-center">
            {/* Clock numbers */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
              <div
                key={num}
                className={`absolute text-sm font-medium ${
                  [12, 3, 6, 9].includes(num)
                    ? 'text-lg font-bold text-gray-800'
                    : 'text-gray-600'
                }`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${num * 30}deg) translateY(-80px) rotate(-${num * 30}deg)`,
                }}
              >
                {num}
              </div>
            ))}
            {/* Hour hand */}
            <div
              className="absolute w-2 h-12 bg-gray-800 rounded-t-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translateX(-50%) translateY(-100%) ${hands.hour}`,
                transformOrigin: 'bottom center',
              }}
            />
            {/* Minute hand */}
            <div
              className="absolute w-1.5 h-16 bg-gray-800 rounded-t-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translateX(-50%) translateY(-100%) ${hands.minute}`,
                transformOrigin: 'bottom center',
              }}
            />
            {/* Second hand */}
            <div
              className="absolute w-0.5 h-20 bg-red-500 rounded-t-full"
              style={{
                top: '50%',
                left: '50%',
                transform: `translateX(-50%) translateY(-100%) ${hands.second}`,
                transformOrigin: 'bottom center',
              }}
            />
            {/* Center dot */}
            <div
              className="absolute w-3 h-3 bg-gray-800 rounded-full z-10"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Date Display */}
          <div className="bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-lg text-base shadow-sm">
            {formatDisplayDate(currentTime)} {formatTime(currentTime)}
          </div>

          {/* Check-in / Check-out Button */}
          <Button
            onClick={handleCheckInOut}
            className={`w-48 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
              checkInTime
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {checkInTime ? 'Check-Out' : 'Check-In'}
          </Button>

          {/* Check-in/Check-out status messages */}
          {checkInTime && (
            <div className="w-full bg-green-50 text-green-700 font-medium py-2 px-4 rounded-lg flex items-center border-l-4 border-green-500 shadow-sm">
              <Clock className="mr-2 h-5 w-5" />
              Checked in at: {formatDisplayDate(checkInTime)} {formatTime(checkInTime)}
            </div>
          )}

          {checkOutTime && (
            <div className="w-full bg-yellow-50 text-yellow-700 font-medium py-2 px-4 rounded-lg flex items-center border-l-4 border-yellow-500 shadow-sm">
              <Clock className="mr-2 h-5 w-5" />
              Checked out at: {formatDisplayDate(checkOutTime)} {formatTime(checkOutTime)}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInOutDialog;