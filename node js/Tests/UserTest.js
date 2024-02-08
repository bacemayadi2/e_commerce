const supertest = require('supertest');
const app = require('./test');
const { initializeTestDatabase, DeleteTestDatabase } = require('../Database/dbTestIntialize');
const assert = require('assert');
const {dbtestConfig} = require("../Database/dbTestConfig");

// Utilisez dbConfig pour la configuration générale de la base de données
const PORT = 3003; // Set the port for the server

describe('Création d\'utilisateur API', () => {
    let createdUserId;
    let authToken;
    before(async () => {

        try {
            // Delete the test database first
            await DeleteTestDatabase();

            // Then initialize the test database
            await initializeTestDatabase();
        } catch (error) {
            console.error('Error during database setup:', error.message);
            process.exit(1); // Exit the process with an error code
        }
    });

    it('Devrait créer un nouvel utilisateur avec des informations valides', async () => {
        try {
            const response = await supertest(app)
                .post('/api/user/create') // Fix: Add a forward slash before 'api'
                .send({
                    username: 'nouvel_utilisateur',
                    email: 'utilisateur@example.com',
                    password: '0000',
                });

            assert.strictEqual(response.status, 200);
            assert.ok(response.body.userId);
            createdUserId = response.body.userId;

        } catch (error) {
            console.error('Error during test execution:', error.message);
            assert.fail('Test failed');
        }
    });

    it('Devrait renvoyer une erreur pour un e-mail déjà utilisé', async () => {
        try {
            const response = await supertest(app)
                .post('/api/user/create') // Fix: Add a forward slash before 'api'
                .send({
                    username: 'utilisateur_existant',
                    email: 'utilisateur@example.com',
                    password: '0000',
                });

            assert.strictEqual(response.status, 400);
            assert.strictEqual(response.body.error, 'Cet e-mail est déjà utilisé.');
        } catch (error) {
            console.error('Error during test execution:', error.message);
            assert.fail('Test failed');
        }
    });
    it('Devrait réussir l\'authentification et renvoyer un token', async () => {
        try {
            const response = await supertest(app)
                .post('/api/user/authenticate')
                .send({
                    username: 'nouvel_utilisateur',
                    password: '0000',
                });

            assert.strictEqual(response.status, 200);
            assert.ok(response.body.token);
            // Save the token for later use in other tests
             authToken = response.body.token;

            // You can use authToken in subsequent tests
        } catch (error) {
            console.error('Error during authentication test:', error.message);
            assert.fail('Test failed');
        }
    });
    it('Devrait modifier un utilisateur existant', async () => {
        try {
            const response = await supertest(app)
                .put(`/api/user/${createdUserId}`)
                .set('Authorization', authToken)
                .send({
                    username: 'nouveau_nom_utilisateur',
                });

            assert.strictEqual(response.status, 200);
            assert.ok(response.body.success);
        } catch (error) {
            console.error('Error during test execution:', error.message);
            assert.fail('Test failed');
        }
    });

    it('Devrait supprimer un utilisateur existant', async () => {
        try {
            const response = await supertest(app)
                .delete(`/api/user/${createdUserId}`)
                .set('Authorization', authToken);

            assert.strictEqual(response.status, 200);
            assert.ok(response.body.success);
        } catch (error) {
            console.error('Error during test execution:', error.message);
            assert.fail('Test failed');
        }
    });


    // Add other tests as needed

    after(async () => {
        try {

            // Teardown: Reset the test database after running tests
        } catch (error) {
            console.error('Error during teardown:', error.message);
            process.exit(1);
        }
    });
});
