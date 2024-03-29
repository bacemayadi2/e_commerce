import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsBoxArrowRight } from "react-icons/bs";

const NavBar = ({ trigger }) => {
  const [totalDistinctProducts, setTotalDistinctProducts] = useState(0);
  const username = localStorage.getItem('username');
  const [isAdmin, setIsAdmin] = useState(false); // New state to track admin status

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("http://172.10.0.1:3002/api/check-admin", {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      const result = await response.json();

      if (result.success) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin status:', error.message);
    }
  };
  useEffect(() => {
    checkAdminStatus();

    if (trigger) {
      fetchTotalProducts();
    }

  }, [trigger]);
  const handleLogout = () => {
    // Perform logout logic (clear local storage, redirect, etc.)
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const [expand, setExpand] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const fetchTotalProducts = async () => {
    try {
      const response = await fetch("http://172.10.0.1:3002/api/cart/total-products", {
        headers: {
          Authorization: `${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();

      if (result.totalProducts != undefined) {
        console.log(result.totalProducts);
        setTotalDistinctProducts(result.totalProducts);
      }
    } catch (error) {
      console.error('Error fetching total distinct products:', error.message);
    }
  };
  // Fetch totalDistinctProducts from the API
  useEffect(() => {


    fetchTotalProducts();
  }, []);

  // fixed Header
  function scrollHandler() {
    if (window.scrollY >= 100) {
      setIsFixed(true);
    } else if (window.scrollY <= 50) {
      setIsFixed(false);
    }
  }

  window.addEventListener("scroll", scrollHandler);

  return (
      <Navbar
          fixed="top"
          expand="md"
          className={isFixed ? "navbar fixed" : "navbar"}
      >
        <Container className="navbar-container">
          <Navbar.Brand to="/">
            <ion-icon name="bag"></ion-icon>
            <h1 className="logo">shop</h1>
          </Navbar.Brand>
          {/* Media cart and toggle */}
          <div className="d-flex">
            <div className="media-cart">
              <div className="d-flex">
                {username ? (
                    <div className="user-info">
                      <span>Bonjour, {isAdmin ? <span className="blue-text">Admin</span> : ''} {username}</span>
                      <button onClick={handleLogout} className="logout-button">
                        <BsBoxArrowRight className="logout-icon red-icon" />
                      </button>
                    </div>
                ) : (
                    <Link
                        aria-label="Go to login Page"
                        to="/login"
                        className="login"
                    >
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="black"
                          className="nav-icon"
                      >
                        <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                )}
              </div>

              <Link
                  aria-label="Go to Cart Page"
                  to="/cart"
                  className="cart"
                  data-num={totalDistinctProducts}

              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="black"
                    className="nav-icon"
                >
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </Link>
            </div>
            <Navbar.Toggle
                aria-controls="basic-navbar-nav"
                onClick={() => {
                  setExpand(expand ? false : "expanded");
                }}
            >
              <span></span>
              <span></span>
              <span></span>
            </Navbar.Toggle>
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {isAdmin && (
                  <>
                    <Nav.Item>
                      <Link
                          aria-label="Gestion utlisateur"
                          className="navbar-link"
                          to="/users"
                          onClick={() => setExpand(false)}
                      >
                        <span className="nav-link-label "style={{ color: 'blue' }}>Gestion utlisateur</span>
                      </Link>
                    </Nav.Item>

                    <Nav.Item>
                      <Link
                          aria-label="gestion achat"
                          className="navbar-link"
                          to="/purchases"
                          onClick={() => setExpand(false)}
                      >
                        <span className="nav-link-label" style={{ color: 'blue' }}>gestion achat</span>
                      </Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Link
                          aria-label="gestion products"
                          className="navbar-link"
                          to="/products"
                          onClick={() => setExpand(false)}
                      >
                        <span className="nav-link-label" style={{ color: 'blue' }}>gestion produit</span>
                      </Link>
                    </Nav.Item>
                  </>
              )}
              <Nav.Item>
                <Link
                    aria-label="Go to Shop Page"
                    className="navbar-link"
                    to="/"
                    onClick={() => setExpand(false)}
                >
                  <span className="nav-link-label">Shop</span>
                </Link>
              </Nav.Item>
              <Nav.Item className="expanded-cart">
                {username ? (
                    <div className="user-info">
                      <span>Bonjour, {isAdmin ? <span className="blue-text">Admin</span> : ''} {username}</span>
                      <button onClick={handleLogout} className="logout-button">
                        <BsBoxArrowRight className="logout-icon red-icon" />
                      </button>
                    </div>
                ) : (
                    <Link
                        aria-label="Go to login Page"
                        to="/login"
                        className="login"

                    >
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="black"
                          className="nav-icon"
                      >
                        <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                )}

                <Link
                    aria-label="Go to Cart Page"
                    to="/cart"
                    className="cart"
                    data-num={totalDistinctProducts}
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="black"
                      className="nav-icon"
                  >
                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                  </svg>
                </Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};

export default NavBar;
