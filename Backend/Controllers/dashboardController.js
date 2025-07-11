const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardData = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.profileCompleted) {
      return res.json({
        user: { name: user?.name || "User", profileCompleted: false },
        applications: [],
        suggestedJobs: []
      });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { dateApplied: 'desc' }
    });

    const suggestedJobs = await prisma.suggestedJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ 
      user: { name: user.name, profileCompleted: true },
      applications, 
      suggestedJobs 
    });
  } catch (error) {
    res.status(500).json({ error: "Dashboard data fetch failed" });
  }
};

module.exports = { getDashboardData };