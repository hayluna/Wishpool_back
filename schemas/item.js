const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema({
    itemName: {
        type: String,
        required: true,
    },
    itemPrice: {
        type: Number,
        required: false,
    },
    itemLink: {
        type: String,
        required: false,
    },
    itemRank: {
        type: Number,
        required : false,
    },
    visibleTo: {
        type: String,
        required: true,
        default: 'f'
    },
    itemImgPath: {
        type: String,
        required: true,
        default: 'itemImgPath',
    },
    itemImgName: {
        type: String,
        required: true,
        default: 'itemImgName'
    },
    purchasedBy: {
        type: String,
        required: false,
    },
    itemMemo: {
        type: String,
        required: false,
    },
    purchaseDate: {
        type: Date,
        required: false,
    },
    evalMemo: {
        type: String,
        required: false,
    },
    categoryId:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Item', itemSchema); 