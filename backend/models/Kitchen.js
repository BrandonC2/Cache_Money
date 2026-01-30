const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const kitchenSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  members: [{ type: String }], // store usernames that joined
});

kitchenSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 10);
});

kitchenSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Kitchen", kitchenSchema);
