const service = require("../services/transactionService");

async function create(req, res, next) {
  try {
    const transaction = await service.createTransaction(
      req.user.id,
      req.validatedTransaction,
    );

    return res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const { type, category, from, to, search, page, limit } = req.query;

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: {
          code: "INVALID_FILTER",
          message: "Type must be income or expense.",
          details: [],
        },
      });
    }

    if (
      (from && !isValidDate(from)) ||
      (to && !isValidDate(to)) ||
      (from && to && from > to)
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_DATE_FILTER",
          message:
            "Provide valid dates and ensure the start date is not after the end date.",
          details: [],
        },
      });
    }

    const parsedPage = page === undefined ? 1 : Number(page);
    const parsedLimit = limit === undefined ? 10 : Number(limit);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1 ||
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message: "Page must be positive and limit must be between 1 and 100.",
          details: [],
        },
      });
    }

    const result = await service.listTransactions(req.user.id, {
      type,
      category,
      from,
      to,
      search,
      page: parsedPage,
      limit: parsedLimit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await service.updateTransaction(
      req.user.id,
      req.params.id,
      req.validatedTransaction,
    );

    if (!transaction) {
      return res.status(404).json({
        error: {
          code: "TRANSACTION_NOT_FOUND",
          message: "Transaction not found.",
          details: [],
        },
      });
    }

    return res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await service.deleteTransaction(req.user.id, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: "TRANSACTION_NOT_FOUND",
          message: "Transaction not found.",
          details: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

module.exports = { create, list, update, remove };
