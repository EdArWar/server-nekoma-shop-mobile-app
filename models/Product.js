const { Schema, model } = require("mongoose");

const Product = new Schema({
  productBrand: { type: String, required: true },
  productName: { type: String, required: true },
  productTitle: { type: String, required: true },
  productDescription: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImage: [
    {
      public_id: { type: String },
      url: { type: String },
    },
  ],
  productTag: { type: String },
  quantity: { type: Number, default: 1 },
  date: { type: Date, default: Date.now() },
});

module.exports = model("Product", Product);
