import React, { useState, useEffect } from "react";
import { Container, Form, Button, Modal } from "react-bootstrap";
import { useParams } from "react-router-dom";

// CategorySelector component
const CategorySelector = ({ categories, selectedCategories, onChange }) => {
    return (
        <Form.Select
            multiple
            value={selectedCategories}
            onChange={(e) => onChange(Array.from(e.target.selectedOptions, (option) => option.value))}
        >
            {categories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </Form.Select>
    );
};

const AddProduct = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const token = localStorage.getItem('token');

    const { id } = useParams();

    useEffect(() => {
        // Check if in edit mode
        if (id) {
            setEditMode(true);
            // Fetch product details for editing
            fetchProductById(id);
        }
        // Fetch categories
        fetchCategories();
    }, [id]);

    const fetchProductById = async (productId) => {
        try {
            const response = await fetch(`http://172.10.0.1:3002/api/product/${productId}`);
            const productData = await response.json();

            if (productData.success) {
                const { name, image, price, description, categories } = productData.product;
                setName(name);
                setPrice(price);
                setDescription(description);
                setSelectedCategories(categories);
            } else {
                console.error('Error fetching product details:', productData.message);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

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

    const handleImageChange = (event) => {
        // Convert selected image to blob
        const selectedImage = event.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setImage(reader.result);
        };

        if (selectedImage) {
            reader.readAsDataURL(selectedImage);
        }
    };

    const handleCategoryChange = (selectedCategories) => {
        setSelectedCategories(selectedCategories);
    };

    const handleShowDeleteCategoryModal = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowDeleteCategoryModal(true);
    };

    const handleHideDeleteCategoryModal = () => {
        setCategoryToDelete(null);
        setShowDeleteCategoryModal(false);
    };

    const handleDeleteCategory = async () => {
        try {
            const response = await fetch(`http://172.10.0.1:3002/api/category/${categoryToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `${token}`,
                },
            });

            const responseData = await response.json();

            if (responseData.success) {
                console.log('Category deleted successfully!');
                // Fetch updated categories after deletion
                fetchCategories();
                // Close the delete category modal
                handleHideDeleteCategoryModal();
            } else {
                console.error('Error deleting category:', responseData.message);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleShowAddCategoryModal = () => {
        setShowAddCategoryModal(true);
    };

    const handleHideAddCategoryModal = () => {
        setShowAddCategoryModal(false);
        setNewCategoryName("");
    };

    const handleAddCategory = async () => {
        try {
            const response = await fetch("http://172.10.0.1:3002/api/category", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    name: newCategoryName,
                }),
            });

            const responseData = await response.json();

            if (responseData.success) {
                console.log('Category added successfully!');
                // Fetch updated categories after addition
                fetchCategories();
                // Close the add category modal
                handleHideAddCategoryModal();
            } else {
                console.error('Error adding category:', responseData.message);
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const apiUrl = editMode ? `http://172.10.0.1:3002/api/product/modify/${id}` : 'http://172.10.0.1:3002/api/product/add';

        try {
            const response = await fetch(apiUrl, {
                method: editMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    name,
                    price,
                    image,
                    description,
                    categoryIds: selectedCategories,
                }),
            });
            const responseData = await response.json();
            if (responseData.success) {
                console.log('Product added/modified successfully!');
                // Redirect to product list or details page
                window.location.href = '/products';
            } else {
                console.error('Error adding/modifying product:', responseData.message);
            }
        } catch (error) {
            console.error('Error adding/modifying product:', error);
        }
    };

    return (
        <Container>
            <h2>{editMode ? 'Edit Product' : 'Add New Product'}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="productName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="productPrice">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter product price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="productDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter product description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="productImage">
                    <Form.Label>Image</Form.Label>
                    <Form.Control type="file" onChange={handleImageChange} />
                </Form.Group>
                <Form.Group controlId="productCategories">
                    <Form.Label>Categories</Form.Label>
                    <CategorySelector
                        categories={categories}
                        selectedCategories={selectedCategories}
                        onChange={handleCategoryChange}
                    />
                    <Button variant="outline-danger" onClick={() => handleShowDeleteCategoryModal(selectedCategories)}>
                        supprimer la Category defintivement
                    </Button>
                    <Button variant="outline-success" onClick={handleShowAddCategoryModal}>
                        ajouter une Category
                    </Button>
                </Form.Group>
                <Button variant="primary" type="submit">
                    {editMode ? 'Save Changes' : 'Add Product'}
                </Button>
            </Form>

            {/* Modal for confirming category deletion */}
            <Modal show={showDeleteCategoryModal} onHide={handleHideDeleteCategoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    si vous supprimer la Categories tout les produit reliez ne vont plus l'avoir
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHideDeleteCategoryModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteCategory}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for adding a new category */}
            <Modal show={showAddCategoryModal} onHide={handleHideAddCategoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="newCategoryName">
                        <Form.Label>New Category Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter new category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleHideAddCategoryModal}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleAddCategory}>
                        Add Category
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AddProduct;
