import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: [true, "El nombre completo es requerido"],
        trim: true,
        minlength: [2, "El nombre debe tener al menos 2 caracteres"],
        maxlength: [100, "El nombre no puede exceder 100 caracteres"]
    },
    documento: {  // Cambiado de 'cedula' a 'documento'
        type: String,
        required: [true, "El documento es requerido"],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d+$/.test(v);
            },
            message: 'El documento debe contener solo números'
        }
    },
    edad: {  // Campo agregado
        type: Number,
        required: [true, "La edad es requerida"],
        min: [5, "La edad mínima es 5 años"],
        max: [100, "La edad máxima es 120 años"]
    },
    municipio: {  // Campo agregado
        type: String,
        required: [true, "El municipio es requerido"],
        trim: true,
        enum: {
            values: [
                'Abejorral', 'Alejandría', 'Bello', 'Carmen de Viboral', 
                'Cocorná', 'Concepción', 'El Peñol', 'El Retiro', 
                'El Santuario', 'Envigado', 'Guarne', 'Guatapé', 
                'Itagui', 'La Ceja', 'La Unión', 'Medellin', 
                'Rionegro', 'Sabaneta', 'Sonsón', 'Otro'
            ],
            message: 'Municipio no válido'
        }
    },
    telefono: {
        type: String,
        required: [true, "El teléfono es requerido"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{7,15}$/.test(v);
            },
            message: 'El teléfono debe tener entre 7 y 15 dígitos'
        }
    },
    correo: {
        type: String,
        required: [true, "El correo electrónico es requerido"],
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Formato de correo electrónico inválido'
        }
    },
    selectedOption: {
        type: Number,
        required: [true, "La opción seleccionada es requerida"],
        min: [0, "La opción debe estar entre 0 y 5"],
        max: [5, "La opción debe estar entre 0 y 5"]
    },
    optionName: {
        type: String,
        required: [true, "El nombre de la opción es requerido"],
        enum: ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Koalas', 'Bruki']  // Corregido: Koalas en lugar de Atlas
    },
    ipAddress: {
        type: String,
        required: [true, "La dirección IP es requerida"]
    },
    userAgent: {
        type: String,
        required: [true, "El user agent es requerido"]
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware pre-save para asignar el nombre de la opción
voteSchema.pre('save', function(next) {
    console.log('Pre-save middleware ejecutándose...');
    console.log('selectedOption:', this.selectedOption);
    
    const options = ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Koalas', 'Bruki'];  // Corregido
    
    // Verificar que selectedOption sea un número válido
    if (typeof this.selectedOption === 'number' && 
        this.selectedOption >= 0 && 
        this.selectedOption <= 5) {
        this.optionName = options[this.selectedOption];
        console.log('optionName asignado:', this.optionName);
    } else {
        console.log('selectedOption inválido:', this.selectedOption);
        this.optionName = 'Opción desconocida';
    }
    
    next();
});

// Middleware pre-validate para asegurarse de que optionName se asigne antes de la validación
voteSchema.pre('validate', function(next) {
    console.log('Pre-validate middleware ejecutándose...');
    
    const options = ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Koalas', 'Bruki'];  // Corregido
    
    // Si no tiene optionName pero sí selectedOption, asignarlo
    if (!this.optionName && typeof this.selectedOption === 'number') {
        if (this.selectedOption >= 0 && this.selectedOption <= 5) {
            this.optionName = options[this.selectedOption];
            console.log('optionName asignado en pre-validate:', this.optionName);
        }
    }
    
    next();
});

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;