import { Col, Container, Row, Form, Pagination } from "react-bootstrap";
import { Fragment, useState, useEffect } from "react";
import ShopList from "../components/ShopList";
import Banner from "../components/Banner/Banner";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";

const Shop = ({ triggerTotalDistinctProducts }) => {
  const [filterList, setFilterList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [perPage, setPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  useWindowScrollToTop();

  useEffect(() => {
    // Fetch categories from API
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch products based on selected category, search query, perPage, and currentPage
    fetchProducts();
  }, [selectedCategory, searchQuery, perPage, currentPage]);

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

  const fetchProducts = async () => {
    try {
      let apiUrl = "http://172.10.0.1:3002/api/product/find-all";

      if (selectedCategory) {
        apiUrl = `http://172.10.0.1:3002/api/product/find-by-category/${selectedCategory}`;
      }

      if (searchQuery) {
        apiUrl = `http://172.10.0.1:3002/api/product/find-by-name/${searchQuery}`;

        if (selectedCategory) {
          apiUrl = `http://172.10.0.1:3002/api/product/find-by-name/${searchQuery}/${selectedCategory}`;
        }
      }

      apiUrl += `/${perPage}/${currentPage}`;

      const response = await fetch(apiUrl);
      const productsData = await response.json();

      // Ensure productsData is an array before setting state
      if (Array.isArray(productsData)) {
        setFilterList(productsData);
      } else {
        console.error('Invalid products data:', productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (searchValue) => {
    setSearchQuery(searchValue);
    setCurrentPage(1);
  };

  const handlePerPageChange = (perPageValue) => {
    setPerPage(perPageValue);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (

      <Fragment>
        <Banner title="product" />
        <section className="filter-bar">
          <Container className="filter-bar-container">
            <Row className="justify-content-between">

              <Col md={4}>
                <Form.Group controlId="categorySelector">
                  <Form.Label>Category:</Form.Label>
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
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="searchBar">
                  <Form.Label>Search:</Form.Label>
                  <Form.Control
                      type="text"
                      placeholder="Search products"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="text-end">
                <Form.Group controlId="perPageSelector">
                  <Form.Label>Items Per Page:</Form.Label>
                  <Form.Select
                      value={perPage}
                      onChange={(e) => handlePerPageChange(e.target.value)}
                      style={{ fontSize: '1rem', padding: '0.2rem 0.5rem', width: '20%', marginLeft: 'auto' }}
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={45}>45</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                {/* Update ShopList props */}
                <ShopList
                    productItems={filterList}
                    currentPage={currentPage}
                    perPage={perPage}
                    onPageChange={handlePageChange}
                    triggerTotalDistinctProducts={triggerTotalDistinctProducts}
                />
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
        </section>
      </Fragment>
  );
};

export default Shop;
