const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../model/orders');

// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // Fetch order from DB
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Prevent creating a payment for an already paid order
        if (order.isPaid) {
            return res.status(400).json({ message: "Order is already paid" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        
        // Razorpay takes amount in paise (smallest currency unit for INR)
        // Adjust this depending on your currency
        const amount = Math.round(order.totalPrice * 100);
        
        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_order_${order._id}`,
        };
        
        const razorpayOrder = await razorpay.orders.create(options);
        
        res.status(200).json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Failed to create Razorpay order" });
    }
};

// Verify Payment Signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
             return res.status(400).json({ message: "Missing payment verification details" });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
            
        if (razorpay_signature === expectedSign) {
            // Update order to paid
            const order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentMethod = "Razorpay";
                await order.save();
                
                return res.status(200).json({ message: "Payment verified successfully", order });
            } else {
                return res.status(404).json({ message: "Order not found" });
            }
        } else {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment
};
