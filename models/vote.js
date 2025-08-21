import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: [true, "El nombre completo es requerido"],
        trim: true,
        minlength: [2, "El nombre debe tener al menos 2 caracteres"],
        maxlength: [100, "El nombre no puede exceder 100 caracteres"]
    },
    cedula: {
        type: String,
        required: [true, "La cédula es requerida"],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d+$/.test(v);
            },
            message: 'La cédula debe contener solo números'
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
        enum: ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Atlas', 'Bruki']
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
    
    const options = ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Atlas', 'Bruki'];
    
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
    
    const options = ['Ancookies', 'Galletery', 'Fratelli', 'Bluetopia', 'Atlas', 'Bruki'];
    
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