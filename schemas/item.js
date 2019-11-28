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
        unique: false,
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
    purchasedBy:{
        type:Date,
        required: true,
        default:Date.now()
    },
    itemMemo:{
        type:String,
        required: true,
        // unique: true,
        default:'profileImgPath'
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    evalMemo:{
        type:String,
        required: true,
    },
    categoryId: {
        type: ObjectId,
        required: true,
        ref:'Category'
    },
});

module.exports = mongoose.model('Item', itemSchema);