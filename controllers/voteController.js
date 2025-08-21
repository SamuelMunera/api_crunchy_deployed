import Vote from '../models/vote.js';
import { 
    getAllVotes, 
    createNewVote, 
    getVotingStatistics, 
    checkIfVoted, 
    getVoteById, 
    deleteVote 
} from '../services/voteService.js';

export async function getVotes(req, res) {
    try {
        const votes = await getAllVotes();
        res.status(200).json(votes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function createVote(req, res) {
    try {
        const { nombreCompleto, cedula, telefono, correo, selectedOption } = req.body;

        // Validación de campos
        if (!nombreCompleto || !cedula || !telefono || !correo || selectedOption === undefined) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        // Validar rango de opción
        if (selectedOption < 0 || selectedOption > 5) {
            return res.status(400).json({ 
                message: "Opción seleccionada inválida" 
            });
        }

        // Obtener IP y User Agent
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const newVote = await createNewVote({
            nombreCompleto,
            cedula,
            telefono,
            correo,
            selectedOption
        }, ipAddress, userAgent);

        return res.status(201).json({
            message: "Voto registrado exitosamente",
            vote: newVote
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

export async function getStatistics(req, res) {
    try {
        const statistics = await getVotingStatistics();
        res.status(200).json(statistics);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function checkVote(req, res) {
    try {
        const { cedula } = req.params;

        if (!cedula) {
            return res.status(400).json({ 
                message: "Cédula es requerida" 
            });
        }

        const hasVoted = await checkIfVoted(cedula);
        
        res.status(200).json({
            cedula,
            hasVoted
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export async function getVote(req, res) {
    try {
        const { id } = req.params;
        const vote = await getVoteById(id);

        if (!vote) {
            return res.status(404).json({ message: "El voto no existe" });
        }

        return res.status(200).json(vote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export async function removeVote(req, res) {
    const { id } = req.params;

    try {
        const voteEliminado = await deleteVote(id);

        if (!voteEliminado) {
            return res.status(404).json({ message: "Voto no encontrado" });
        }

        return res.status(200).json({ 
            message: "Voto eliminado", 
            vote: voteEliminado 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al eliminar el voto", 
            error: error.message 
        });
    }
}