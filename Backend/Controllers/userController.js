const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// 🔐 Validation Schemas
const baseUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[+]?\d{10,15}$/, "Phone must be a valid international format like +919876543210"),
  currentLocation: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  jobType: z.string().optional(),
  desiredPosition: z.string().optional(),
  desiredSalary: z.string().optional(),
  workPreference: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  portfolio: z.string().url().optional(),
  github: z.string().url().optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional()
});

const signupSchema = baseUserSchema.extend({ password: z.string().min(6) });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// ✅ Signup
const signup = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { name, email, password, phone } = parsed.data;

  try {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) {
      const conflictField = existing.email === email ? "email" : "phone";
      return res.status(409).json({ error: `User already exists with this ${conflictField}` });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, phone } });
    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
};

// ✅ Login
const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    console.log("✅ Logged in user:", user);

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error("❌ Login backend error:", err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
};

// ✅ Update Profile
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const {
    currentLocation,
    preferredLocations,
    jobType,
    desiredPosition,
    desiredSalary,
    workPreference,
    skills,
    portfolio,
    github,
    phone,
    experience,
    education,
    languages,
    certifications
  } = req.body;

  const parseArray = (input) => {
    if (!input) return [];
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return [];
      }
    }
    return Array.isArray(input) ? input : [];
  };

  const parsedData = {
    currentLocation,
    preferredLocations: parseArray(preferredLocations),
    jobType,
    desiredPosition,
    desiredSalary,
    workPreference: parseArray(workPreference),
    skills: parseArray(skills),
    portfolio,
    github,
    phone,
    experience: parseArray(experience),
    education: parseArray(education),
    languages: parseArray(languages),
    certifications: parseArray(certifications)
  };

  const profileSchema = z.object({
    currentLocation: z.string().min(1, "Current location is required"),
    preferredLocations: z.array(z.string()).min(1, "Preferred locations required"),
    jobType: z.string().min(1, "Job type required"),
    desiredPosition: z.string().min(1, "Desired position required"),
    desiredSalary: z.string().min(1, "Salary required"),
    workPreference: z.array(z.string()).min(1, "Work preference required"),
    skills: z.array(z.string()).min(1, "Skills required")
  });

  const parsed = profileSchema.safeParse(parsedData);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  console.log("🔍 Parsed update data:", parsedData);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: parsedData
    });
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', detail: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', detail: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count()
    ]);
    res.json({ total, page, limit, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = {
  signup,
  login,
  updateUser,
  getUserById,
  getAllUsers,
  getCurrentUser
};