function getHealth(req, res) {
  res.status(200).json({
    success: true,
    message: "SpendWise backend is running",
  });
}

module.exports = { getHealth };
