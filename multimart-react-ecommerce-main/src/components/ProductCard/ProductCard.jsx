import { Col } from "react-bootstrap";
import "./product-card.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "../../app/features/cart/cartSlice";
import { useEffect, useState } from "react";

const ProductCard = ({ title, productItem, triggerTotalDistinctProducts }) => {
    const dispatch = useDispatch();

    const router = useNavigate();

    const [imageNameState, setImageNameState] = useState(productItem.image);

    // Construct the URL for the image
    const imageUrl = `http://localhost:3010/api/images/${imageNameState}`;

    useEffect(() => {
        // Fetch the image
        fetch(imageUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
            })
            .then((blob) => {
                // Create a Blob URL for the image
                const objectURL = URL.createObjectURL(blob);
                // Set the Blob URL as the src for the image element
                document.getElementById(`yourImageId_${productItem.id}`).src = objectURL;
            })
            .catch((error) => {
                console.error("Error fetching image:", error);
            });

        // Cleanup: Revoke the Blob URL when the component unmounts
        return () => URL.revokeObjectURL(imageUrl);
    }, [imageNameState]);


    const handelAdd = async (productId) => {
        try {
            // Call the API to increase product quantity
            const response = await fetch(
                `http://172.10.0.1:3002/api/cart/increase-product-quantity/${productId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );

            const result = await response.json();

            if (result.success) {
                // If API call is successful, dispatch addToCart action and show success toast
                dispatch(addToCart({ product: productItem, num: 1 }));
                toast.success("Product has been added to cart!");
                triggerTotalDistinctProducts();
            } else {
                // If API call fails, show error toast
                toast.error(
                    "Failed to add product to cart. Please try again."
                );
            }
        } catch (error) {
            console.error("Error adding product to cart:", error.message);
            toast.error(
                "Failed to add product to cart. Please try again."
            );
        }
    };

    // Assuming productItem.image.data is a Buffer
    const uint8Array = new Uint8Array(productItem.image.data);
    const blob = new Blob([uint8Array]); // Adjust the type as per your image format
    const blobUrl = URL.createObjectURL(blob);
    const imagePath = `/${productItem.image}`; // Adjust the path based on your project structure

    return (
        <Col md={3} sm={5} xs={10} className="product mtop">
            {title === "Big Discount" ? (
                <span className="discount">{productItem.discount}% Off</span>
            ) : null}
            <img id={`yourImageId_${productItem.id}`} alt="Your Image" />


            <div className="product-like">
                <ion-icon name="heart-outline"></ion-icon>
            </div>

            <div className="product-details">
                <div className="price">
                    <h4>${productItem.price}</h4>
                    <button
                        aria-label="Add"
                        type="submit"
                        className="add"
                        onClick={() => handelAdd(productItem.id)}
                    >
                        <ion-icon name="add"></ion-icon>
                    </button>
                </div>
            </div>
        </Col>
    );
};

export default ProductCard;
