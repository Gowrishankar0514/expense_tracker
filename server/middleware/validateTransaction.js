function validateTransaction(req, res, next) {
  const { title, amount, type, category, transactionDate } = req.body || {};

  const errors = [];

  if (typeof title !== "string" || !title.trim() || title.trim().length > 150) {
    errors.push({
      field: "title",
      message: "Title is required and must be at most 150 characters.",
    });
  }

  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string" && amount.trim() !== ""
        ? Number(amount)
        : NaN;

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount > 9999999999.99 ||
    numericAmount * 100 !== Math.round(numericAmount * 100)
  ) {
    errors.push({
      field: "amount",
      message: "Enter a valid positive amount with up to 2 decimal places.",
    });
  }

  if (!["income", "expense"].includes(type)) {
    errors.push({ field: "type", message: "Type must be income or expense." });
  }

  const expenseCategories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Healthcare",
    "Others",
  ];

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Other Income",
  ];

  const allowedCategories =
    type === "income" ? incomeCategories : expenseCategories;

  if (
    typeof category !== "string" ||
    !allowedCategories.includes(category.trim())
  ) {
    errors.push({
      field: "category",
      message:
        type === "income"
          ? "Please select a valid income category."
          : "Please select a valid expense category.",
    });
  }

  const validDate =
    typeof transactionDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(transactionDate) &&
    (() => {
      const date = new Date(`${transactionDate}T00:00:00Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === transactionDate
      );
    })();

  if (!validDate) {
    errors.push({
      field: "transactionDate",
      message: "Enter a valid date in YYYY-MM-DD format.",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please correct the transaction details.",
        details: errors,
      },
    });
  }

  req.validatedTransaction = {
    title: title.trim(),
    amount: numericAmount,
    type,
    category: category.trim(),
    transactionDate,
  };

  next();
}

module.exports = validateTransaction;
