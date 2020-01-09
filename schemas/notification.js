const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const NotiSchema = new Schema({
    type: {
        type: String,
        require: true
    },
    from: {
        type:String,
        required: false,
    },
    fromObjectId:{
        type:ObjectId,
        required: false,
        ref: 'User'
    },
    to:{
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
    createdAt: {
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
        default: 'profileImgPath'
    },
    profileImgName:{
        type: String,
        required: false,
        default: 'profileImgName'
    },
    itemImgPath:{
        type: String,
        required: false,
        default: 'itemImgPath'
    },
    itemImgName:{
        type: String,
        required: false,
        default: 'itemImgName'
    }
});

module.exports = mongoose.model('Noti', NotiSchema); 