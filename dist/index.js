// server/index.ts
import express2 from "express";
// server/routes.ts
import { createServer } from "http";

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/storage.ts
var MemStorage = class {
  doctors;
  appointments;
  doctorIdCounter;
  appointmentIdCounter;
  constructor() {
    this.doctors = /* @__PURE__ */ new Map();
    this.appointments = /* @__PURE__ */ new Map();
    this.doctorIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.seedData();
  }
  seedData() {
    const sampleDoctors = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiologist",
        education: "Harvard Medical School",
        location: "Downtown Medical Center",
        experience: "15+ years experience",
        rating: 49,
        imageUrl:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        consultationFee: 15e3,
        // $150.00
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
        consultationFee: 12e3,
        // $120.00
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
        consultationFee: 18e3,
        // $180.00
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
        consultationFee: 1e4,
        // $100.00
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
        consultationFee: 2e4,
        // $200.00
        availableDays: ["monday", "wednesday", "thursday", "friday"],
        availableTimeSlots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      },
    ];
    sampleDoctors.forEach((doctor) => {
      this.createDoctor(doctor);
    });
  }
  async getDoctors() {
    return Array.from(this.doctors.values());
  }
  async getDoctor(id) {
    return this.doctors.get(id);
  }
  async getDoctorsBySpecialty(specialty) {
    return Array.from(this.doctors.values()).filter((doctor) =>
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }
  async searchDoctors(specialty, location) {
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
  async createDoctor(insertDoctor) {
    const id = this.doctorIdCounter++;
    const doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }
  async getAppointments() {
    return Array.from(this.appointments.values());
  }
  async getAppointment(id) {
    return this.appointments.get(id);
  }
  async getAppointmentsByDoctor(doctorId) {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }
  async getAppointmentsByPatient(patientEmail) {
    const appointments2 = Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientEmail === patientEmail
    );
    const appointmentsWithDoctor = [];
    for (const appointment of appointments2) {
      const doctor = this.doctors.get(appointment.doctorId);
      if (doctor) {
        appointmentsWithDoctor.push({ ...appointment, doctor });
      }
    }
    return appointmentsWithDoctor;
  }
  async createAppointment(insertAppointment) {
    const id = this.appointmentIdCounter++;
    const appointment = {
      ...insertAppointment,
      id,
      createdAt: /* @__PURE__ */ new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  async updateAppointmentStatus(id, status) {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status;
      this.appointments.set(id, appointment);
      return appointment;
    }
    return void 0;
  }
  async checkTimeSlotAvailability(doctorId, date2, time) {
    const existingAppointments = Array.from(this.appointments.values()).filter(
      (appointment) =>
        appointment.doctorId === doctorId &&
        appointment.appointmentDate === date2 &&
        appointment.appointmentTime === time &&
        appointment.status !== "cancelled"
    );
    return existingAppointments.length === 0;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  education: text("education").notNull(),
  location: text("location").notNull(),
  experience: text("experience").notNull(),
  rating: integer("rating").notNull().default(50),
  // stored as 50 = 5.0 rating
  imageUrl: text("image_url").notNull(),
  consultationFee: integer("consultation_fee").notNull(),
  // in cents
  availableDays: text("available_days").array().notNull(),
  availableTimeSlots: text("available_time_slots").array().notNull(),
});
var appointments = pgTable("appointments", {
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
  status: text("status").notNull().default("scheduled"),
  // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
var insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});
var insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/doctors", async (req, res) => {
    try {
      const doctors2 = await storage.getDoctors();
      res.json(doctors2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });
  app2.get("/api/doctors/search", async (req, res) => {
    try {
      const { specialty, location } = req.query;
      const doctors2 = await storage.searchDoctors(specialty, location);
      res.json(doctors2);
    } catch (error) {
      res.status(500).json({ error: "Failed to search doctors" });
    }
  });
  app2.get("/api/doctors/:id", async (req, res) => {
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
  app2.get("/api/doctors/:id/appointments", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const appointments2 = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });
  app2.get("/api/doctors/:id/availability", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { date: date2, time } = req.query;
      if (!date2 || !time) {
        return res.status(400).json({ error: "Date and time are required" });
      }
      const isAvailable = await storage.checkTimeSlotAvailability(
        doctorId,
        date2,
        time
      );
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ error: "Failed to check availability" });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const isAvailable = await storage.checkTimeSlotAvailability(
        validatedData.doctorId,
        validatedData.appointmentDate,
        validatedData.appointmentTime
      );
      if (!isAvailable) {
        return res.status(409).json({
          error: "The selected time slot is no longer available",
        });
      }
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid appointment data",
          details: error.errors,
        });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });
  app2.get("/api/appointments", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
      }
      const appointments2 = await storage.getAppointmentsByPatient(email);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });
  app2.patch("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const appointment = await storage.updateAppointmentStatus(
        appointmentId,
        status
      );
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = /* @__PURE__ */ new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
       __dirname, 'client', 'src',        
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`[express] serving on port ${port}`);
      console.log(`Server running at http://localhost:${port}`);
    }
  );
})();
