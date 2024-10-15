const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

router.post('/add', async (req, res) => {
    try {
        const bookId = req.body.bookId;
        console.log(bookId);
        
        // ตรวจสอบว่าเป็นผู้ใช้ที่ล็อกอินหรือไม่
        const userId = req.session.userId || null;
        const sessionId = req.sessionID;

        // ค้นหา cart โดยใช้ userId (ถ้าผู้ใช้ล็อกอิน) หรือ sessionId (สำหรับ guest user)
        let cart;
        if (userId) {
            cart = await Cart.findOne({ userId: userId });
        } else {
            cart = await Cart.findOne({ sessionId: sessionId });
        }
        console.log(1);
        
        // ถ้ายังไม่มีตะกร้า ให้สร้างใหม่
        if (!cart) {
            cart = new Cart({ sessionId: sessionId, items: [], totalAmount: 0 });
            if (userId) {
                cart.userId = userId;
            }
        }

        // ตรวจสอบว่าสินค้าอยู่ในตะกร้าหรือไม่
        const existingItem = cart.items.find(item => item.bookId == bookId);

        if (existingItem) {
            // เพิ่มจำนวนสินค้าในตะกร้า
            existingItem.quantity += 1;
        } else {
            // เพิ่มสินค้าใหม่ลงในตะกร้า
            cart.items.push({ bookId: bookId, quantity: 1 });
        }

        // คำนวณยอดรวมสินค้าในตะกร้า
        cart.totalAmount = cart.items.reduce((total, item) => {
            // ตรวจสอบว่า item.price และ item.quantity เป็นตัวเลข
            const itemPrice = item.price || 0; // ใช้ 0 ถ้า price ไม่มี
            const itemQuantity = item.quantity || 0; // ใช้ 0 ถ้า quantity ไม่มี
            return total + (itemPrice * itemQuantity);
        }, 0);

        // บันทึกตะกร้าในฐานข้อมูล
        await cart.save();

        // คำนวณจำนวนสินค้าทั้งหมดในตะกร้า
        const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

        req.session.cart = cartCount

        // ส่งจำนวนสินค้ากลับไปยัง client
        res.json({ cartCount: cartCount });
    } catch (error) {
        console.error('Error adding to cart:', error);
        // ส่งข้อความข้อผิดพลาดกลับไปยัง client
        res.status(500).json({ message: 'มีข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า' });
    }
});




module.exports = router;
