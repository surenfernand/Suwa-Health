import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  education: text("education").notNull(),
  location: text("location").notNull(),
  experience: text("experience").notNull(),
  rating: integer("rating").notNull().default(50), // stored as 50 = 5.0 rating
  imageUrl: text("image_url").notNull(),
  consultationFee: integer("consultation_fee").notNull(), // in cents
  availableDays: text("available_days").array().notNull(),
  availableTimeSlots: text("available_time_slots").array().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  patientFirstName: text("patient_first_name").notNull(),
  patientLastName: text("patient_last_name").notNull(),
  patientEmail: text("patient_email").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientDateOfBirth: date("patient_date_of_birth").notNull(),
  reasonForVisit: text("reason_for_visit"),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Additional types for API responses
export type DoctorWithNextAvailable = Doctor & {
  nextAvailable: string;
};

export type AppointmentWithDoctor = Appointment & {
  doctor: Doctor;
};
