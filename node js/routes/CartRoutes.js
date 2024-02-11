// cartRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdminRole } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');

// Get the user's cart (Only connected user)
router.get('/cart/user', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;
        console.log("b1")
        // Call the controller function to get the user's cart
        const cartId = (await cartController.getUserCartID(userId)).cartId;

        const result = await cartController.getCartDetail(cartId);

        // Respond with the result
        res.json(result);
    } catch (error) {

        console.error('Error getting user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Affect a product to the user's cart with a specific quantity (Only connected user)
router.post('/cart/affect-product', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;

        // Extract product details from the request body
        const { success ,productId, quantity } = req.body;
        const cartId = (await cartController.getUserCartID(userId)).cartId;
        // Call the controller function to affect a product to the user's cart
        const result = await cartController.affectProductToCart(productId,cartId , quantity);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error affecting product to user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Remove a product from the user's cart (Only connected user)
router.delete('/cart/remove-product/:productId', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;
        const cartId = (await cartController.getUserCartID(userId)).cartId;
        const { productId } = req.params;

        // Call the controller function to remove the product from the user's cart
        const result = await cartController.removeProductFromCart(productId,cartId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error removing product from user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get the total number of distinct products in the user's cart (Only connected user)
router.get('/cart/total-products', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;
        // Call the controller function to get the cart ID for the user
        const cartId = (await cartController.getUserCartID(userId)).cartId;

        // Call the controller function to calculate the total number of distinct products in the cart
         const totalProducts = await cartController.getTotalProductsInCart(cartId);

        // Respond with the total number of distinct products
        res.json({ totalProducts });
    } catch (error) {
        console.error('Error getting total distinct products in user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// View all carts with details (Only for admin)
router.get('/cart/all', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        // Call the controller function to get all carts
        const result = await cartController.viewAllCartsPayedWithDetails();

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error viewing all carts:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a cart (Only for admin)
router.delete('/cart/delete/:cartId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        // Extract cart ID from the request parameters
        const { cartId } = req.params;

        // Call the controller function to delete the cart
        const result = await cartController.deleteCart(cartId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error deleting cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Route to update payment date (requires authentication)
router.put('/cart/pay', verifyToken, async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId =  req.user.id; // Get the user ID from the authenticated user
        const resCartId = await cartController.getUserCartID(userId);



        const result = await cartController.updatePaymentDate(resCartId.cartId);
        res.json(result);
    } catch (error) {
        console.error('Error updating payment date:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Increase product quantity in the user's cart (Only connected user)
router.put('/cart/increase-product-quantity/:productId', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user

        const userId = req.user.id;
        const cartId = (await cartController.getUserCartID(userId)).cartId;
        const { productId } = req.params;
        // Call the controller function to increase product quantity in the user's cart
        const result = await cartController.increaseProductQuantityInCart(productId, cartId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error increasing product quantity in user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;