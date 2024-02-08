// dbInitialize.js
const { dbConfig } = require('./dbConfig');
// Requête pour créer les tables
const mysql = require("mysql2/promise");
const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    reset_code VARCHAR(255),
    reset_code_expires_at DATETIME
  );



  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    edited_at DATETIME,
    user_id INT,
    payed DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_line (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quantity INT NOT NULL,
    cart_id INT,
    product_id INT,
    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
  );

  CREATE TABLE IF NOT EXISTS product_category (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
  )
`;
// Fonction pour vérifier si la base de données existe
async function databaseExists() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });

        // Vérifier si la base de données existe
        const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);

        return rows.length > 0;
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'existence de la base de données :', error.message);
        return false;
    }
}

// Fonction d'initialisation de la base de données
async function initializeDatabase() {
    try {
        const dbExists = await databaseExists();

        if (!dbExists) {
            // Créer une connexion pour créer la base de données et les tables
            const connection = await mysql.createConnection({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
            });

            // Créer la base de données
            await connection.query(`CREATE DATABASE ${dbConfig.database}`);
            console.log(`Base de données '${dbConfig.database}' créée.`);

            // Utiliser la base de données nouvellement créée
            await connection.query(`USE ${dbConfig.database}`);

            // Séparer la requête de création des tables en requêtes individuelles
            const individualQueries = createTablesQuery.split(';').filter(query => query.trim() !== '');

            // Exécuter chaque requête individuelle pour créer les tables
            for (const query of individualQueries) {
                await connection.query(query);
            }

            console.log('Tables de la base de données créées avec succès !');

            // Fermer la connexion
            connection.end();
        } else {
            console.log(`La base de données '${dbConfig.database}' existe déjà. Création ignorée.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error.message);
    }
}

// Exporter la fonction d'initialisation de la base de données
module.exports = { initializeDatabase };
