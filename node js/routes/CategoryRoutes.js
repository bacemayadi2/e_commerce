// categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const { verifyToken, verifyAdminRole } = require('../Middlewares/authMiddleware');

// Create a new category (requires authentication and admin role)
router.post('/category', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { name } = req.body;
        const result = await categoryController.createCategory(name);
        res.json(result);
    } catch (error) {
        console.error('Error creating category:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Modify the information of a category (requires authentication and admin role)
router.put('/category/:categoryId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;
        const result = await categoryController.modifyCategory(categoryId, name);
        res.json(result);
    } catch (error) {
        console.error('Error modifying category:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a category (requires authentication and admin role)
router.delete('/category/:categoryId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await categoryController.deleteCategory(categoryId);
        res.json(result);
    } catch (error) {
        console.error('Error deleting category:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all categories (requires authentication and admin role)
router.get('/categories', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const categories = await categoryController.getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error('Error getting all categories:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a category by ID (requires authentication and admin role)
router.get('/category/:categoryId', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await categoryController.getCategoryById(categoryId);
        res.json(result);
    } catch (error) {
        console.error('Error getting category by ID:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
