const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
/*
Ingredient without the bool values
*/


const spiceSchema = new mongoose.Schema({
    name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            match: [/^(?!.*[._]{2})(?!.*[._]$)[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/, 'Invalid username. Must start with a letter, contain only letters, numbers, dots, or underscores, and cannot end with or repeat special characters.']

        },
    expire: { 
        type: datetime,
        required: true,
        trim: true,
        lowercase: true, 
    },
    desc: { 
        type: String,
        required: true,
        trim: true,
    },
});

module.exports = mongoose.model('Spice', spiceSchema);