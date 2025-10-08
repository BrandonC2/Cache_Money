const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*


*/
const productSchema = new mongoose.Schema({
    name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            match: [/^(?!.*[._]{2})(?!.*[._]$)[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/, 'Invalid name. Must contain only letters, numbers or dots and cannot end with or repeat special characters.']

        },
    desc: { 
        type: String,
        required: true,
        minlength: 6
    },
    isLiquid: { 
        type: Boolean,
        required: true,
    },
    isAlcholic: { 
        type: Boolean,
        required: true,
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item"}],
});

module.exports = mongoose.model('Product', productSchema);