import React, { useState } from "react";
import { Container, Form, Button, Col, Row, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleLogin = () => {
        // Construct the request body
        const requestBody = {
            username: username,
            password: password,
        };

        // Send the login data to the API
        fetch("http://172.10.0.1:3002/api/user/authenticate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => {

                if (!response.ok) {
                    // Log the response text for debugging
                    return response.text().then(text => {
                        console.error('API Error:', text);
                        throw new Error('Invalid credentials. Please check your username and password.');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Handle the API response
                console.log("API Response:", data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                console.log(localStorage.getItem('username'));
                window.location.href = '/';


            })
            .catch(error => {
                // Handle errors
                setError(error.message || 'An unexpected error occurred.');
                console.error("Error:", error);
            });
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Nom d'utilisateur ou email</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez votre nom d'utilisateur ou email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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

                        {error && <Alert variant="danger">{error}</Alert>}

                        <Button variant="primary" type="button" onClick={handleLogin}>
                            Connexion
                        </Button>
                        <Link to="/forgot-password">Mot de passe oublié ?</Link>

                        <p className="mt-3">
                            Vous n'avez pas de compte ?{" "}
                            <Link to="/inscription">Inscrivez-vous</Link>
                        </p>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
