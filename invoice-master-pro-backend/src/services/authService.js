const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (email, password, name, role = "STAFF") => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      // TODO: Handle organization assignment later
    },
  });

  // Exclude password from the returned user object
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, orgId: user.orgId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token expires in 1 hour
  );

  // Exclude password from the returned user object
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

module.exports = {
  registerUser,
  loginUser,
};

