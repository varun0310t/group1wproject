import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerEmail: {String},
    items: [String],
    status: { type: String, default: "Pending" }
});
const Order = mongoose.model('Order', orderSchema);

export default Order;