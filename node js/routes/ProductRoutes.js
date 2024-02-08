const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdminRole } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// Route to add a new product (Only Admin)
router.post('/product/add', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { name, price, image, categoryIds } = req.body;
        const result = await productController.createProduct(name, price, image, categoryIds);
        res.json(result);
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to remove a product (Only Admin)
router.delete('/product/remove/:productId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await productController.deleteProduct(productId);
        res.json(result);
    } catch (error) {
        console.error('Error removing product:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to modify a product (Only Admin)
router.put('/product/modify/:productId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, price, image, categoryIds } = req.body;
        const result = await productController.modifyProduct(productId, name, price, image, categoryIds);
        res.json(result);
    } catch (error) {
        console.error('Error modifying product:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to find products by name (No authentication required)
router.get('/product/find-by-name/:partialProductName', async (req, res) => {
    try {
        const { partialProductName } = req.params;
        const result = await productController.findProductsByName(partialProductName);
        res.json(result);
    } catch (error) {
        console.error('Error finding products by name:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to find all products (No authentication required)
router.get('/product/find-all', async (req, res) => {
    try {
        const result = await productController.findAllProducts();
        res.json(result);
    } catch (error) {
        console.error('Error finding all products:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
