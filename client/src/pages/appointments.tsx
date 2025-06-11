import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointment-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Search } from "lucide-react";
import type { AppointmentWithDoctor } from "@shared/schema";

export default function Appointments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [patientEmail, setPatientEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDoctor[]>({
    queryKey: ["/api/appointments", searchEmail],
    enabled: !!searchEmail,
    queryFn: async () => {
      const response = await fetch(`/api/appointments?email=${encodeURIComponent(searchEmail)}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Updated",
        description: "Your appointment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (patientEmail.trim()) {
      setSearchEmail(patientEmail.trim());
    }
  };

  const handleReschedule = (appointmentId: number) => {
    // In a real app, this would open a rescheduling modal
    toast({
      title: "Reschedule Appointment",
      description: "Rescheduling feature will be available soon.",
    });
  };

  const handleCancel = (appointmentId: number) => {
    updateStatusMutation.mutate({ id: appointmentId, status: "cancelled" });
  };

  const handleBookAgain = (doctorId: number) => {
    setLocation(`/booking/${doctorId}`);
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === "scheduled");
  const pastAppointments = appointments.filter(apt => apt.status === "completed");
  const cancelledAppointments = appointments.filter(apt => apt.status === "cancelled");

  return (
    <div className="min-h-screen bg-clean-bg py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Manage Your Appointments</h1>
          <p className="text-lg text-slate-gray">Keep track of your upcoming and past appointments</p>
        </div>

        {/* Email Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email to view appointments"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-medical-blue text-white hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search Appointments
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchEmail && (
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledAppointments.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-slate-gray mb-6 max-w-md mx-auto">
                      You don't have any upcoming appointments. Book an appointment with one of our healthcare providers.
                    </p>
                    <Button 
                      onClick={() => setLocation("/")}
                      className="bg-medical-blue text-white hover:bg-blue-700"
                    >
                      Find a Doctor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastAppointments.length > 0 ? (
                pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onBookAgain={handleBookAgain}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Past Appointments</h3>
                    <p className="text-slate-gray">You haven't had any completed appointments yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-6">
              {cancelledAppointments.length > 0 ? (
                cancelledAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onBookAgain={handleBookAgain}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cancelled Appointments</h3>
                    <p className="text-slate-gray">You haven't cancelled any appointments.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!searchEmail && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Email</h3>
              <p className="text-slate-gray">
                Please enter your email address above to view your appointments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
