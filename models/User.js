const { Schema, model } = require("mongoose");

const User = new Schema({
  userName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: [
    {
      public_id: { type: String },
      url: { type: String },
    },
  ],
  roles: [{ type: String, ref: "Role" }],
  favorite: {
    type: Array,
    default: [],
  },
  products: {
    type: Array,
    default: [],
  },
});

module.exports = model("User", User);
