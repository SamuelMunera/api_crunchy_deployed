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
        const { nombreCompleto, documento, edad, municipio, telefono, correo, selectedOption } = req.body;  // Actualizado
        
        // Validación de campos (actualizada)
        if (!nombreCompleto || !documento || !edad || !municipio || !telefono || !correo || selectedOption === undefined) {
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

        // Validar edad
        if (edad < 5 || edad > 120) {
            return res.status(400).json({ 
                message: "La edad debe estar entre 5 y 120 años" 
            });
        }

        // Validar documento (solo números)
        if (!/^\d+$/.test(documento.trim())) {
            return res.status(400).json({ 
                message: "El documento debe contener solo números" 
            });
        }

        // Validar teléfono
        if (!/^\d{7,15}$/.test(telefono.trim())) {
            return res.status(400).json({ 
                message: "El teléfono debe tener entre 7 y 15 dígitos" 
            });
        }

        // Validar correo
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(correo.trim())) {
            return res.status(400).json({ 
                message: "Formato de correo electrónico inválido" 
            });
        }

        // Validar municipio
        const municipiosValidos = [
            'Abejorral', 'Alejandría', 'Bello', 'Carmen de Viboral', 
            'Cocorná', 'Concepción', 'El Peñol', 'El Retiro', 
            'El Santuario', 'Envigado', 'Guarne', 'Guatapé', 
            'Itagui', 'La Ceja', 'La Unión', 'Medellin', 
            'Rionegro', 'Sabaneta', 'Sonsón', 'Otro'
        ];
        
        if (!municipiosValidos.includes(municipio)) {
            return res.status(400).json({ 
                message: "Municipio no válido" 
            });
        }
        
        // Obtener IP y User Agent
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        const newVote = await createNewVote({
            nombreCompleto,
            documento,  // Cambiado de 'cedula' a 'documento'
            edad,       // Campo agregado
            municipio,  // Campo agregado
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
        const { documento } = req.params;  // Cambiado de 'cedula' a 'documento'
        
        if (!documento) {
            return res.status(400).json({ 
                message: "Documento es requerido" 
            });
        }
        
        const hasVoted = await checkIfVoted(documento);
                
        res.status(200).json({
            documento,  // Cambiado de 'cedula' a 'documento'
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