// team.routes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, teamController.getTeams);
router.get('/:id', authMiddleware, teamController.getTeamById);
router.post('/', authMiddleware, teamController.createTeam);

module.exports = router;
