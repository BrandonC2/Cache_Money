const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
/*
Relationship Guides:
- Every Item belongs to one and only one (Food) Group 1...1
- Items (and Spices) can be combined into a Product

*/

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        //unique: true,
        trim: true,
        minlength: 3,
        match: [/^(?!.*[._]{2})(?!.*[._]$)[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/, 'Invalid item. Must start with a letter, contain only letters, numbers, dots, or underscores, and cannot end with or repeat special characters.']

        },
    expire: { 
        type: datetime,
        required: true,
        trim: true,
    },
    // Expect nature setting: water, milk, etc.
    isLiquid: { 
        type: Boolean,
        required: true,
    },
    desc: { 
        type: String,
        required: true,
        trim: true,
    },
    items: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Group",
    },
});
module.exports = mongoose.model('item', itemSchema);