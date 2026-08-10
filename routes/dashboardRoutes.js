import express from "express";
import { adminDashboard } from "../controllers/dashboardController.js";
import protect from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/admin", protect, authorizeRoles("admin"), adminDashboard);

export default router;
