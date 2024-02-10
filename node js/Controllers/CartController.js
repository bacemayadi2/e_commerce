const config = require('../Configs/config');
const { useTestDatabase } = config;

// Use the executeQuery function from the imported module
const dbModule = useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const executeQuery = dbModule.executeQuery;
const ProductController = require('./ProductController');

// Function to get the user's cart (latest created, not associated with any purchase)
async function getCartDetail(CartID,userId) {
    try {
        // Get the latest cart for the user
        const latestCartQuery = `
            SELECT c.id    AS cartId,
                   c.payed as payed,
                   cl.quantity,
                   p.id    AS productId,
                   p.name  AS productName,
                   p.price,
                   p.image,
                   p.description
            FROM cart c
                     LEFT JOIN cart_line cl ON c.id = cl.cart_id
                     LEFT JOIN product p ON cl.product_id = p.id
            WHERE c.id = ?
        `;
        const cartResult = await executeQuery(latestCartQuery, [CartID]);

        if (cartResult[0].quantity != null) {
            // Calculate total price
            const Price = await calculateTotalPriceWithDiscount(cartResult[0].cartId);

            // If the cart is not associated with a purchase, return its details and total price
            return {
                success: true,
                cartDetails: cartResult,
                discountedPrice: Price.discountedPrice,
                priceWithoutDiscount: Price.priceWithoutDiscount
            };
        }
        createNewCartForUser(userId);
        getCartDetail(userId); // fill

    } catch (error) {
        console.error('Error getting user cart:', error.message);
        throw error;
    }
}

// Function to get the user's cart (latest created, not associated with any purchase)
async function getUserCartID(userId) {
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

// Function to increase product quantity in the cart by one or add it if not present
async function increaseProductQuantityInCart(productId, cartId) {
    try {
        // Check if the product is already associated with the cart
        const existingCartLineQuery = `
            SELECT id, quantity FROM cart_line
            WHERE product_id = ? AND cart_id = ?;
        `;

        const [existingCartLine] = await executeQuery(existingCartLineQuery, [productId, cartId]);

        if (existingCartLine) {
            affectProductToCart(productId,cartId,existingCartLine.quantity + 1)
            // If the product is already associated with the cart, increase the quantity by one
        } else {
            // If the product is not associated with the cart, add it with quantity 1
            await affectProductToCart(productId, cartId, 1);
        }

        return { success: true };
    } catch (error) {
        console.error('Error increasing product quantity in cart:', error.message);
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

// Function to view all paid carts with product details
async function viewAllCartsPayedWithDetails() {
    try {
        // Fetch all paid carts

        const paidCartsQuery = 'SELECT cart.*, user.username FROM cart JOIN user ON cart.user_id = user.id WHERE cart.payed IS NOT NULL;';

      //  const paidCartsQuery = 'SELECT * FROM cart WHERE payed IS NOT NULL;';
        const paidCarts = await executeQuery(paidCartsQuery);

        // Fetch details for each paid cart
        const cartsWithDetails = await Promise.all(
            paidCarts.map(async (cart) => {
                // Fetch cart lines for the current

                const cartLinesQuery = 'SELECT * FROM cart_line WHERE cart_id = ?;';
                const cartLines = await executeQuery(cartLinesQuery, [cart.id]);

                // Calculate total price with discount for the current cart
                const { discountedPrice, priceWithoutDiscount } = await calculateTotalPriceWithDiscount(cart.id);

                // Fetch product details for each cart line
                const productsWithDetails = await Promise.all(
                    cartLines.map(async (cartLine) => {
                        const productDetails = await ProductController.findProductById(cartLine.product_id);
                        return {
                            product: productDetails,
                            quantity: cartLine.quantity,
                        };
                    })
                );

                return {
                    cart: cart,
                    products: productsWithDetails,
                    discountedPrice: discountedPrice,
                    priceWithoutDiscount: priceWithoutDiscount,
                };
            })
        );

        return { success: true, carts: cartsWithDetails };
    } catch (error) {
        console.error('Error viewing all paid carts with details:', error.message);
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
        const updateQuery = 'UPDATE cart SET payed = NOW() WHERE id = ?;';
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
async function getTotalProductsInCart(cartId) {
    try {
        const totalProducts = `
            SELECT cl.cart_id, SUM(cl.quantity) AS totalQuantity
            FROM cart_line cl
                     JOIN cart c ON cl.cart_id = c.id
            WHERE c.payed IS NULL AND cl.cart_id = ?
            GROUP BY cl.cart_id;
`;


        // Execute the query and retrieve the total number of distinct products
        const [result] = await executeQuery(totalProducts, [cartId]);

        // Extract the total number of distinct products from the query result
        const totalDistinctProducts = result.totalQuantity || 0;
        console.log(totalDistinctProducts);
        return totalDistinctProducts;
    } catch (error) {
        console.error('Error calculating total number of distinct products in the cart:', error.message);
        throw error;
    }
}
// Function to calculate total price with discount
async function calculateTotalPriceWithDiscount(cartId) {
    try {
        // Get the total price for the given cart
        const totalQuery = `
            SELECT SUM(cl.quantity * p.price) AS total
            FROM cart_line cl
            JOIN product p ON cl.product_id = p.id
            WHERE cl.cart_id = ?;
        `;

        const [{ total }] = await executeQuery(totalQuery, [cartId]);
        // Apply a 25% discount if the total price is higher than 100
        const discountedPrice = total > 100 ? (total * 0.75).toFixed(3) : total.toFixed(3);

        return {discountedPrice: discountedPrice,  priceWithoutDiscount : total };
    } catch (error) {
        console.error('Error calculating total price with discount:', error.message);
        throw error;
    }
}

module.exports = {
    affectProductToCart,
    removeProductFromCart,
    viewAllCartsPayedWithDetails,
    deleteCart,
    updatePaymentDate,
    isUserCart,
    getUserCartID,
    getCartDetail,
    increaseProductQuantityInCart,
    getTotalProductsInCart
};
