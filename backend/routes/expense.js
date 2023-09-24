const express = require("express");
const {
  addExpense,
  getUserExpenses,
  deleteUserExpense,
} = require("../controllers/expenseController");
const protected = require("../middleware/auth");

const router = express.Router();

router.route("/create").post(protected, addExpense);
router.route("/user").get(protected, getUserExpenses);
router.route("/delete/:id").delete(protected, deleteUserExpense);

module.exports = router;
