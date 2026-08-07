// create order function that takes in order details from the request body and saves it to the database. The function should validate the input, handle any errors, and return a success response with the created order details.
const Order = require('../model/orders');
const sendMail = require('../utils/sendMail');

const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!orderItems || !shippingAddress || !paymentMethod || !totalPrice) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create the order
        const newOrder = new Order({
            userId,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice
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

module.exports = {
  createOrder,
  order: createOrder
};