const config = require('../Configs/config');
const { useTestDatabase } = config;

// Use the executeQuery function from the imported module
const dbModule = useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const executeQuery = dbModule.executeQuery;

// Function to create a new category
async function createCategory(name) {
    try {
        // Validate input
        if (!name) {
            return { success: false, message: 'Name is required.' };
        }

        // Insert the new category into the database
        const insertQuery = 'INSERT INTO category (name) VALUES (?);';
        const result = await executeQuery(insertQuery, [name]);

        // Retrieve the inserted category from the database
        const selectQuery = 'SELECT * FROM category WHERE id = ?;';
        const [newCategory] = await executeQuery(selectQuery, [result.insertId]);

        return { success: true, category: newCategory };
    } catch (error) {
        console.error('Error creating category:', error.message);
        throw error;
    }
}

// Function to modify the information of a category
async function modifyCategory(categoryId, newName) {
    try {
        // Update the category name in the database
        const updateQuery = 'UPDATE category SET name = ? WHERE id = ?;';
        await executeQuery(updateQuery, [newName, categoryId]);

        // Retrieve the updated category from the database
        const selectQuery = 'SELECT * FROM category WHERE id = ?;';
        const [updatedCategory] = await executeQuery(selectQuery, [categoryId]);

        return { success: true, category: updatedCategory };
    } catch (error) {
        console.error('Error modifying category:', error.message);
        throw error;
    }
}

// Function to delete a category
async function deleteCategory(categoryId) {
    try {
        // Delete the category from the database
        const deleteQuery = 'DELETE FROM category WHERE id = ?;';
        await executeQuery(deleteQuery, [categoryId]);

        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error.message);
        throw error;
    }
}

// Function to get all categories
async function getAllCategories() {
    // Retrieve all categories from the database
    const selectQuery = 'SELECT * FROM category;';
    const categories = await executeQuery(selectQuery);

    return categories;
}

// Function to get a category by ID
async function getCategoryById(categoryId) {
    // Retrieve the category from the database by ID
    const selectQuery = 'SELECT * FROM category WHERE id = ?;';
    const [category] = await executeQuery(selectQuery, [categoryId]);

    if (!category) {
        return { success: false, message: 'Category not found.' };
    }

    return { success: true, category };
}

module.exports = {
    createCategory,
    modifyCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
};
