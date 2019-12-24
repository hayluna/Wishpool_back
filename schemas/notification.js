const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const notiSchema = new Schema({
    type: {
        type: String,
        require: true
    },
    by: {
        type:String,
        required: true,
    },
    userId:{
        type:ObjectId,
        reqruied: false,
        ref: 'User'
    },
    itemId:{
        type:ObjectId,
        required: false,
        ref: 'Item'
    },
    itemName: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
    haveRead:{
        type: Boolean,
        default: false
    },
    profileImgPath:{
        type: String,
        required: false,
        default: 'itemImgPath'
    },
    itemImgPath:{
        type: String,
        required: false,
        default: 'itemImgPath'
    }
});

module.exports = mongoose.model('Noti', notiSchema); 