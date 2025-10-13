const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*
Relationship Guides:
- A (Food) Group can own many items   0...*

*/
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        match: [/^[a-zA-Z]$/, 'Invalid group. Must start with a letter, contain only letters.']

        },
    desc: { 
        type: String,
        required: true,
        minlength: 6
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item"}]
});

module.exports = mongoose.model('Group', groupSchema);