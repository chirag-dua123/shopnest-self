const Cart = require("../model/cart");
const Product = require("../model/product");

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: "items.product",
      select: "name price image countInStock category description",
    });

    // If no cart exists, create an empty one
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc    Add product to cart (or update quantity)
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Stock validation check
      if (newQuantity > product.countInStock) {
        return res.status(400).json({
          message: `Cannot add requested quantity. Only ${product.countInStock} items are available in stock, and you already have ${cart.items[itemIndex].quantity} in your cart.`,
        });
      }
      
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Item doesn't exist, validate stock check and push
      if (quantity > product.countInStock) {
        return res.status(400).json({
          message: `Cannot add requested quantity. Only ${product.countInStock} items are available in stock.`,
        });
      }
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price image countInStock category description",
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Product ID format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the product to be removed
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === originalItemCount) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price image countInStock category description",
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Product ID format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};