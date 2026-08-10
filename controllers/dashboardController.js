import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

export const adminDashboard = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const appointments = await Appointment.find();

    const totalBookingAmount = appointments.reduce(
      (total, appointment) => total + (appointment.consultationFee || 0),
      0,
    );

    const totalPaidAmount = appointments
      .filter((appointment) => appointment.paymentStatus === "Paid")
      .reduce(
        (total, appointment) => total + (appointment.consultationFee || 0),
        0,
      );

    const pendingAppointments = await Appointment.countDocuments({
      status: "Pending",
    });

    const approvedAppointments = await Appointment.countDocuments({
      status: "Approved",
    });

    const completedAppointments = await Appointment.countDocuments({
      status: "Completed",
    });

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    res.status(200).json({
      success: true,
      dashboard: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        completedAppointments,
        recentAppointments,
        totalBookingAmount,
        totalPaidAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
