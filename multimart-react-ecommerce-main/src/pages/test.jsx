import { Fragment, useEffect, useState } from "react";
import { Container, Table, Form, Button } from "react-bootstrap";
import { BsArrowLeftRight } from "react-icons/bs";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const [partialUsername, setPartialUsername] = useState("");
    const [partialEmail, setPartialEmail] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                `http://172.10.0.1:3002/api/user/find-all/userperpage/${itemsPerPage}/${currentPage}`,
                {
                    method: "Get", // Assuming you're using PUT to modify the user
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add the body with the updated user data
                    body: JSON.stringify({/* Updated user data */}),
                }
            );
            const result = await response.json();
            if (result.users && result.users.success) {
                setUsers(result.users.users);
                setTotalUsers(result.users.total);
            }
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchByUsername = async () => {
        try {
            const response = await fetch(
                `http://172.10.0.1:3002/api/user/find-by-username/${partialUsername}/${itemsPerPage}/${currentPage}`,
                {
                    method: "PUT", // Assuming you're using PUT to modify the user
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add the body with the updated user data
                    body: JSON.stringify({/* Updated user data */}),
                }
            );
            const result = await response.json();
            if (result.users && result.users.success) {
                setUsers(result.users.users);
                setTotalUsers(result.users.total);
            }
        } catch (error) {
            console.error("Error searching users by username:", error.message);
        }
    };

    const handleSearchByEmail = async () => {
        try {
            const response = await fetch(
                `http://172.10.0.1:3002/api/user/find-by-email/${partialEmail}/${itemsPerPage}/${currentPage}`,
                {
                    method: "PUT", // Assuming you're using PUT to modify the user
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add the body with the updated user data
                    body: JSON.stringify({/* Updated user data */}),
                }
            );
            const result = await response.json();
            if (result.users && result.users.success) {
                setUsers(result.users.users);
                setTotalUsers(result.users.total);
            }
        } catch (error) {
            console.error("Error searching users by email:", error.message);
        }
    };

    const handlePromoteToAdmin = async (userIdToPromote) => {
        try {
            const response = await fetch(
                `http://172.10.0.1:3002/api/user/promote-admin/${userIdToPromote}`,
                {
                    method: "PUT", // Assuming you're using PUT to modify the user
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add the body with the updated user data
                    body: JSON.stringify({/* Updated user data */}),
                }
            );
            const result = await response.json();
            if (result.success) {
                // Handle success, maybe fetch users again
                fetchUsers();
            } else {
                console.error("Error promoting user to admin:", result.message);
            }
        } catch (error) {
            console.error("Error promoting user to admin:", error.message);
        }
    };

    const handleValidateModifier = async (userId) => {
        try {
            const response = await fetch(
                `http://172.10.0.1:3002/api/user/${userId}`,
                {
                    method: "PUT", // Assuming you're using PUT to modify the user
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add the body with the updated user data
                    body: JSON.stringify({/* Updated user data */}),
                }
            );
            const result = await response.json();
            if (result.success) {
                // Handle success, maybe fetch users again
                fetchUsers();
            } else {
                console.error("Error validating modifier:", result.message);
            }
        } catch (error) {
            console.error("Error validating modifier:", error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage]);

    return (
        <Fragment>
            <Container className="mt-4">
                <h2>User Management</h2>
                <div className="d-flex justify-content-end mb-3">
                    <Form.Control
                        as="select"
                        className="me-2"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(e.target.value)}
                    >
                        <option value="20">20</option>
                        <option value="40">40</option>
                        <option value="100">100</option>
                    </Form.Control>
                    <Button variant="primary" onClick={() => fetchUsers()}>
                        <BsArrowLeftRight className="me-1" />
                        Refresh
                    </Button>
                </div>

                <Form className="mb-3">
                    <Form.Group controlId="formUsername">
                        <Form.Label>Search by Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter partial username"
                            value={partialUsername}
                            onChange={(e) => setPartialUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleSearchByUsername}>
                        Search
                    </Button>
                </Form>

                <Form className="mb-3">
                    <Form.Group controlId="formEmail">
                        <Form.Label>Search by Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter partial email"
                            value={partialEmail}
                            onChange={(e) => setPartialEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleSearchByEmail}>
                        Search
                    </Button>
                </Form>

                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Nom Utilisateur</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Delete</th>
                        <th>Promote to Admin</th>
                        <th>Valider Modifer</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>Delete Button</td>
                            <td>
                                <Button
                                    variant="success"
                                    onClick={() => handlePromoteToAdmin(user.id)}
                                >
                                    Promote
                                </Button>
                            </td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => handleValidateModifier(user.id)}
                                >
                                    Valider Modifer
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>

                {/* Pagination */}
                <div className="d-flex justify-content-center">
                    <nav>
                        <ul className="pagination">
                            {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }).map(
                                (_, index) => (
                                    <li
                                        key={index}
                                        className={`page-item ${
                                            index + 1 === currentPage ? "active" : ""
                                        }`}
                                    >
                                        <Button
                                            variant="link"
                                            className="page-link"
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </Button>
                                    </li>
                                )
                            )}
                        </ul>
                    </nav>
                </div>
            </Container>
        </Fragment>
    );
};

export default UserManagement;
