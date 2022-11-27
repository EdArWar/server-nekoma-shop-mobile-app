const { Schema, model } = require("mongoose");

const ExternalUser = new Schema({
  providerId: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  avatar: { type: String },
  roles: [{ type: String, ref: "Role" }],
  externalId: { type: String, unique: true, required: true },
  favorite: {
    type: Array,
    default: [],
  },
  products: {
    type: Array,
    default: [],
  },
});

module.exports = model("ExternalUser", ExternalUser);
