const Visitor = require("../models/Visitor");
const Contact = require("../models/Contact");
const Subscription = require("../models/Subscription");

// Helper to get last N months
const getLastMonths = (count = 6) => {
  const months = [];
  const date = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleString("default", { month: "short" }),
    });
  }
  return months;
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const months = getLastMonths(6);

    const aggregateByMonth = (Model) =>
      Model.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

    const [visitorAgg, contactAgg, subscriberAgg] = await Promise.all([
      aggregateByMonth(Visitor),
      aggregateByMonth(Contact),
      aggregateByMonth(Subscription),
    ]);

    const buildTrend = (aggData) =>
      months.map((m) => {
        const found = aggData.find(
          (a) => a._id.month === m.month && a._id.year === m.year
        );
        return found ? found.count : 0;
      });

    res.status(200).json({
      months: months.map((m) => m.label),
      trends: {
        visitors: buildTrend(visitorAgg),
        contacts: buildTrend(contactAgg),
        subscribers: buildTrend(subscriberAgg),
      },
    });
  } catch (error) {
    console.error("Admin dashboard overview error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};