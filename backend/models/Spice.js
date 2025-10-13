const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
/*
Relationship/Properties Guide:
- Spices (and ingredients) can be combined into a Product
- Spices can belong to multiple Products 0...*

*/


const spiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        match: [/^[a-zA-Z]$/, 'Invalid Spice. Must start with a letter, contain only letters.']

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