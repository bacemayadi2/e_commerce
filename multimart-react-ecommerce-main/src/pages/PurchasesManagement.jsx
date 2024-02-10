import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchasesPage = () => {
    const [purchases, setPurchases] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://172.10.0.1:3002/api/cart/all',  {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setPurchases(response.data.carts);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [token]);

    const handleRowClick = (cartId) => {
        setExpandedRows((prevExpandedRows) => {
            if (prevExpandedRows.includes(cartId)) {
                return prevExpandedRows.filter((id) => id !== cartId);
            } else {
                return [...prevExpandedRows, cartId];
            }
        });
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://172.10.0.1:3002/api/cart/all',  {
                    headers: {
                        Authorization: `${token}`,
                    },
                });
                setPurchases(response.data.carts);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>achate : appuier sur une ligne d'achat pour voir les detail </h1>
            <table className="main-table">
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Discounted Price</th>
                    <th>Price Without Discount</th>
                </tr>
                </thead>
                <tbody>
                {purchases.map((purchase) => (
                    <React.Fragment key={purchase.cart.id}>
                        <tr onClick={() => handleRowClick(purchase.cart.id)} className="clickable-row">
                            <td>{purchase.cart.username}</td>
                            <td>{purchase.discountedPrice}</td>
                            <td>{purchase.priceWithoutDiscount.toFixed(3)}</td>
                        </tr>
                        {expandedRows.includes(purchase.cart.id) && (
                            <tr>
                                <td colSpan="3">
                                    <table className="nested-table">
                                        <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Quantity</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {purchase.products.map((product) => (
                                            <tr key={product.product.id}>
                                                <td>{product.product.name}</td>
                                                <td>{product.quantity}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};
export default PurchasesPage;
