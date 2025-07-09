const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardData = async (req, res) => {
  const userId = req.params.userId;
  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { dateApplied: 'desc' }
    });

    const suggestedJobs = await prisma.suggestedJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ applications, suggestedJobs });
  } catch (error) {
    res.status(500).json({ error: "Dashboard data fetch failed" });
  }
};

module.exports = { getDashboardData };