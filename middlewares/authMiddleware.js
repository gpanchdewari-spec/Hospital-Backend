import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "No Token",
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Token Invalid",
    });
  }

  const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

  console.log("Decoded Token:", decoded);

  req.user = decoded;
};

export default protect;
