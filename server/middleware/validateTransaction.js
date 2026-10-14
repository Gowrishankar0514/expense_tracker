function validateTransaction(req, res, next) {
  const { title, amount, type, category, transactionDate, notes } =
    req.body || {};

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
    numericAmount > 9999999999.99
  ) {
    errors.push({ field: "amount", message: "Enter a valid positive amount." });
  }

  if (!["income", "expense"].includes(type)) {
    errors.push({ field: "type", message: "Type must be income or expense." });
  }

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 100
  ) {
    errors.push({
      field: "category",
      message: "Category is required and must be at most 100 characters.",
    });
  }

  // Require a real calendar date in YYYY-MM-DD format.
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

  if (
    notes !== undefined &&
    notes !== null &&
    (typeof notes !== "string" || notes.length > 5000)
  ) {
    errors.push({
      field: "notes",
      message: "Notes must be text with at most 5000 characters.",
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
    notes: notes?.trim() || null,
  };

  next();
}

module.exports = validateTransaction;
