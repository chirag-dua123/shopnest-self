const Order = require('../model/orders');
const Product = require('../model/product');
const User = require('../model/user');

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });

    const orders = await Order.find({});
    // Using totalPrice since your order model uses totalPrice instead of totalAmount
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);

    res.json({ totalOrders, totalProducts, totalUsers, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminStats };
