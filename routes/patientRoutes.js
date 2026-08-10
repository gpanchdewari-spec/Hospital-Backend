import express from "express";

import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createPatient);

router.get("/", protect, getAllPatients);

router.get("/:id", protect, getPatientById);

router.put("/:id", protect, authorizeRoles("admin"), updatePatient);

router.delete("/:id", protect, authorizeRoles("admin"), deletePatient);

export default router;
