const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const itemSchema = new Schema({
    itemName: {
        type: String,
        required: true,
        unique: false
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
        required: false,
    },
    visibleTo: {
        type: String,
        required: true,
    },
    itemImgPath: {
        type: String,
        required: true,
        default: 'itemImgPath'
    },
    itemImgName: {
        type: String,
        required: true,
        default: 'itemImgName'
    },
    purchasedBy: {
        type: String,
        required: false,
        default: ''
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
    createdAt:{
        type:Date,
        required: false,
        default: Date.now,
    },
    deleteAt:{
        type:Date,
        required: false,
    },
    //수정 - 카테고리 없앴으니까 item이랑 user랑 연결되어야 한다.
    userId:{
        type:ObjectId,
        required: true,
        ref: 'User'
    }
    // categoryId: {
    //     type: ObjectId,
    //     required: true,
    //     ref:'Category'
    // },

});

module.exports = mongoose.model('Item', itemSchema);