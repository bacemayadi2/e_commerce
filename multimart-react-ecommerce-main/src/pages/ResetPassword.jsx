import { useState } from "react";
import { Container, Form, Button, Col, Row, Alert } from "react-bootstrap";

const ResetPassword = () => {
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);

    const handleResetPassword = () => {
        // Validate if passwords match
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Construct the request body
        const requestBody = {
            resetCode: resetCode,
            newPassword: newPassword,
        };

        // Send the reset password request to the API
        fetch("http://172.10.0.1:3002/api/user/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (response.ok) {
                    // Redirect to the login page
                    window.location.href = "/login";
                } else {
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

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formResetCode">
                            <Form.Label>Code de réinitialisation</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le code de réinitialisation"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formNewPassword">
                            <Form.Label>Nouveau mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Entrez le nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Confirmer le mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirmez le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Form.Group>

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Button
                            variant="primary"
                            type="button"
                            onClick={handleResetPassword}
                        >
                            Envoyer
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPassword;
