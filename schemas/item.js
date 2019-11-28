const mongoose = require('mongoose');

const {Schema} = mongoose;

const itemSchema = new Schema({
    itemName:{
        type:String,
        required: true,
        // unique: true,
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
    itemRank:{
        type:String,
        required: true,
    },
    visibleTo:{
        type:String,
        required: true,
        unique: false,
    },
    itemImgPath:{
        type:String,
        required: true,
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
    purchaseDate:{
        type:String,
        required: true,
        default:'profileImgName'
    },
    evalMemo:{
        type:String,
        required: true,
    },
    categoryId:{
        type:Array,
        required: false,
    },
    
});

module.exports = mongoose.model('Item', itemSchema); 