import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorCard } from "@/components/doctor-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCheck, Clock, Shield, Video, Bell, TrendingUp } from "lucide-react";
import type { Doctor } from "@shared/schema";
import type { SearchFilters } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    specialty: "",
    location: ""
  });

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const handleSearch = () => {
    if (searchFilters.specialty || searchFilters.location) {
      // For now, we'll just show all doctors. In a real app, we'd filter based on search
      console.log("Searching with filters:", searchFilters);
    }
  };

  const handleBookNow = (doctorId: number) => {
    setLocation(`/booking/${doctorId}`);
  };

  const specialties = [
    "General Practice",
    "Cardiology", 
    "Dermatology",
    "Pediatrics",
    "Orthopedics"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-blue to-professional-purple text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Find Your Perfect Healthcare Provider
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
              Discover personalized doctor recommendations based on your health needs, location, and preferences. Book appointments instantly with verified healthcare professionals.
            </p>
            
            {/* Search Interface */}
            <Card className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <Select value={searchFilters.specialty} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, specialty: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select specialty..." />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input 
                    type="text" 
                    placeholder="Enter city or zip code"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full bg-medical-blue text-white hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Find Doctors</span>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Healthcare Providers</h2>
            <p className="text-lg text-slate-gray max-w-2xl mx-auto">Discover top-rated doctors in your area, verified and recommended by our community</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  nextAvailable="Today 2:30 PM"
                  onBookNow={handleBookNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose MedConnect?</h2>
            <p className="text-lg text-slate-gray max-w-2xl mx-auto">Experience healthcare booking that puts your needs first with advanced features designed for your convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-medical-blue bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="text-medical-blue text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Professionals</h3>
              <p className="text-slate-gray leading-relaxed">All doctors are thoroughly verified with authentic credentials, licenses, and patient reviews for your peace of mind.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-healthcare-green bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="text-healthcare-green text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Booking</h3>
              <p className="text-slate-gray leading-relaxed">Book appointments instantly with real-time availability. No more waiting on hold or lengthy phone calls.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-professional-purple bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="text-professional-purple text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-slate-gray leading-relaxed">Your health information is protected with bank-level security and HIPAA-compliant privacy standards.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="text-yellow-600 text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Telemedicine Ready</h3>
              <p className="text-slate-gray leading-relaxed">Access healthcare from anywhere with secure video consultations and digital prescriptions.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bell className="text-red-600 text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Reminders</h3>
              <p className="text-slate-gray leading-relaxed">Never miss an appointment with intelligent reminders via SMS, email, and push notifications.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-indigo-600 text-2xl w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Health Tracking</h3>
              <p className="text-slate-gray leading-relaxed">Keep track of your medical history, prescriptions, and health progress all in one secure place.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
