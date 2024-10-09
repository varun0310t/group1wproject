import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String
});
const Menu = mongoose.model('Menu', menuSchema);

export default Menu;