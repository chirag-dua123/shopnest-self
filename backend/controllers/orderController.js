// create order function that takes in order details from the request body and saves it to the database. The function should validate the input, handle any errors, and return a success response with the created order details.
const Order = require('../model/orders');
const Product = require('../model/product');
const sendMail = require('../utils/sendMail');

const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!orderItems || !orderItems.length || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Calculate totalPrice securely and validate items
        let calculatedTotalPrice = 0;
        const validatedOrderItems = [];

        for (const item of orderItems) {
            // Find product and atomically decrease stock if enough stock exists
            const product = await Product.findOneAndUpdate(
                { _id: item.product, countInStock: { $gte: item.quantity } },
                { $inc: { countInStock: -item.quantity } },
                { new: true }
            );

            if (!product) {
                // To avoid partial deductions, in a real production app we'd use MongoDB transactions here.
                return res.status(400).json({ message: `Product not found or insufficient stock for product ID: ${item.product}` });
            }
            
            // Re-assign name, image, price from DB so client can't spoof them
            validatedOrderItems.push({
                name: product.name,
                quantity: item.quantity,
                image: product.image,
                price: product.price,
                product: product._id
            });

            calculatedTotalPrice += product.price * item.quantity;
        }

        // Create the order
        const newOrder = new Order({
            userId,
            orderItems: validatedOrderItems,
            shippingAddress,
            paymentMethod,
            totalPrice: calculatedTotalPrice
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Send a confirmation mail
        await sendMail(req.user.email, 'Order Confirmation', `Your order for ${savedOrder.orderItems.length} items with ID ${savedOrder._id} at cost ${savedOrder.totalPrice} has been created successfully.`);

        // Return the created order
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: `Invalid format for field ${error.path}: ${error.value}`
            });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get logged in user orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is admin or the order belongs to the user
        if (req.user.role === 'admin' || order.userId._id.toString() === req.user._id.toString()) {
            res.status(200).json(order);
        } else {
            res.status(403).json({ message: 'Not authorized to view this order' });
        }
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid order ID' });
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status } = req.body;
        if (status) {
            order.status = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
        }

        const updatedOrder = await order.save();
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  order: createOrder
};