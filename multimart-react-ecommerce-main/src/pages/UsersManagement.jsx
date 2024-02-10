import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Table, Pagination, Button } from "react-bootstrap";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [editableUser, setEditableUser] = useState(null);
    const [modifiedUsername, setModifiedUsername] = useState('');
    const [modifiedEmail, setModifiedEmail] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Fetch users based on current page and items per page
        fetchUsers();
    }, [searchUsername, searchEmail, itemsPerPage, currentPage]);

    const fetchUsers = async () => {
        try {
            let apiUrl = `http://172.10.0.1:3002/api/user/find-all/${itemsPerPage}/${currentPage}`;

            if (searchUsername) {
                apiUrl = `http://172.10.0.1:3002/api/user/find-by-username/${searchUsername}/${itemsPerPage}/${currentPage}`;
            }

            if (searchEmail) {
                apiUrl = `http://172.10.0.1:3002/api/user/find-by-email/${searchEmail}/${itemsPerPage}/${currentPage}`;
            }
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });

            const userData = await response.json();
              console.log(userData.users.success);

            if (userData.users.success) {
                //console.log(userData.users.users);

                 setUsers(userData.users.users);
                 setTotalUsers(userData.total);
                console.log(users[0]);
            } else {
                console.error('Error fetching users:', userData.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSearchUsernameChange = (event) => {
        setSearchUsername(event.target.value);
    };

    const handleSearchEmailChange = (event) => {
        setSearchEmail(event.target.value);
    };
    const handleEditUser = (userId, username, email) => {
        setEditableUser(userId);
        setModifiedUsername(username);
        setModifiedEmail(email);
    };


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (itemsPerPageValue) => {
        setItemsPerPage(itemsPerPageValue);
        setCurrentPage(1);
    };
    const handlePromoteToAdmin = async (userIdToPromote) => {
        try {
            await fetch(`http://172.10.0.1:3002/api/user/promote-admin/${userIdToPromote}`,
                { method: 'PUT',
                    headers: {
                        Authorization: `${token}`,
                    },

                });
            // Refresh users after promoting to admin
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user to admin:', error);
        }
    };
    const handleunPromoteToAdmin = async (userIdToPromote) => {
        try {
            await fetch(`http://172.10.0.1:3002/api/user/unpromote-admin/${userIdToPromote}`,
                { method: 'PUT',
                    headers: {
                        Authorization: `${token}`,
                    },

                });
            // Refresh users after promoting to admin
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user to admin:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const apiUrl = `http://172.10.0.1:3002/api/user/${userId}`;
            await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    Authorization: `${token}`,
                },
            });
            fetchUsers(); // Refresh users after deletion
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    const handleValidateModifier = async (userId) => {
        try {
            const response = await fetch(`http://172.10.0.1:3002/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}` // Add your token here
                },
                body: JSON.stringify({
                    username: modifiedUsername,
                    email: modifiedEmail
                }),
            });


            const updatedUserData = await response.json();

            if (updatedUserData.success) {
                setEditableUser(null);
                // Optionally, refetch the updated user list
                fetchUsers();
            } else {
                console.error('Error updating user:', updatedUserData.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };




    return (
        <Container>
            <Row className="mt-4">
                <Col md={3}>
                    <Form.Label>Users Per Page:</Form.Label>
                    <Form.Select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(e.target.value)}
                    >
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                        <option value={100}>100</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Table striped bordered hover>
                        <thead>
                        <tr>

                            <th>Nom Utilisateur
                                <Form.Control
                                    type="text"
                                    value={searchUsername}
                                    onChange={handleSearchUsernameChange}
                                /></th>
                            <th>Email
                                <Form.Control
                                    type="text"
                                    value={searchEmail}
                                    onChange={handleSearchEmailChange}
                                />
                            </th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{editableUser === user.id ? (
                                    <Form.Control
                                        type="text"
                                        value={modifiedUsername}
                                        onChange={(e) => setModifiedUsername(e.target.value)}
                                    />
                                ) : (
                                    user.username
                                )}
                                </td>
                                <td>
                                    {editableUser === user.id ? (
                                        <Form.Control
                                            type="text"
                                            value={modifiedEmail}
                                            onChange={(e) => setModifiedEmail(e.target.value)}
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td>{user.role}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </Button>
                                    {user.role=="Client" ? (
                                    <Button
                                        variant="primary"
                                        onClick={() => handlePromoteToAdmin(user.id)}
                                    >
                                        promouvoir
                                    </Button>
                                            ):(
                                        <Button
                                            variant="primary"
                                            onClick={() => handleunPromoteToAdmin(user.id)}
                                        >
                                            rétrograder
                                        </Button>
                                    )}

                                    {editableUser === user.id ? (
                                        <Button variant="success" onClick={() => handleValidateModifier(user.id)}>
                                            Valider Modifier
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="info"
                                            onClick={() => handleEditUser(user.id, user.username, user.email)}
                                        >
                                            Modifier
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
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
    );
};

export default UserManagement;
