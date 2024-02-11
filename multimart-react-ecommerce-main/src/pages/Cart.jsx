import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
} from "../app/features/cart/cartSlice";

const token = localStorage.getItem('token');

const Cart = ({triggerTotalDistinctProducts}) => {
  const dispatch = useDispatch();
  const [cartDetails, setCartDetails] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [priceWithoutDiscount, setPriceWithoutDiscount] = useState(0);
  const fetchCartDetails = async () => {
    try {
      const response = await fetch("http://172.10.0.1:3002/api/cart/user", {
        headers: {
          Authorization: `${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setCartDetails(result.cartDetails);
        setDiscountedPrice(result.discountedPrice);
        setPriceWithoutDiscount(result.priceWithoutDiscount);
        triggerTotalDistinctProducts();
      } else {
        // Handle error
        console.error("Error fetching cart details:", result.message);
      }
    } catch (error) {
      // Handle error
      console.error("Error fetching cart details:", error.message);
    }
  };
  useEffect(() => {


    fetchCartDetails();
  }, []);

  const handleincreaseQTY = async (product) => {
    try {
      const response = await fetch(`http://172.10.0.1:3002/api/cart/affect-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          productId: product.productId,
          quantity: product.quantity+1,
        }),
      });
      const result = await response.json();

      if (result.success) {
        dispatch(addToCart({ product, num: 1 }));
        fetchCartDetails();
      } else {
        console.error("Error adding product to cart:", result.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
    }
  };

  const handleDecreaseQty = async (product) => {
    try {
      if (product.quantity==1)  //product should be deleted instade of product quantity adjusted
        {
          handleDeleteProduct(product);
          return; // Stop executing the rest of the function

        }

      const response = await fetch(`http://172.10.0.1:3002/api/cart/affect-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          productId: product.productId,
          quantity: product.quantity-1,
        }),
      });
      const result = await response.json();

      if (result.success) {
        dispatch(decreaseQty(product));
        fetchCartDetails();
      } else {
        console.error("Error decreasing product quantity:", result.message);
      }
    } catch (error) {
      console.error("Error decreasing product quantity:", error.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      const response = await fetch(`http://172.10.0.1:3002/api/cart/remove-product/${product.productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        dispatch(deleteProduct(product));
        fetchCartDetails();
      } else {
        console.error("Error removing product from cart:", result.message);
      }
    } catch (error) {
      console.error("Error removing product from cart:", error.message);
    }
  };
  const handlePay = async () => {
    try {
      const response = await fetch("http://172.10.0.1:3002/api/cart/pay", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        // Optionally, you can handle any success actions
        console.log("Payment successful");
        window.location.href = '/';
      } else {
        console.error("Error processing payment:", result.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
    }
  };

  return (
      <section className="cart-items">
        <Container>
          <Row className="justify-content-center">
            <Col md={8}>
              { cartDetails[0]?.productId == null ?(

                  <h1 className="no-items product">No Items are added in Cart</h1>
              ) : (
                  <>
              {cartDetails.map((item) => {
                const producttotalprice = (item.price * item.quantity).toFixed(3);
                return (
                    <div className="cart-list" key={item.productId}>
                      <Row>
                        <Col className="image-holder" sm={4} md={3}>
                          <img src={item.image} alt="" />
                        </Col>
                        <Col sm={8} md={9}>
                          <Row className="cart-content justify-content-center">
                            <Col xs={12} sm={9} className="cart-details">
                              <h3>{item.productName}</h3>
                              <h4>
                                ${item.price} * {item.quantity}
                                <span>${producttotalprice}</span>
                              </h4>
                            </Col>
                            <Col xs={12} sm={3} className="cartControl">
                              <button
                                  className="incCart"
                                  onClick={() => handleincreaseQTY(item)}
                              >
                                <i className="fa-solid fa-plus"></i>
                              </button>
                              <button
                                  className="desCart"
                                  onClick={() => handleDecreaseQty(item)}
                              >
                                <i className="fa-solid fa-minus"></i>
                              </button>
                            </Col>
                          </Row>
                        </Col>
                        <button
                            className="delete"
                            onClick={() => handleDeleteProduct(item)}
                        >
                          <ion-icon name="close"></ion-icon>
                        </button>
                      </Row>
                    </div>
                );
              })}
                  </>
                )}
            </Col>
            <Col md={4}>
              <div className="cart-total">
                <h2>Cart Summary</h2>
                <div className="d_flex">
                  <h4>Total Price :</h4>
                  <h3>
                    {discountedPrice < priceWithoutDiscount ? (
                        <>
                      <span className="original-price">
                        <s>{priceWithoutDiscount.toFixed(3)} dinar</s>
                      </span>
                      <br/>
                          <span className="discounted-price">{discountedPrice} dinar</span>
                      <br/>
                          <span className="discount-msg">30% de remise car le total est supérieur à 100</span>
                        </>
                    ) : (
                        <span>{priceWithoutDiscount.toFixed(3)} dinar</span>
                    )}
                  </h3>
                  <button className="confirm-purchase" onClick={handlePay}>
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
  );
};

export default Cart;
