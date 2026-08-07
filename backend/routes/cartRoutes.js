const express = require("express");
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart);

router.route("/:id")
  .delete(removeFromCart);

module.exports = router;
