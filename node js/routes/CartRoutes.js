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

        // Call the controller function to get the user's cart
        const result = await cartController.getUserCart(userId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error getting user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new cart for the connected user (Only connected user)
router.post('/cart/create', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;

        // Call the controller function to create a new cart for the user
        const result = await cartController.createNewCartForUser(userId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error creating user cart:', error.message);
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
        let cartId= (await cartController.getUserCart(userId)).cartId;
        // Call the controller function to affect a product to the user's cart
        const result = await cartController.affectProductToCart(productId,cartId , quantity);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error affecting product to user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update the quantity of a specific product in the user's cart (Only connected user)
router.put('/cart/update-product/:productId', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;

        // Extract product ID and new quantity from the request parameters and body
        const { productId } = req.params;
        const { quantity } = req.body;

        // Call the controller function to update the product quantity in the user's cart
        const result = await cartController.updateProductQuantityInCart(userId, productId, quantity);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error updating product quantity in user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove a product from the user's cart (Only connected user)
router.delete('/cart/remove-product/:productId', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.user.id;

        // Extract product ID from the request parameters
        const { productId } = req.params;

        // Call the controller function to remove the product from the user's cart
        const result = await cartController.removeProductFromCart(userId, productId);

        // Respond with the result
        res.json(result);
    } catch (error) {
        console.error('Error removing product from user cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// View all carts (Only for admin)
router.get('/cart/all', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        // Call the controller function to get all carts
        const result = await cartController.viewAllCarts();

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
router.put('/cart/pay/:cartId', verifyToken, async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId = req.user.id; // Get the user ID from the authenticated user

        // Check if the cart belongs to the authenticated user
        const isUserCart = await cartController.isUserCart(userId, cartId);
        if (!isUserCart) {
            return res.status(403).json({ error: 'Forbidden - Cart does not belong to the user' });
        }

        const result = await cartController.updatePaymentDate(cartId);
        res.json(result);
    } catch (error) {
        console.error('Error updating payment date:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
