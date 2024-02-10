import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Table, Pagination, Button } from "react-bootstrap";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchProductName, setSearchProductName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const token = localStorage.getItem('token');

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://172.10.0.1:3002/api/categories");
            const categoriesData = await response.json();

            // Ensure categoriesData is an array before setting state
            if (Array.isArray(categoriesData)) {
                setCategories(categoriesData);
            } else {
                console.error('Invalid categories data:', categoriesData);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    useEffect(() => {
        // Fetch products based on current page, items per page, search, and category
        fetchProducts();
        fetchCategories();

    }, [searchProductName, selectedCategory, itemsPerPage, currentPage]);

    const fetchProducts = async () => {
        try {
            let apiUrl = `http://172.10.0.1:3002/api/product/find-all/${itemsPerPage}/${currentPage}`;


            if (selectedCategory) {
                apiUrl = `http://172.10.0.1:3002/api/product/find-by-category/${selectedCategory}/${itemsPerPage}/${currentPage}`;
            }

            if (searchProductName) {
                apiUrl = `http://172.10.0.1:3002/api/product/find-by-name/${searchProductName}/${itemsPerPage}/${currentPage}`;
                if (selectedCategory) {
                    apiUrl = `http://172.10.0.1:3002/api/product/find-by-name/${searchProductName}/${selectedCategory}/${itemsPerPage}/${currentPage}`;
                }
            }

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });

            const productData = await response.json();
            if (productData.length >0) {
                setProducts(productData);
                setTotalProducts(productData.total);
            } else {
                console.error('Error fetching products:', productData.message);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSearchProductNameChange = (event) => {
        setSearchProductName(event.target.value);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (itemsPerPageValue) => {
        setItemsPerPage(itemsPerPageValue);
        setCurrentPage(1);
    };

    const handleRemoveProduct = async (productId) => {
        try {
            console.log(productId);
            await fetch(`http://172.10.0.1:3002/api/product/remove/${productId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `${token}`,
                },
            });

            fetchProducts(); // Refresh products after deletion
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    const handleModifyProduct = (productId) => {
        // Redirect to modify product page, assuming /addproduct supports modification

        window.location.href = `/addproduct/${productId}`;
    };

    const handleAddProduct = () => {
        // Redirect to add product page
        window.location.href = '/addproduct';
    };

    return (
        <Container>
            <Row className=" mt-3">
                <Col md={4}>
                    <Button
                        variant="success"
                        onClick={handleAddProduct}
                    >
                        Add New Product
                    </Button>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={3}>
                    <Form.Label>Products Per Page:</Form.Label>
                    <Form.Select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    >
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                        <option value={100}>100</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Name
                                <Form.Control
                                    type="text"
                                    value={searchProductName}
                                    onChange={handleSearchProductNameChange}
                                />
                            </th>
                            <th>Category
                                <Form.Select
                                value={selectedCategory || ''}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {Array.isArray(categories) &&
                                categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                            </th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product, index) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.price}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleRemoveProduct(product.id)}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleModifyProduct(product.id)}
                                    >
                                        Modify
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row className="justify-content-center mt-3">
                <Col md={4}>
                    <Pagination>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Pagination.Item
                                key={index}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
            </Row>

        </Container>
    );
};

export default ProductManagement;
