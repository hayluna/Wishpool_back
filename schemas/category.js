const mongoose = require('mongoose');

const {Schema} = mongoose;

const categorySchema = new Schema({
    
    cateName:{
        type: String, 
        required: true,
        unique: true,
        default:'기본카테고리'
    },
    
    cateDate:{
        type: Date, 
        required: false,
    },

    visibleTo:{
        type: String, 
        required: true,
        default:'f'
    },

    cateImgName:{
        type: String, 
        required: true,
    },

    cateImgPath:{
        type: String, 
        required: true,
        unique: true,
    },
    userId:{  // 유저 아이디. 참조키
        type: String, 
        required: true,
        unique: true,
    },





})