import {
  doctors,
  appointments,
  type Doctor,
  type InsertDoctor,
  type Appointment,
  type InsertAppointment,
  type DoctorWithNextAvailable,
  type AppointmentWithDoctor,
} from "@shared/schema";

export interface IStorage {
  // Doctor methods
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsBySpecialty(specialty: string): Promise<Doctor[]>;
  searchDoctors(specialty?: string, location?: string): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;

  // Appointment methods
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(
    patientEmail: string
  ): Promise<AppointmentWithDoctor[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(
    id: number,
    status: string
  ): Promise<Appointment | undefined>;
  checkTimeSlotAvailability(
    doctorId: number,
    date: string,
    time: string
  ): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private doctors: Map<number, Doctor>;
  private appointments: Map<number, Appointment>;
  private doctorIdCounter: number;
  private appointmentIdCounter: number;

  constructor() {
    this.doctors = new Map();
    this.appointments = new Map();
    this.doctorIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.seedData();
  }

  private seedData() {
    // Seed with some sample doctors
    const sampleDoctors: InsertDoctor[] = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        education: "Harvard Medical School",
        location: "Downtown Medical Center",
        experience: "15+ years experience",
        rating: 49,
        imageUrl:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 15000, // $150.00
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        availableTimeSlots: [
          "9:00 AM",
          "10:30 AM",
          "11:00 AM",
          "2:30 PM",
          "3:00 PM",
          "4:30 PM",
        ],
      },
      {
        name: "Dr. Michael Chen",
        specialty: "Pediatrician",
        education: "Johns Hopkins University",
        location: "Children's Healthcare Center",
        experience: "12+ years experience",
        rating: 48,
        imageUrl:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 12000, // $120.00
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        availableTimeSlots: [
          "8:00 AM",
          "9:30 AM",
          "10:00 AM",
          "11:30 AM",
          "2:00 PM",
          "3:30 PM",
        ],
      },
      {
        name: "Dr. Emily Rodriguez",
        specialty: "Dermatologist",
        education: "Stanford Medical School",
        location: "Advanced Skin Care Clinic",
        experience: "10+ years experience",
        rating: 49,
        imageUrl:
          "https://images.unsplash.com/photo-1594824720693-b9aca4e8b57b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 18000, // $180.00
        availableDays: [
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        availableTimeSlots: [
          "9:00 AM",
          "10:00 AM",
          "11:00 AM",
          "1:00 PM",
          "2:00 PM",
          "3:00 PM",
        ],
      },
      {
        name: "Dr. James Wilson",
        specialty: "General Practice",
        education: "UCLA Medical School",
        location: "Community Health Center",
        experience: "8+ years experience",
        rating: 46,
        imageUrl:
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 10000, // $100.00
        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        availableTimeSlots: [
          "8:30 AM",
          "9:30 AM",
          "10:30 AM",
          "1:30 PM",
          "2:30 PM",
          "3:30 PM",
        ],
      },
      {
        name: "Dr. Lisa Anderson",
        specialty: "Orthopedics",
        education: "Mayo Clinic Medical School",
        location: "Sports Medicine Institute",
        experience: "18+ years experience",
        rating: 50,
        imageUrl:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 20000, // $200.00
        availableDays: ["monday", "wednesday", "thursday", "friday"],
        availableTimeSlots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      },
    ];

    sampleDoctors.forEach((doctor) => {
      this.createDoctor(doctor);
    });
  }

  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter((doctor) =>
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  async searchDoctors(
    specialty?: string,
    location?: string
  ): Promise<Doctor[]> {
    let results = Array.from(this.doctors.values());

    if (specialty && specialty !== "Select specialty...") {
      results = results.filter((doctor) =>
        doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    if (location) {
      results = results.filter((doctor) =>
        doctor.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    return results;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.doctorIdCounter++;
    const doctor: Doctor = {
      ...insertDoctor,
      rating: insertDoctor.rating ?? 50,
      id,
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }

  async getAppointmentsByPatient(
    patientEmail: string
  ): Promise<AppointmentWithDoctor[]> {
    const appointments = Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientEmail === patientEmail
    );

    const appointmentsWithDoctor: AppointmentWithDoctor[] = [];
    for (const appointment of appointments) {
      const doctor = this.doctors.get(appointment.doctorId);
      if (doctor) {
        appointmentsWithDoctor.push({ ...appointment, doctor });
      }
    }

    return appointmentsWithDoctor;
  }

  async createAppointment(
    insertAppointment: InsertAppointment
  ): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: new Date(),
      status: insertAppointment.status ?? "scheduled",
      reasonForVisit: insertAppointment.reasonForVisit ?? null,
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(
    id: number,
    status: string
  ): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status;
      this.appointments.set(id, appointment);
      return appointment;
    }
    return undefined;
  }

  async checkTimeSlotAvailability(
    doctorId: number,
    date: string,
    time: string
  ): Promise<boolean> {
    const existingAppointments = Array.from(this.appointments.values()).filter(
      (appointment) =>
        appointment.doctorId === doctorId &&
        appointment.appointmentDate === date &&
        appointment.appointmentTime === time &&
        appointment.status !== "cancelled"
    );

    return existingAppointments.length === 0;
  }
}

export const storage = new MemStorage();
