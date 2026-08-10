import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import Patient from "../models/Patient.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, bloodGroup, phone, address } =
      req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
    });

    // Create Patient Profile
    await Patient.create({
      userId: user._id,
      age,
      gender,
      bloodGroup,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      token: generateToken(user._id, user.role),
      user,
    });
  } catch (error) {
    console.log("Registration Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
