import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GraduationCap, MapPin, Clock } from "lucide-react";
import type { Doctor } from "@shared/schema";

interface DoctorCardProps {
  doctor: Doctor;
  nextAvailable?: string;
  onBookNow: (doctorId: number) => void;
}

export function DoctorCard({ doctor, nextAvailable = "Available", onBookNow }: DoctorCardProps) {
  const rating = doctor.rating / 10; // Convert from stored format (50 = 5.0)
  const fee = doctor.consultationFee / 100; // Convert from cents

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <img 
        src={doctor.imageUrl} 
        alt={doctor.name} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
            <p className="text-medical-blue font-medium">{doctor.specialty}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-gray">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>{doctor.education}</span>
          </div>
          <div className="flex items-center text-sm text-slate-gray">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{doctor.location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-gray">
            <Clock className="w-4 h-4 mr-2" />
            <span>{doctor.experience}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm">
            <span className="text-slate-gray">Fee:</span>
            <span className="font-semibold text-healthcare-green ml-1">${fee}</span>
            <div className="mt-1">
              <span className="text-slate-gray">Next available:</span>
              <span className="font-semibold text-healthcare-green ml-1">{nextAvailable}</span>
            </div>
          </div>
          <Button 
            onClick={() => onBookNow(doctor.id)}
            className="bg-medical-blue text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
