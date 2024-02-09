import { useState } from "react";
import { Container, Form, Button, Col, Row, Alert, Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleResetPassword = () => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Veuillez fournir une adresse e-mail valide.");
            return;
        }

        // Construct the request body
        const requestBody = {
            email: email,
        };

        // Send the reset password request to the API
        fetch("http://172.10.0.1:3002/api/user/reset-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (response.ok) {
                    setShowSuccessModal(true);
                    setError(null);
                } else {
                    setShowSuccessModal(false);
                    return response.json();
                }
            })
            .then((data) => {
                // Handle the API response
                if (data && data.error) {
                    setError(data.error);
                }
            })
            .catch((error) => {
                // Handle errors
                setError("Une erreur s'est produite. Veuillez réessayer.");
                console.error("Error:", error);
            });
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        // Redirect to the reset password page
        window.location.href = '/resetpassword';

    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Adresse e-mail</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Entrez votre adresse e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Button
                            variant="primary"
                            type="button"
                            onClick={handleResetPassword}
                        >
                            Réinitialiser le mot de passe
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Si l'email est valide, un email de réinitialisation de mot de passe a été envoyé.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseSuccessModal}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ForgetPassword;
