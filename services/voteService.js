import Vote from "../models/vote.js";

export async function getAllVotes() {
    try {
        return await Vote.find({ deletedAt: null }).sort({ createdAt: -1 });
    } catch (error) {
        throw new Error("Error al obtener los votos: " + error.message);
    }
}

export async function createNewVote(data, ipAddress, userAgent) {
    try {
        const { nombreCompleto, documento, edad, municipio, telefono, correo, selectedOption } = data;  // Actualizado

        // Verificar si ya existe un voto con ese documento (cambiado de cedula)
        const existingVote = await Vote.findOne({ 
            documento: documento.trim(),  // Cambiado de 'cedula' a 'documento'
            deletedAt: null 
        });
        
        if (existingVote) {
            throw new Error("Ya existe un voto registrado con este documento");
        }

        // Verificar si ya existe un voto con ese correo
        const existingEmail = await Vote.findOne({ 
            correo: correo.toLowerCase().trim(),
            deletedAt: null 
        });
        
        if (existingEmail) {
            throw new Error("Ya existe un voto registrado con este correo electrónico");
        }

        const newVote = new Vote({ 
            nombreCompleto: nombreCompleto.trim(),
            documento: documento.trim(),  // Cambiado de 'cedula' a 'documento'
            edad: parseInt(edad),         // Campo agregado
            municipio: municipio.trim(),  // Campo agregado
            telefono: telefono.trim(),
            correo: correo.toLowerCase().trim(),
            selectedOption: parseInt(selectedOption),
            ipAddress,
            userAgent
        });
        
        await newVote.save();
        return newVote;
    } catch (error) {
        console.error(error);
        throw new Error(`Error al crear el voto: ${error.message}`);
    }
}

export async function getVotingStatistics() {
    try {
        // Obtener estadísticas por opción
        const stats = await Vote.aggregate([
            { $match: { deletedAt: null } },
            {
                $group: {
                    _id: '$selectedOption',
                    count: { $sum: 1 },
                    optionName: { $first: '$optionName' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalVotes = await Vote.countDocuments({ deletedAt: null });

        // Formatear resultados
        const results = stats.map(item => ({
            option: item._id,
            optionName: item.optionName,
            votes: item.count,
            percentage: totalVotes > 0 ? ((item.count / totalVotes) * 100).toFixed(2) : 0
        }));

        // Obtener el ganador actual
        const winner = results.reduce((prev, current) => 
            (prev.votes > current.votes) ? prev : current
        );

        return {
            totalVotes,
            results,
            winner: winner || null,
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error(error);
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
}

export async function checkIfVoted(documento) {  // Cambiado de 'cedula' a 'documento'
    try {
        const existingVote = await Vote.findOne({ 
            documento: documento.trim(),  // Cambiado de 'cedula' a 'documento'
            deletedAt: null 
        });
        
        return !!existingVote;
    } catch (error) {
        console.error(error);
        throw new Error(`Error al verificar voto: ${error.message}`);
    }
}

export async function getVoteById(voteId) {
    try {
        const vote = await Vote.findById(voteId);
        
        if (!vote) {
            throw new Error("El voto no existe");
        }
        
        return vote;
    } catch (error) {
        console.error(error);
        throw new Error(`Error al obtener el voto: ${error.message}`);
    }
}

export async function deleteVote(voteId) {
    try {
        // Buscar el voto por su ID
        const vote = await Vote.findById(voteId);

        if (!vote) {
            throw new Error("El voto no existe");
        }

        // Realizar el soft delete (marcar como eliminado, sin eliminar realmente)
        vote.deletedAt = new Date();
        await vote.save();

        return vote;
    } catch (error) {
        console.error(error);
        throw new Error(`Error al eliminar el voto: ${error.message}`);
    }
}