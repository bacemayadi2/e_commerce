// main.js
const { dbConfig } = require('./Database/dbConfig');
const { initializeDatabase } = require('./Database/dbInitialize');
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const productRoutes = require('./routes/ProductRoutes');
const cartRoutes = require('./routes/CartRoutes');
const cors = require('cors');
const multer = require('multer');


const config = require('./Configs/config');

// Utilisez dbConfig pour la configuration générale de la base de données
console.log('Configuration de la base de données :', dbConfig);

// Appelez initializeDatabase pour vérifier et créer la base de données si nécessaire
initializeDatabase()
    .then(() => {
        console.log('Initialisation de la base de données terminée.');
    })
    .catch(error => {
        console.error('Erreur lors de l\'initialisation de la base de données :', error.message);
    });
const app = express();
const port = 3002;
app.use(cors());


app.use(bodyParser.json());
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
module.exports = app ;
