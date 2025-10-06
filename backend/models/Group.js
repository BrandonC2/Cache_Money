const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*


*/
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        match: [/^(?!.*[._]{2})(?!.*[._]$)[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/, 'Invalid username. Must start with a letter, contain only letters, numbers, dots, or underscores, and cannot end with or repeat special characters.']

        },
    desc: { 
        type: String,
        required: true,
        minlength: 6
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item"}]
});

module.exports = mongoose.model('Group', groupSchema);