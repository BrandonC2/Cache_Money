const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        match: [/^(?!.*[._]{2})(?!.*[._]$)[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/, 'Invalid username. Must start with a letter, contain only letters, numbers, dots, or underscores, and cannot end with or repeat special characters.']

    },
    email: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, 
    },
    password: { 
        type: String,
        required: true,
        minlength: 6
    }
  ,
  isAdmin: {
    type: Boolean,
    default: false,
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);