const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
/*
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
*/
module.exports = mongoose.model('item', itemSchema);