import { useState } from "react";
import { Container, Form, Button, Col, Row, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const Inscription = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);

    const handleRegistration = () => {
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Construct the request body
        const requestBody = {
            username: username,
            email: email,
            password: password,

        };

        // Send the registration data to the API
        fetch("http://172.10.0.1:3002/api/user/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(data => {
                // Check if the API returns an error related to duplicate email
                if (data.error && data.error.includes("Cet e-mail est déjà utilisé.")) {
                    setError("Cet e-mail est déjà utilisé.");
                } else {
                    // Handle the success case, e.g., redirect to login page
                    console.log("Utilisateur enregistré avec succès :", data);
                    window.location.href = '/login';

                }
            })
            .catch(error => {
                // Handle other errors
                console.error("Erreur :", error);
            });
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Nom d'utilisateur</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez votre nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Entrez votre adresse e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirmPassword">
                            <Form.Label>Confirmer le mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirmez votre mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="button" onClick={handleRegistration}>
                            S'inscrire
                        </Button>

                        <p className="mt-3">
                            Vous avez déjà un compte ?{" "}
                            <Link to="/login">Connectez-vous</Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Inscription;
