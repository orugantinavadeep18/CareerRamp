const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: { type: Date, default: Date.now },
})

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Compare plain password with hash
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
