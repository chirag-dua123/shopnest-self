const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getAllOrders); // Admin route

// Legacy route mapping to keep frontend working if it relies on /create-order
router.post('/create-order', protect, createOrder);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrderStatus); // Admin update status

module.exports = router;