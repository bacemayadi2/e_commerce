// userRoutes.js
const express = require('express');
const { isUserAdmin,createUser, modifyUser, deleteUser, generateResetCode, sendResetCodeByEmail, resetPassword, authenticateUser, promoteUserToAdmin,modifyUserPassword,findAllUser,findUserByUsername,findUserByEmail ,unpromoteUserToAdmin} = require('../Controllers/UserController');
const { verifyToken, verifyAdminRole } = require('../Middlewares/authMiddleware');

const router = express.Router();

// API pour créer un utilisateur
router.post('/user/create', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = await createUser(username, email, password);
        res.json({ userId });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error.message);

        // Vérifier si l'erreur est due à un e-mail déjà utilisé
        if (error.message === 'Cet e-mail est déjà utilisé.') {
            res.status(400).json({ error: 'Cet e-mail est déjà utilisé.' });
        } else {
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
});

// Modifier un utilisateur (nécessite une authentification)
router.put('/user/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const newData = req.body; // Inclure les champs à modifier dans le corps de la requête

        // Vérifier si l'utilisateur authentifié est administrateur ou l'utilisateur cible
        const { user } = req; // Assuming you attach the user information to the request during token verification

        if (await isUserAdmin(user.id) || user.id == userId) {
            await modifyUser(userId, newData);
            res.json({ success: true });
        } else {
            res.status(403).json({ error: 'Accès non autorisé' });
        }
    } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer un utilisateur par un user  (nécessite une authentification)
router.delete('/user/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { user } = req; // Assuming you attach the user information to the request during token verification
        if (await isUserAdmin(user.id) || user.id == userId)
            {

            await deleteUser(userId);
            res.json({ success: true });
            } else
                {
                res.status(403).json({ error: 'Accès non autorisé' });
                }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Générer un code de réinitialisation et envoyer un e-mail
router.post('/user/reset-code', async (req, res) => {
    try {
        const { email } = req.body;
        const resetCode = await generateResetCode(email);
        const {success } =await sendResetCodeByEmail(email, resetCode);
        if (success)
            res.json({ success: true });
        else
            res.json({ success: false });
    } catch (error) {
        console.error('Erreur lors de la génération du code de réinitialisation :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Réinitialiser le mot de passe à l'aide du code de réinitialisation
router.post('/user/reset-password', async (req, res) => {
    try {
        const { resetCode, newPassword } = req.body;
        const {success }=await resetPassword(resetCode, newPassword);
        if (success)
        {
            res.json({ success: true });
        }
        else {
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Authentifier l'utilisateur et retourner le JWT
router.post('/user/authenticate', async (req, res) => {
    try {
        const { username, password } = req.body;
        const {success,token }= await authenticateUser(username, password);

        if (success) {
          //  const token = jwt.sign({ userId: user.id, username: user.username, email: user.email ,role: user.role}, JWT_SECRET, { expiresIn: '5h' });
            res.json({ token,username });
        } else {
            res.status(401).json({ error: 'L\'authentification a échoué' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'authentification de l\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Promouvoir l'utilisateur à administrateur (nécessite une authentification et un rôle d'administrateur)
router.put('/user/promote-admin/:userIdToPromote', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { userIdToPromote } = req.params;
        const {success }=await promoteUserToAdmin(userIdToPromote);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la promotion de l\'utilisateur à administrateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// enlever le role admin a  l'utilisateur (nécessite une authentification et un rôle d'administrateur)
router.put('/user/unpromote-admin/:userIdToPromote', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const { userIdToPromote } = req.params;
        const {success }=await unpromoteUserToAdmin(userIdToPromote);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la promotion de l\'utilisateur à administrateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});
// Modifier le mot de passe de l'utilisateur (requiert une authentification)
router.put('/user/modify-password/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const {success }=await modifyUserPassword(userId, oldPassword, newPassword, confirmPassword);
        if (success)
            res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la modification du mot de passe de l\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Trouver tous les utilisateurs (requiert un rôle d'administrateur)
router.get('/user/find-all/:itemsPerPage/:currentPage', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const {  itemsPerPage, currentPage } = req.params;
        const users = await findAllUser(itemsPerPage, currentPage);
        res.json({ users });
    } catch (error) {
        console.error('Erreur lors de la recherche de tous les utilisateurs :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Trouver un utilisateur par nom d'utilisateur (requiert un rôle d'administrateur)
router.get('/user/find-by-username/:partialUsername/:itemsPerPage/:currentPage', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const {  partialUsername, itemsPerPage, currentPage } = req.params;
        const users = await findUserByUsername( partialUsername, itemsPerPage, currentPage);
        res.json({ users });
    } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs par nom d\'utilisateur :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Trouver un utilisateur par adresse e-mail (requiert un rôle d'administrateur)
router.get('/user/find-by-email/:partialEmail/:itemsPerPage/:currentPage', verifyToken, verifyAdminRole, async (req, res) => {
    try {
        const {  partialEmail, itemsPerPage, currentPage } = req.params;
        const users = await findUserByEmail(partialEmail, itemsPerPage, currentPage);
        res.json({ users });
    } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs par adresse e-mail :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});
// Route to check if the user is an admin
router.get('/check-admin', verifyToken,verifyAdminRole,(req, res) => {
    try {

        res.json({ success: true });
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
    module.exports = router;

