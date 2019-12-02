const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const itemSchema = new Schema({
    itemName:{
        type:String,
        required: true,
        unique: false
    },
    itemPrice:{
        type:String,
        required: true,
    },
    itemLink:{
        type:String,
        required: true,
        // unique: true,
    },
    itemRank: {
        type: Number,
        required: false,
    },
    visibleTo:{
        type:String,
        required: true,
<<<<<<< HEAD
        unique: false,
=======
>>>>>>> b6a0dc2a62d22ce0ee4c8df0925022674eb8757e
    },
    itemImgPath:{
        type:String,
        required: true,
        default: 'itemImgPath'
    },
    itemImgName:{
        type:Date,
        required: true,
    },
<<<<<<< HEAD
    purchasedBy:{
        type:Date,
        required: true,
        default:Date.now
=======
    purchasedBy: {
        type: String,
        required: false,
        default: ''
>>>>>>> b6a0dc2a62d22ce0ee4c8df0925022674eb8757e
    },
    itemMemo:{
        type:String,
        required: true,
        // unique: true,
        default:'profileImgPath'
    },
    purchaseDate: {
        type: Date,
        required: false,
    },
    evalMemo:{
        type:String,
        required: true,
    },
    // categoryId: {
    //     type: ObjectId,
    //     required: true,
    //     ref:'Category'
    // },

});

module.exports = mongoose.model('Item', itemSchema);