// routes/vote.routes.js
import express from 'express';
import {
  getVotes,
  createVote,
  getStatistics,
  checkVote,
  getVote,
  removeVote
} from '../controllers/voteController.js';

const router = express.Router();

// GET /api/vote - Obtener todos los votos
router.get('/getAll', getVotes);

// POST /api/vote - Crear un nuevo voto
router.post('/create', createVote);

// GET /api/vote/statistics - Obtener estadísticas
router.get('/statistics', getStatistics);

// GET /api/vote/check/:cedula - Verificar si ya votó
router.get('/check/:cedula', checkVote);

// GET /api/vote/:id - Obtener un voto específico
router.get('/:id', getVote);

// DELETE /api/vote/:id - Eliminar un voto (soft delete)
router.delete('/:id', removeVote);

export default router;