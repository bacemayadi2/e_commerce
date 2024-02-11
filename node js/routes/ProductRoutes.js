const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdminRole } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// Route to add a new product (Only Admin)
router.post('/product/add', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { name, price, image,description, categoryIds } = req.body;
        const result = await productController.createProduct(name, price, image, description,categoryIds);
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
        const { name, price, image,description, categoryIds } = req.body;
        const result = await productController.modifyProduct(productId, name, price, image,description, categoryIds);
        res.json(result);
    } catch (error) {
        console.error('Error modifying product:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to find products by name with pagination (No authentication required)
router.get('/product/find-by-name/:partialProductName/:productPerPage/:pageNumber', async (req, res) => {
    try {
        const { partialProductName, productPerPage = 10, pageNumber = 1 } = req.params;

        const result = await productController.findProductsByNameWithPagination(partialProductName, parseInt(productPerPage), parseInt(pageNumber));
        res.json(result);
    } catch (error) {
        console.error('Error finding products by name with pagination:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to find products with pagination (No authentication required)
    router.get('/product/find-all/:productPerPage/:pageNumber', async (req, res) => {
    try {
        const { productPerPage = 10, pageNumber = 1 } = req.params; // Default productPerPage to 10 products per page and pageNumber 1
        console.log(productPerPage);
        console.log(pageNumber);

        const result = await productController.getProductsPaginated(parseInt(productPerPage), parseInt(pageNumber));
        console.log(result);

        res.json(result);



    } catch (error) {
        console.error('Error finding products with pagination:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to get a product by ID
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Call the findProductById function to get the product by ID
        const product = await productController.findProductById(productId);

        if (product) {
            // If the product is found, send it in the response
            res.status(200).json({ success: true, product });
        } else {
            // If the product is not found, return a 404 status
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error getting product by ID:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to find products by category with pagination (No authentication required)
router.get('/product/find-by-category/:categoryName/:productPerPage/:pageNumber', async (req, res) => {
    try {
        const { categoryName, productPerPage = 10, pageNumber = 1 } = req.params; // Default productPerPage to 10 products per page and pageNumber 1
        const result = await productController.findProductsByCategory(categoryName, parseInt(productPerPage), parseInt(pageNumber));
        res.json(result);
    } catch (error) {
        console.error('Error finding products by category with pagination:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to find products by name with pagination and category filtering (No authentication required)
router.get('/product/find-by-name/:partialProductName/:categoryName/:productPerPage/:pageNumber', async (req, res) => {
    try {
        const { partialProductName, categoryName, productPerPage = 10, pageNumber = 1 } = req.params;

        const result = await productController.findProductsByNameWithPaginationAndCategory(
            partialProductName,
            parseInt(productPerPage),
            parseInt(pageNumber),
            categoryName
        );

        res.json(result);
    } catch (error) {
        console.error('Error finding products by name with pagination and category:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
