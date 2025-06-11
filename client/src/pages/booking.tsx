import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, ArrowLeft, Check } from "lucide-react";
import type { Doctor, InsertAppointment } from "@shared/schema";

const bookingFormSchema = z.object({
  patientFirstName: z.string().min(1, "First name is required"),
  patientLastName: z.string().min(1, "Last name is required"),
  patientEmail: z.string().email("Please enter a valid email"),
  patientPhone: z.string().min(10, "Please enter a valid phone number"),
  patientDateOfBirth: z.string().min(1, "Date of birth is required"),
  reasonForVisit: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/booking/:doctorId");
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const doctorId = params?.doctorId ? parseInt(params.doctorId) : null;

  const { data: doctor, isLoading: doctorLoading } = useQuery<Doctor>({
    queryKey: ["/api/doctors", doctorId],
    enabled: !!doctorId,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      patientFirstName: "",
      patientLastName: "",
      patientEmail: "",
      patientPhone: "",
      patientDateOfBirth: "",
      reasonForVisit: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked Successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setLocation("/appointments");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!doctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    const appointmentData: InsertAppointment = {
      doctorId: doctor.id,
      appointmentDate: selectedDate.toISOString().split('T')[0],
      appointmentTime: selectedTime,
      status: "scheduled",
      ...data,
    };

    bookingMutation.mutate(appointmentData);
  };

  if (!match || !doctorId) {
    return <div>Doctor not found</div>;
  }

  if (doctorLoading) {
    return <div>Loading...</div>;
  }

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  const rating = doctor.rating / 10;
  const fee = doctor.consultationFee / 100;

  return (
    <div className="min-h-screen bg-clean-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Search</span>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
            <p className="text-lg text-slate-gray">Choose your preferred date and time</p>
          </div>
        </div>

        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Doctor Summary */}
          <div className="bg-gradient-to-r from-medical-blue to-professional-purple text-white p-6">
            <div className="flex items-center space-x-4">
              <img 
                src={doctor.imageUrl} 
                alt={doctor.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
              <div>
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="text-blue-100">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                  <span className="ml-1 text-sm">{rating.toFixed(1)} rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                    className="rounded-md border"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
                <div className="grid grid-cols-3 gap-3">
                  {doctor.availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 text-sm transition-all font-medium ${
                        selectedTime === time 
                          ? "bg-medical-blue text-white" 
                          : "border-gray-300 hover:border-medical-blue hover:bg-medical-blue hover:text-white"
                      }`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Information Form */}
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Information</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="patientFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientDateOfBirth"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reasonForVisit"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Reason for Visit</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3}
                              placeholder="Brief description of your symptoms or reason for the appointment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Appointment Summary */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="bg-clean-bg rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-gray">Doctor:</span>
                          <span className="font-semibold">{doctor.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-gray">Date:</span>
                          <span className="font-semibold">
                            {selectedDate?.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-gray">Time:</span>
                          <span className="font-semibold">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-gray">Duration:</span>
                          <span className="font-semibold">30 minutes</span>
                        </div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">Consultation Fee:</span>
                            <span className="font-bold text-medical-blue">${fee}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/")}
                        className="flex-1"
                      >
                        Go Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={bookingMutation.isPending || !selectedDate || !selectedTime}
                        className="flex-1 bg-healthcare-green text-white hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        {bookingMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Confirm Booking</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
