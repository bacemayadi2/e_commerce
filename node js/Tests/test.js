// main.js
const { dbtestConfig } = require('../Database/dbTestConfig');
const { initializeTestDatabase } = require('../Database/dbTestIntialize');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/userRoutes');
const config = require('../Configs/config');

// Utilisez dbConfig pour la configuration générale de la base de données
console.log('Configuration de la base de données :', dbtestConfig);


// Appelez initializeDatabase pour vérifier et créer la base de données si nécessaire
initializeTestDatabase()
    .then(() => {
        console.log('Initialisation de la base de données terminée.');
    })
    .catch(error => {
        console.error('Erreur lors de l\'initialisation de la base de données :', error.message);
    });
const app = express();
const port = 3003;

app.use(bodyParser.json());
app.use('/api', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
module.exports = app ;
