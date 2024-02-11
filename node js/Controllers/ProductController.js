const config = require('../Configs/config');
const { useTestDatabase } = config;

// Use the executeQuery function from the imported module
const dbModule = useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const executeQuery = dbModule.executeQuery;



async function deleteProduct(productId) {
    try {
        // Delete entries from the cart_line table associated with the product
        const deleteCartLineQuery = 'DELETE FROM cart_line WHERE product_id = ?;';
        await executeQuery(deleteCartLineQuery, [productId]);

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

// Function to get products with pagination
async function getProductsPaginated(limit, page) {
    try {
        // Calculate the offset based on the page number and limit
        const offset = (page - 1) * limit;
        console.log("hhh")
        console.log(limit);
        console.log(offset);
        const selectQuery = `SELECT * FROM product LIMIT ${limit} OFFSET ${offset};`;
        const products = await executeQuery(selectQuery);
        console.log(products);


        return products;
    } catch (error) {
        console.error('Error retrieving paginated products:', error.message);
        throw error;
    }
}


// Function to create a new product
async function createProduct(name, price, image,description, categoryIds) {
    try {
        // Validate input
        if (!name || !price || !image || !description) {
            return { success: false, message: 'Name, price, and image and description are required.' };
        }

        // Insert the new product into the database
        const insertQuery = 'INSERT INTO product (name, price, image,description) VALUES (?, ?, ?,?);';
        const result = await executeQuery(insertQuery, [name, price, image,description]);

        // Retrieve the inserted product from the database
        const selectQuery = 'SELECT * FROM product WHERE id = ?;';
        const [newProduct] = await executeQuery(selectQuery, [result.insertId]);

        // Associate the product with categories
        await associateProductWithCategories(result.insertId, categoryIds);

        return { success: true, newProduct };
    } catch (error) {
        console.error('Error creating product:', error.message);
        throw error;
    }
}

// Function to modify the information of a product
async function modifyProduct(productId, name, price, image,description, categoryIds) {
    try {

        // Update the product information in the database
        const updateQuery = 'UPDATE product SET name = ?, price = ?, image = ? ,description = ? WHERE id = ?';
        console.log(name);

        await executeQuery(updateQuery, [name, price, image,description, productId]);
        // Associate the product with categories
        await associateProductWithCategories(productId, categoryIds);
        // Retrieve the updated product from the database
        const selectQuery = 'SELECT * FROM product WHERE id = ?;';
        const [updatedProduct] = await executeQuery(selectQuery, [productId]);

        return  { success: true,updatedProduct} ;
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


// Function to find products by product name with pagination
async function findProductsByNameWithPagination(partialProductName, productPerPage, pageNumber) {
    try {
        const offset = (pageNumber - 1) * productPerPage;

        // Search for products with names containing the provided partialProductName and include pagination
        const selectQuery = 'SELECT * FROM product WHERE name LIKE ? LIMIT ? OFFSET ?;';
        const partialNamePattern = `%${partialProductName}%`;
        const products = await executeQuery(selectQuery, [partialNamePattern, productPerPage, offset]);

        return products ;
    } catch (error) {
        console.error('Error finding products by name with pagination:', error.message);
        throw error;
    }
}

// Function to find products by category with pagination
async function findProductsByCategory(categoryName, productPerPage, pageNumber) {
    try {
        const offset = (pageNumber - 1) * productPerPage;

        // Search for products with the given category name with pagination
        const selectQuery = `
            SELECT p.*
            FROM product p
            JOIN product_category pc ON p.id = pc.product_id
            JOIN category c ON pc.category_id = c.id
            WHERE c.name = ?
            LIMIT ?
            OFFSET ?;
        `;

        const products = await executeQuery(selectQuery, [categoryName, productPerPage, offset]);

        return  products ;
    } catch (error) {
        console.error('Error finding products by category with pagination:', error.message);
        throw error;
    }
}
// Function to find a product by ID with associated categoryIds
async function findProductById(productId) {
    try {
        // Search for the product with the given ID and its associated categories
        const selectQuery = `
            SELECT product.*, GROUP_CONCAT(product_category.category_id) AS categories
            FROM product
            LEFT JOIN product_category ON product.id = product_category.product_id
            WHERE product.id = ?
            GROUP BY product.id;
        `;

        const [product] = await executeQuery(selectQuery, [productId]);
        console.log(await executeQuery(selectQuery, [productId]));

        return product;
    } catch (error) {
        console.error('Error finding product by ID:', error.message);
        throw error;
    }
}

// Function to find products by product name with pagination and category filtering
async function findProductsByNameWithPaginationAndCategory(partialProductName, productPerPage, pageNumber, categoryName) {
    try {
        const offset = (pageNumber - 1) * productPerPage;

        // Search for products with names containing the provided partialProductName, include pagination, and filter by category
        const selectQuery = `
            SELECT p.*
            FROM product p
            JOIN product_category pc ON p.id = pc.product_id
            JOIN category c ON pc.category_id = c.id
            WHERE p.name LIKE ? AND c.name = ?
            LIMIT ? OFFSET ?;
        `;

        const partialNamePattern = `%${partialProductName}%`;
        const products = await executeQuery(selectQuery, [partialNamePattern, categoryName, productPerPage, offset]);

        return  products ;
    } catch (error) {
        console.error('Error finding products by name with pagination and category:', error.message);
        throw error;
    }
}







module.exports = {
    createProduct,
    modifyProduct,
    deleteProduct,
    getProductsPaginated,
    associateProductWithCategories,
    disassociateProductFromCategories,
    findProductsByNameWithPagination,
    findProductsByCategory,
    findProductsByNameWithPaginationAndCategory,
    findProductById
};
