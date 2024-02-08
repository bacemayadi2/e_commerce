const config = require('../Configs/config');
const { useTestDatabase } = config;

// Use the executeQuery function from the imported module
const dbModule = useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const executeQuery = dbModule.executeQuery;

// Function to get the user's cart (latest created, not associated with any purchase)
async function getUserCart(userId) {
    try {
        // Get the latest cart for the user
        const latestCartQuery = `
            SELECT id, payed
            FROM cart
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1;
        `;

        const [latestCart] = await executeQuery(latestCartQuery, [userId]);

        if (latestCart) {
            // If there is a latest cart, check if it's not associated with any purchase
            if (latestCart.payed === null) {
                // If the cart is not associated with a purchase, return it
                return { success: true, cartId: latestCart.id };
            }
        }

        // If there is no existing cart or the latest cart is associated with a purchase, create a new one
        return await createNewCartForUser(userId);
    } catch (error) {
        console.error('Error getting user cart:', error.message);
        throw error;
    }
}


// Function to create a new cart for the connected user
async function createNewCartForUser(userId) {
    try {
        const createCartQuery = 'INSERT INTO cart (user_id, created_at, edited_at) VALUES (?, NOW(), NOW());';
        const result = await executeQuery(createCartQuery, [userId]);

        return { success: true, cartId: result.insertId };
    } catch (error) {
        console.error('Error creating new cart for user:', error.message);
        throw error;
    }
}

// Function to affect a product to the cart with a specific quantity
async function affectProductToCart(productId, cartId, quantity) {
    try {
        // Check if the product is already associated with the cart
        const existingCartLineQuery = `
            SELECT id, quantity FROM cart_line
            WHERE product_id = ? AND cart_id = ?;
        `;

        const [existingCartLine] = await executeQuery(existingCartLineQuery, [productId, cartId]);

        if (existingCartLine) {

            // If the product is already associated with the cart, update the quantity
            const updateCartLineQuery = 'UPDATE cart_line SET quantity = ? WHERE id = ?;';
            await executeQuery(updateCartLineQuery, [quantity, existingCartLine.id]);
        } else {
            // If the product is not associated with the cart, create a new cart line
            const createCartLineQuery = 'INSERT INTO cart_line (product_id, cart_id, quantity) VALUES (?, ?, ?);';
            await executeQuery(createCartLineQuery, [productId, cartId, quantity]);
        }

        return { success: true };
    } catch (error) {
        console.error('Error affecting product to cart:', error.message);
        throw error;
    }
}

// Function to update the quantity of a product in the cart
async function updateProductQuantityInCart(productId, cartId, quantity) {
    try {
        // Update the quantity in the cart line (association) for the specified product and cart
        const updateCartLineQuery = 'UPDATE cart_line SET quantity = ? WHERE product_id = ? AND cart_id = ?;';
        await executeQuery(updateCartLineQuery, [quantity, productId, cartId]);

        return { success: true };
    } catch (error) {
        console.error('Error updating product quantity in cart:', error.message);
        throw error;
    }
}

// Function to remove a product from the cart
async function removeProductFromCart(productId, cartId) {
    try {
        // Delete the cart line (association) for the specified product and cart
        const deleteCartLineQuery = 'DELETE FROM cart_line WHERE product_id = ? AND cart_id = ?;';
        await executeQuery(deleteCartLineQuery, [productId, cartId]);

        return { success: true };
    } catch (error) {
        console.error('Error removing product from cart:', error.message);
        throw error;
    }
}

// Function to view all carts
async function viewAllCarts() {
    try {
        const allCartsQuery = 'SELECT * FROM cart;';
        const carts = await executeQuery(allCartsQuery);

        return { success: true, carts };
    } catch (error) {
        console.error('Error viewing all carts:', error.message);
        throw error;
    }
}

// Function to delete a cart
async function deleteCart(cartId) {
    try {
        // Delete the cart and its associations (cart_lines)
        const deleteCartQuery = 'DELETE FROM cart WHERE id = ?;';
        await executeQuery(deleteCartQuery, [cartId]);

        return { success: true };
    } catch (error) {
        console.error('Error deleting cart:', error.message);
        throw error;
    }
}
async function updatePaymentDate(cartId) {
    try {
        const updateQuery = 'UPDATE cart SET payment_date = NOW() WHERE id = ?;';
        await executeQuery(updateQuery, [cartId]);

        return { success: true, message: 'Payment date updated successfully.' };
    } catch (error) {
        console.error('Error updating payment date:', error.message);
        throw error;
    }
}
async function isUserCart(userId, cartId) {
    try {
        // Retrieve the cart from the database
        const cart = await getCartById(cartId);

        // Check if the cart exists and belongs to the specified user
        return cart && cart.userId === userId;
    } catch (error) {
        console.error('Error checking if the cart belongs to the user:', error.message);
        throw error;
    }
}


module.exports = {
    getUserCart,
    createNewCartForUser,
    affectProductToCart,
    updateProductQuantityInCart,
    removeProductFromCart,
    viewAllCarts,
    deleteCart,
    updatePaymentDate,
    isUserCart,
};
