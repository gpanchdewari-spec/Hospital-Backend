import express from "express";

import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getPublicDoctors,
 
} from "../controllers/doctorController.js";

import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/public", getPublicDoctors);

router.post("/", protect, authorizeRoles("admin"), createDoctor);

router.get("/", protect, getAllDoctors);

router.get("/:id", protect, getDoctorById);

router.put("/:id", protect, authorizeRoles("admin"), updateDoctor);

router.delete("/:id", protect, authorizeRoles("admin"), deleteDoctor);


export default router;
