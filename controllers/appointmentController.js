import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // Find logged-in patient's profile
    const patient = await Patient.findOne({
      userId: req.user.id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // Check doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: {
        $ne: "Rejected",
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      consultationFee: doctor.consultationFee,
      appointmentDate,
      appointmentTime,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.log("Create Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get all appointment
export const getAllAppointments = async (req, res) => {
  try {
    let query = {};

    // Doctor → only their appointments
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        userId: req.user.id,
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      query.doctorId = doctor._id;
    }

    // Patient → only their appointments
    if (req.user.role === "patient") {
      const patient = await Patient.findOne({
        userId: req.user.id,
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      query.patientId = patient._id;
    }

    // Admin → query remains {} → gets everything
    const appointments = await Appointment.find(query)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "-password",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "-password",
        },
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.log("Get Appointments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

////get appointment by id

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "-password",
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "-password",
        },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user.id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const appointments = await Appointment.find({
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "-password",
        },
      })
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = req.body.status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.paymentStatus = req.body.paymentStatus;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

///delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//slots



///Availableslots

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Get selected date
    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    // Get day name
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Find doctor's availability for that day
    const availability = doctor.availability.find(
      (item) => item.day === dayName && item.isAvailable === true,
    );

    // Doctor is not available that day
    if (!availability) {
      return res.json({
        date,
        day: dayName,
        slots: [],
        message: "Doctor is not available on this day",
      });
    }

    // Start of selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Start of next day
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find existing appointments
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $ne: "Rejected",
      },
    });

    // Get booked times
    const bookedSlots = appointments.map(
      (appointment) => appointment.appointmentTime,
    );

    const slots = [];

    // Convert start time
    let [startHour, startMinute] = availability.startTime
      .split(":")
      .map(Number);

    // Convert end time
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    // Generate 30-minute slots
    while (
      startHour < endHour ||   
      (startHour === endHour && startMinute < endMinute)
    ) {
      const time = `${String(startHour).padStart(2, "0")}:${String(
        startMinute,
      ).padStart(2, "0")}`;

      // Only add if not booked
      if (!bookedSlots.includes(time)) {
        slots.push(time);
      }

      // Add 30 minutes
      startMinute += 30;

      if (startMinute >= 60) {
        startMinute = 0;
        startHour++;
      }
    }

    res.status(200).json({
      date,
      day: dayName,
      slots,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to fetch available slots",
    });
  }
};