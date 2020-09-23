var mongoose = require("mongoose")
var {ObjectId} = mongoose.Schema; 

var ProductCartSchema = new mongoose.Schema({
    product : {
        type: ObjectId,
        ref: "Product"
    },
    name: String,
    count: Number,
    price: Number
});

var ProductCart = mongoose.model("ProductCart", ProductCartSchema)

var orderSchema = new mongoose.Schema({
    products: [ProductCartSchema],
    transaction_id: {},
    amount :{
        type: Number
    },
    address: String,
    status: {
        type: String,
        default: "Received",
        enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Received"]
    },
    updated: Date,
    user: {
        type: ObjectId,
        ref: "User"
    }
}, {timestamps: true})

var Order = mongoose.model("Order", orderSchema);

module.exports = {Order, ProductCart};