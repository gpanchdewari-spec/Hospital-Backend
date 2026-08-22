import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      profileImage,
      email,
      password,
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
      about,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      userId: user._id,
      profileImage,
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
      about,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "-password");

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//docter by id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "-password",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

///update doctr
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete doctor

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndDelete(doctor.userId);

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Public Doctor Routes

export const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "name email")
      .select(
        "userId specialization qualification experience consultationFee profileImage",
      );

    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get logged-in doctor's availability
export const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      availability: doctor.availability || [],
      unavailableDates: doctor.unavailableDates || [],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to fetch availability",
    });
  }
};


//availaibility

export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        message: "Availability must be an array",
      });
    }

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.availability = availability;

    await doctor.save();

    res.status(200).json({
      message: "Availability updated successfully",
      availability: doctor.availability,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to update availability",
    });
  }
};






// Add specific unavailable date
export const addUnavailableDate = async (req, res) => {
  try {
    const userId = req.user.id;

    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    // Normalize date
    selectedDate.setHours(0, 0, 0, 0);

    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Check duplicate leave
    const alreadyUnavailable = doctor.unavailableDates?.some(
      (item) => {
        const existingDate = new Date(item.date);
        existingDate.setHours(0, 0, 0, 0);

        return existingDate.getTime() === selectedDate.getTime();
      },
    );

    if (alreadyUnavailable) {
      return res.status(400).json({
        message: "This date is already marked as unavailable",
      });
    }

    doctor.unavailableDates.push({
      date: selectedDate,
      reason: reason || "",
    });

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Leave added successfully",
      unavailableDates: doctor.unavailableDates,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Unable to add leave",
    });
  }
};