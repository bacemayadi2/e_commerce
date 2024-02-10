// userController.js
const bcrypt = require('bcrypt');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const {JWT_SECRET,RESET_CODE_EXPIRATION_MINUTES  } = require('../Configs/config');
const config = require('../Configs/config');

// Use the executeQuery function from the imported module
const  dbModule =  config.useTestDatabase ? require('../Database/dbTestConfig') : require('../Database/dbConfig');
const {EmailServerConnection}  = require( '../Services/EmailService'); // Adjust the path accordingly

const executeQuery = dbModule.executeQuery;


// Fonction pour créer un nouvel utilisateur
async function createUser(username, email, password) {

    const hashedPassword = md5(password); // utiliser un algorithme de hachage plus fort dans un scénario réel
    const role = 'Client';

    // Vérifier si l'e-mail est déjà utilisé
    const existingUserQuery = `
        SELECT * FROM user
        WHERE email = ?;
    `;

    const existingUser = await executeQuery(existingUserQuery, [email]);

    if (existingUser.length > 0) {
        // L'e-mail est déjà utilisé, retourner une erreur
        throw new Error('Cet e-mail est déjà utilisé.');
    }

    // Si l'e-mail n'est pas déjà utilisé, procéder à la création de l'utilisateur
    const createUserQuery = `
        INSERT INTO user (username, email, password, role) 
        VALUES (?, ?, ?, ?);
    `;

    const result = await executeQuery(createUserQuery, [username, email, hashedPassword, role]);
    return result.insertId;
}

// Fonction pour modifier les informations d'un utilisateur
async function modifyUser(userId, newData) {
    try {
        const { username, email } = newData;

        const updateFields = [];
        const updateValues = [];

        if (username) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (updateFields.length === 0) {
            // Aucun champ valide à mettre à jour
            return { success: false, message: 'Aucun champ valide à mettre à jour.' };
        }

        const updateQuery = `
            UPDATE user 
            SET ${updateFields.join(', ')}
            WHERE id = ?;
        `;

        const updateValuesWithUserId = [...updateValues, userId];

        await executeQuery(updateQuery, updateValuesWithUserId);

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur :', error.message);
        throw error;
    }
}

// Fonction pour modifier le mot de passe d'un utilisateur
async function modifyUserPassword(userId, oldPassword, newPassword, confirmPassword) {
    try {
        // Vérifier si l'ancien mot de passe est correct
        const user = await getUserById(userId);
        if (!user || user.password !== md5(oldPassword)) {
            return { success: false, message: 'Ancien mot de passe incorrect.' };
        }

        // Vérifier si les nouveaux mots de passe correspondent
        if (newPassword !== confirmPassword) {
            return { success: false, message: 'Les nouveaux mots de passe ne correspondent pas.' };
        }

        // Hacher le nouveau mot de passe
        const hashedNewPassword = md5(newPassword);

        // Mettre à jour le mot de passe dans la base de données
        const updatePasswordQuery = `
            UPDATE user 
            SET password = ?
            WHERE id = ?;
        `;

        await executeQuery(updatePasswordQuery, [hashedNewPassword, userId]);

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la modification du mot de passe de l\'utilisateur :', error.message);
        throw error;
    }
}

// Fonction pour supprimer un utilisateur (seul un admin peut supprimer les autres utilisateurs)
async function deleteUser( userIdToDelete) {
    try {
        const deleteQuery = `
            DELETE FROM user 
            WHERE id = ?;
        `;

        await executeQuery(deleteQuery, [userIdToDelete]);

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error.message);
        throw error;
    }
}



async function generateResetCode(email) {
    try {
        // Générer un code aléatoire
        const resetCode = Math.random().toString(36).substring(2, 10);

        // Calculer la date d'expiration du code
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + RESET_CODE_EXPIRATION_MINUTES);
        // Mettre à jour la base de données avec le code de réinitialisation et la date d'expiration
        const updateResetCodeQuery = `
            UPDATE user 
            SET reset_code = ?, reset_code_expires_at = ?
            WHERE email = ?;
        `;

        const {changedRows}=await executeQuery(updateResetCodeQuery, [resetCode, expirationDate, email]);

        if (changedRows==1) return { success: true, resetCode, expirationDate };
        else
            return { success: false };

    } catch (error) {
        console.error('Erreur lors de la génération du code de réinitialisation :', error.message);
        throw error;
    }
}


// Fonction pour envoyer le code de réinitialisation par e-mail
async function sendResetCodeByEmail(email) {
    try {

        // Générer le code de réinitialisation en utilisant la fonction existante
        const { success, resetCode, expirationDate } = await generateResetCode(email);
        if (success) {
            // Construire le contenu de l'e-mail avec le code de réinitialisation
            const emailContent = `
                Bonjour,

                Vous avez demandé une réinitialisation de mot de passe. 
                Utilisez le code suivant dans les ${RESET_CODE_EXPIRATION_MINUTES} prochaines minutes pour réinitialiser votre mot de passe : ${resetCode}.

                Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.

                Cordialement,
                Votre application
            `;

            // Créer une instance de la classe EmailServerConnection
            const emailConnection = new EmailServerConnection();

            // Appeler la fonction sendEmail pour envoyer l'e-mail
            await emailConnection.sendEmail(email, 'Réinitialisation de mot de passe', emailContent);

            return { success: true, expirationDate };
        } else {

            return { success: false, message: 'Erreur lors de la génération du code de réinitialisation.' };
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du code de réinitialisation par e-mail :', error.message);
        throw error;
    }
}


// Fonction pour réinitialiser le mot de passe en utilisant le code de réinitialisation
async function resetPassword(resetCode, newPassword) {
    try {
        // Vérifier que le code de réinitialisation n'est pas nul
        if (!resetCode) {
            return { success: false, message: 'Le code de réinitialisation est manquant.' };
        }
        // Récupérer l'utilisateur associé au code de réinitialisation
        const getUserQuery = `
            SELECT id, reset_code_expires_at
            FROM user
            WHERE reset_code = ?;
        `;

        const [user] = await executeQuery(getUserQuery, [resetCode]);
        // Vérifier que l'utilisateur existe et que le code de réinitialisation n'a pas expiré
        if (!user || !user.reset_code_expires_at || new Date() > new Date(user.reset_code_expires_at)) {
            return { success: false, message: 'Le code de réinitialisation est invalide ou a expiré.' };
        }

        // Hacher le nouveau mot de passe
        const hashedNewPassword = md5(newPassword);

        // Mettre à jour le mot de passe dans la base de données
        const updatePasswordQuery = `
            UPDATE user 
            SET password = ?, reset_code = NULL, reset_code_expires_at = NULL
            WHERE id = ?;
        `;

        await executeQuery(updatePasswordQuery, [hashedNewPassword, user.id]);

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error.message);
        throw error;
    }
}

async function authenticateUser(usernameOrEmail, password) {
    try {
        // Query the database to find all users with the given username or email
        const getUsersQuery = `
            SELECT id, role, username, email, password
            FROM user
            WHERE username = ? OR email = ?;
        `;
        const users = await executeQuery(getUsersQuery, [usernameOrEmail, usernameOrEmail]);

        // Check if any user with the given username or email exists and if the password is correct for at least one of them
        for (const user of users) {

            if (md5(password) === user.password) {
                // Generate a JWT with user information
                const token = jwt.sign({ userId: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '512h' });
                return { success: true, token };
            }
        }

        // If no matching user or incorrect password for any user
        return { success: false, message: 'Incorrect credentials.' };
    } catch (error) {
        console.error('Error authenticating user:', error.message);
        throw error;
    }
}


// Fonction pour promouvoir un utilisateur au rôle d'administrateur
async function promoteUserToAdmin( userIdToPromote) {
    try {

        console.log(userIdToPromote);
        // Mettre à jour le rôle de l'utilisateur à 'Admin'
        const promoteUserQuery = `
            UPDATE user SET role = 'Admin' WHERE id = ?;
        `;

        await executeQuery(promoteUserQuery, [userIdToPromote]);

        return { success: true, message: 'Utilisateur promu au rôle d\'administrateur avec succès.' };
    } catch (error) {
        console.error('Erreur lors de la promotion de l\'utilisateur au rôle d\'administrateur :', error.message);
        throw error;
    }
}
// Fonction pour metre un admin en  un utilisateur
async function unpromoteUserToAdmin( userIdToPromote) {
    try {

        console.log(userIdToPromote);
        // Mettre à jour le rôle de l'utilisateur à 'Admin'
        const promoteUserQuery = `
            UPDATE user SET role = 'Client' WHERE id = ?;
        `;

        await executeQuery(promoteUserQuery, [userIdToPromote]);

        return { success: true, message: 'Utilisateur promu au rôle d\'administrateur avec succès.' };
    } catch (error) {
        console.error('Erreur lors de la promotion de l\'utilisateur au rôle d\'administrateur :', error.message);
        throw error;
    }
}

// Fonction pour récupérer tous les utilisateurs avec pagination (accessible uniquement par un administrateur)
async function findAllUser( itemsPerPage, currentPage) {
    try {

        const offset = (currentPage - 1) * itemsPerPage;
        const query = `
            SELECT * FROM user
            LIMIT ? OFFSET ?;
        `;

        const users = await executeQuery(query, [itemsPerPage, offset]);

        // Récupérer le nombre total d'utilisateurs
        const countQuery = 'SELECT COUNT(*) AS total FROM user;';
        const totalUsers = await executeQuery(countQuery);
        const total = totalUsers[0].total;

        return { success: true, users, total, currentPage, itemsPerPage };
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les utilisateurs avec pagination :', error.message);
        throw error;
    }
}

// Fonction pour récupérer les utilisateurs par nom d'utilisateur avec pagination (accessible uniquement par un administrateur)
async function findUserByUsername( partialUsername, itemsPerPage, currentPage) {
    try {

        const offset = (currentPage - 1) * itemsPerPage;
        const query = `
            SELECT * FROM user
            WHERE username LIKE ?
            LIMIT ? OFFSET ?;
        `;

        const partialUsernamePattern = `%${partialUsername}%`;
        const users = await executeQuery(query, [partialUsernamePattern, itemsPerPage, offset]);

        // Récupérer le nombre total d'utilisateurs avec le nom d'utilisateur partiel
        const countQuery = 'SELECT COUNT(*) AS total FROM user WHERE username LIKE ?;';
        const totalUsers = await executeQuery(countQuery, [partialUsernamePattern]);
        const total = totalUsers[0].total;

        return { success: true, users, total, currentPage, itemsPerPage };
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur par nom d\'utilisateur avec pagination :', error.message);
        throw error;
    }
}

// Fonction pour récupérer les utilisateurs par adresse e-mail avec pagination (accessible uniquement par un administrateur)
async function findUserByEmail( partialEmail, itemsPerPage, currentPage) {
    try {



        const offset = (currentPage - 1) * itemsPerPage;
        const query = `
            SELECT * FROM user
            WHERE email LIKE ?
            LIMIT ? OFFSET ?;
        `;

        const partialEmailPattern = `%${partialEmail}%`;
        const users = await executeQuery(query, [partialEmailPattern, itemsPerPage, offset]);

        // Récupérer le nombre total d'utilisateurs avec l'adresse e-mail partielle
        const countQuery = 'SELECT COUNT(*) AS total FROM user WHERE email LIKE ?;';
        const totalUsers = await executeQuery(countQuery, [partialEmailPattern]);
        const total = totalUsers[0].total;

        return { success: true, users, total, currentPage, itemsPerPage };
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur par adresse e-mail avec pagination :', error.message);
        throw error;
    }
}
// Fonction pour obtenir un utilisateur par ID
async function getUserById(userId) {
    const getUserQuery = `
        SELECT * FROM user
        WHERE id = ?;
    `;

    const user = await executeQuery(getUserQuery, [userId]);

    if (user.length === 0) {
        // Si aucun utilisateur n'est trouvé avec l'ID spécifié, retourner null ou gérer en conséquence
        return null;
    }

    // En supposant que vous vous attendez à un seul utilisateur avec l'ID spécifié


    return user[0];
}
async function isUserAdmin(userId) {
    let user =await getUserById(userId);
    return user.role == "Admin"
}
module.exports = {
    createUser,
    modifyUser,
    modifyUserPassword,
    deleteUser,
    generateResetCode,
    sendResetCodeByEmail,
    resetPassword,
    authenticateUser,
    promoteUserToAdmin,
    findAllUser,
    findUserByUsername,
    findUserByEmail,
    getUserById,
    isUserAdmin,
    unpromoteUserToAdmin,

};
