const Business = require('../models/Business');

module.exports.getOverviewStats = async (req, res) => {
  const userId = req.params.id;

  try {
    console.log("Fetching business stats for user:", userId);

    const businesses = await Business.find({ owner: userId });

    console.log("Found businesses:", businesses.length);

    if (businesses.length === 0) {
      return res.status(200).json({
        totalRevenue: 0,
        activeLeads: 0,
        businessCount: 0,
        conversionRate: 0,
      });
    }

    let totalRevenue = 0;
    let activeLeads = 0;
    let conversionRateSum = 0;

    businesses.forEach(biz => {
      totalRevenue += biz.revenue || 0;
      activeLeads += biz.activeLeads || 0;
      conversionRateSum += biz.conversionRate || 0;
    });

    const averageConversionRate = conversionRateSum / businesses.length;

    return res.status(200).json({
      totalRevenue,
      activeLeads,
      businessCount: businesses.length,
      conversionRate: Number(averageConversionRate.toFixed(1)),
    });

  } catch (err) {
    console.error("Error in getOverviewStats:", err);
    return res.status(500).json({ error: "Dashboard data fetch failed" });
  }
};