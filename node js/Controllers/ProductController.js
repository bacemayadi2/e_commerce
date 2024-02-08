const config = require('../Configs/config');
const { useTestDatabase } = config;

// Use the executeQuery function from the imported module
const dbModule = useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const executeQuery = dbModule.executeQuery;



// Function to delete a product
async function deleteProduct(productId) {
    try {
        // Delete entries from the product_category table associated with the product
        const deleteAssociationsQuery = 'DELETE FROM product_category WHERE product_id = ?;';
        await executeQuery(deleteAssociationsQuery, [productId]);

        // Now, delete the product
        const deleteProductQuery = 'DELETE FROM product WHERE id = ?;';
        await executeQuery(deleteProductQuery, [productId]);

        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error.message);
        throw error;
    }
}

// Function to get all products
async function getAllProducts() {
    // Retrieve all products from the database
    const selectQuery = 'SELECT * FROM product;';
    const products = await executeQuery(selectQuery);

    return products;
}

// Function to create a new product
async function createProduct(name, price, image, categoryIds) {
    try {
        // Validate input
        if (!name || !price || !image) {
            return { success: false, message: 'Name, price, and image are required.' };
        }

        // Insert the new product into the database
        const insertQuery = 'INSERT INTO product (name, price, image) VALUES (?, ?, ?);';
        const result = await executeQuery(insertQuery, [name, price, image]);

        // Retrieve the inserted product from the database
        const selectQuery = 'SELECT * FROM product WHERE id = ?;';
        const [newProduct] = await executeQuery(selectQuery, [result.insertId]);

        // Associate the product with categories
        await associateProductWithCategories(result.insertId, categoryIds);

        return { success: true, product: newProduct };
    } catch (error) {
        console.error('Error creating product:', error.message);
        throw error;
    }
}

// Function to modify the information of a product
async function modifyProduct(productId, newData) {
    try {
        const { name, price, image, categoryIds } = newData;

        // Update the product information in the database
        const updateQuery = 'UPDATE product SET name = ?, price = ?, image = ? WHERE id = ?;';
        await executeQuery(updateQuery, [name, price, image, productId]);

        // Associate the product with categories
        await associateProductWithCategories(productId, categoryIds);

        // Retrieve the updated product from the database
        const selectQuery = 'SELECT * FROM product WHERE id = ?;';
        const [updatedProduct] = await executeQuery(selectQuery, [productId]);

        return { success: true, product: updatedProduct };
    } catch (error) {
        console.error('Error modifying product:', error.message);
        throw error;
    }
}

// Function to associate a product with categories
async function associateProductWithCategories(productId, categoryIds) {
    try {
        // Remove existing associations
        const deleteQuery = 'DELETE FROM product_category WHERE product_id = ?;';
        await executeQuery(deleteQuery, [productId]);

        // Create new associations
        const insertQuery = 'INSERT INTO product_category (product_id, category_id) VALUES (?, ?);';
        for (const categoryId of categoryIds) {
            await executeQuery(insertQuery, [productId, categoryId]);
        }
    } catch (error) {
        console.error('Error associating product with categories:', error.message);
        throw error;
    }
}

// Function to disassociate a product from categories
async function disassociateProductFromCategories(productId) {
    try {
        const deleteQuery = 'DELETE FROM product_category WHERE product_id = ?;';
        await executeQuery(deleteQuery, [productId]);
    } catch (error) {
        console.error('Error disassociating product from categories:', error.message);
        throw error;
    }
}


// Function to find products by product name
async function findProductsByName(partialProductName) {
    try {
        // Search for products with names containing the provided partialProductName
        const selectQuery = 'SELECT * FROM product WHERE name LIKE ?;';
        const partialNamePattern = `%${partialProductName}%`;
        const products = await executeQuery(selectQuery, [partialNamePattern]);

        return { success: true, products };
    } catch (error) {
        console.error('Error finding products by name:', error.message);
        throw error;
    }
}




module.exports = {
    createProduct,
    modifyProduct,
    deleteProduct,
    getAllProducts,
    associateProductWithCategories,
    disassociateProductFromCategories,
    findProductsByName
};
