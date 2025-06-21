import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  import { Star } from "lucide-react";
  import { Progress } from "@/components/ui/progress";
  
  interface ViewPerformanceDialogProps {
    performance: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
  
  export function ViewPerformanceDialog({ performance, open, onOpenChange }: ViewPerformanceDialogProps) {
    if (!performance) return null;
  
    const DetailRow = ({ label, value }: { label: string; value: any }) => (
      <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2">{value}</dd>
      </div>
    );
  
    const renderStars = (rating: number) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        const isFull = rating >= i;
        const isHalf = rating >= i - 0.5 && rating < i;
  
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star
              className={`h-5 w-5 absolute ${
                isFull ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
              }`}
            />
            {isHalf && (
              <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>
        );
      }
      return (
        <div className="flex gap-1 items-center">
          {stars}
          <span className="ml-2 text-gray-700">({rating})</span>
        </div>
      );
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Performance Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {/* Employee Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
              <div className="space-y-1">
                <DetailRow label="Name" value={performance.employeeName} />
                <DetailRow label="Department" value={performance.department} />
                <DetailRow label="Role" value={performance.role} />
              </div>
            </div>
  
            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Rating" 
                  value={renderStars(performance.rating)} 
                />
                <DetailRow 
                  label="Projects Completed" 
                  value={performance.projectsCompleted} 
                />
                <DetailRow 
                  label="Productivity" 
                  value={
                    <div className="w-full">
                      <Progress value={performance.productivity} className="h-2" />
                      <span className="text-sm text-muted-foreground mt-1">
                        {performance.productivity}%
                      </span>
                    </div>
                  } 
                />
                <DetailRow 
                  label="Status" 
                  value={
                    <Badge 
                      variant="outline" 
                      className={
                        performance.status === "Exceeding"
                          ? "bg-green-50 text-green-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {performance.status}
                    </Badge>
                  } 
                />
              </div>
            </div>
  
            {/* Comments */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <div className="space-y-1">
                <DetailRow 
                  label="Comments" 
                  value={performance.comments || "No comments provided"} 
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  } 