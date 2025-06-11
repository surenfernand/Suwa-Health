import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, HourglassIcon, Video, Edit, X, CalendarPlus, FileText, CheckCircle, Info } from "lucide-react";
import type { AppointmentWithDoctor } from "@shared/schema";

interface AppointmentCardProps {
  appointment: AppointmentWithDoctor;
  onReschedule?: (appointmentId: number) => void;
  onCancel?: (appointmentId: number) => void;
  onBookAgain?: (doctorId: number) => void;
}

export function AppointmentCard({ appointment, onReschedule, onCancel, onBookAgain }: AppointmentCardProps) {
  const isUpcoming = appointment.status === "scheduled";
  const isPast = appointment.status === "completed";
  const fee = appointment.doctor.consultationFee / 100;

  const getStatusBadge = () => {
    switch (appointment.status) {
      case "scheduled":
        return <Badge className="bg-healthcare-green bg-opacity-10 text-healthcare-green">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{appointment.status}</Badge>;
    }
  };

  return (
    <Card className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img 
                src={appointment.doctor.imageUrl} 
                alt={appointment.doctor.name} 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{appointment.doctor.name}</h3>
                <p className="text-medical-blue font-medium">{appointment.doctor.specialty}</p>
                <p className="text-sm text-slate-gray">{appointment.doctor.location}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="text-medical-blue w-5 h-5" />
              <div>
                <p className="text-sm text-slate-gray">Date</p>
                <p className="font-semibold">{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="text-medical-blue w-5 h-5" />
              <div>
                <p className="text-sm text-slate-gray">Time</p>
                <p className="font-semibold">{appointment.appointmentTime}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <HourglassIcon className="text-medical-blue w-5 h-5" />
              <div>
                <p className="text-sm text-slate-gray">Duration</p>
                <p className="font-semibold">30 minutes</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isUpcoming && (
              <>
                <Button className="bg-medical-blue text-white hover:bg-blue-700 transition-colors font-medium">
                  <Video className="w-4 h-4 mr-2" />
                  Join Call
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onReschedule?.(appointment.id)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onCancel?.(appointment.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            
            {isPast && (
              <>
                <Button 
                  onClick={() => onBookAgain?.(appointment.doctor.id)}
                  className="bg-medical-blue text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Book Again
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </>
            )}
          </div>
        </div>
        
        {isUpcoming && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 lg:w-80">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-medical-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="text-medical-blue w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-900">Appointment Reminder</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-healthcare-green" />
                <span>Email reminder sent</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-healthcare-green" />
                <span>SMS reminder scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-medical-blue" />
                <span>Arrive 15 minutes early</span>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="text-xs text-slate-gray">Consultation Fee</div>
                <div className="text-lg font-bold text-medical-blue">${fee}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
