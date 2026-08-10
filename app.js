import express from "express";
import cors from "cors";
import protect from "./middlewares/authMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";



const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected Route",
    user: req.user,
  });
});


app.use("/api/doctors", doctorRoutes);

app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SmartCare Hospital API",
  });
});

export default app;
