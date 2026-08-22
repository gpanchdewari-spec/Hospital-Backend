import express from "express";

import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updatePaymentStatus,
  deleteAppointment,
  getAvailableSlots,
  createEmergencyAppointment,
  getEmergencyAppointments,
  acceptEmergencyAppointment,
} from "../controllers/appointmentController.js";

import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ================= NORMAL APPOINTMENT =================

// Book appointment
router.post("/", protect, authorizeRoles("patient"), createAppointment);

// Logged-in patient's appointments
router.get("/my", protect, authorizeRoles("patient"), getMyAppointments);

// ================= AVAILABLE SLOTS =================

router.get("/slots/:doctorId", getAvailableSlots);

// ================= EMERGENCY =================

// Patient creates emergency
router.post(
  "/emergency",
  protect,
  authorizeRoles("patient"),
  createEmergencyAppointment,
);

// All doctors see pending emergencies
router.get(
  "/emergency",
  protect,
  authorizeRoles("doctor"),
  getEmergencyAppointments,
);

// Doctor accepts emergency
router.put(
  "/emergency/:id/accept",
  protect,
  authorizeRoles("doctor"),
  acceptEmergencyAppointment,
);

// ================= ALL APPOINTMENTS =================

// Admin / doctor etc.
router.get("/", protect, getAllAppointments);

// ================= DYNAMIC ID ROUTES =================
// KEEP THESE AFTER SPECIFIC ROUTES

router.get("/:id", protect, getAppointmentById);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("admin", "doctor"),
  updateAppointmentStatus,
);

router.put(
  "/:id/payment",
  protect,
  authorizeRoles("admin", "doctor"),
  updatePaymentStatus,
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteAppointment);

export default router;
