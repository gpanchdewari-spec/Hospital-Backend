import express from "express";

import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updatePaymentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";

import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Book appointment
router.post("/", protect, authorizeRoles("patient"), createAppointment);

// Get logged-in patient's appointments
router.get("/my", protect, authorizeRoles("patient"), getMyAppointments);

// Get all appointments
router.get("/", protect, getAllAppointments);

// Get one appointment
router.get("/:id", protect, getAppointmentById);

// Update appointment status
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

// Delete appointment
router.delete("/:id", protect, authorizeRoles("admin"), deleteAppointment);

export default router;
