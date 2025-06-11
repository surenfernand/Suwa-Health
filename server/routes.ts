import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Search doctors
  app.get("/api/doctors/search", async (req, res) => {
    try {
      const { specialty, location } = req.query;
      const doctors = await storage.searchDoctors(
        specialty as string, 
        location as string
      );
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: "Failed to search doctors" });
    }
  });

  // Get doctor by ID
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctor(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctor" });
    }
  });

  // Get doctor's appointments
  app.get("/api/doctors/:id/appointments", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Check time slot availability
  app.get("/api/doctors/:id/availability", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { date, time } = req.query;
      
      if (!date || !time) {
        return res.status(400).json({ error: "Date and time are required" });
      }
      
      const isAvailable = await storage.checkTimeSlotAvailability(
        doctorId, 
        date as string, 
        time as string
      );
      
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check if time slot is still available
      const isAvailable = await storage.checkTimeSlotAvailability(
        validatedData.doctorId,
        validatedData.appointmentDate,
        validatedData.appointmentTime
      );
      
      if (!isAvailable) {
        return res.status(409).json({ 
          error: "The selected time slot is no longer available" 
        });
      }
      
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid appointment data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // Get patient's appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
      }
      
      const appointments = await storage.getAppointmentsByPatient(email as string);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const appointment = await storage.updateAppointmentStatus(appointmentId, status);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
