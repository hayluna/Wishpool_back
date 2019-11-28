const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({
    groupName : {
        type: String,
        required: true,
        unique: true,
    },    
    memberId: {
        type: Array,
        required: true
    },
    userId: {
        type: String,
        required: true
    } //foreign key : userId, groupd 소유자
});

module.exports = mongoose.model('Item', groupSchema); 