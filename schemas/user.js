const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

// 모델을 만드는 이유
// 몽고DB를 사용하지만 RDB처럼 데이터구조를 잡아놓고, 표현
// 직접 던져줘도 되지만, 일반적인 ORM인 방식으로 구현
// 모델 1. 데이터를 저장하는 그릇의 역할
// 모델 2. 데이터를 담아 옮겨다니는 역할
// 이 userSchema객체를 이용해 find, update, insert 등을 실행할 수 있다. 자바스크립트 프로그래밍적으로 유용

//사용자 콜렉션 구조 모델 구현
const UserSchema = new Schema({
    userId:{
        type:String,
        required: true,
        unique: true,
    },
    username:{
        type:String,
        required: false,
    },
    email:{
        type:String,
        required: false,
        // unique: true, //테스트를 위해 잠시 주석처리. 꼭해제할것
    },
    hashedPassword:{
        type:String,
        required: true,
    },
    phone:{
        type:String,
        required: true,
        // unique: true, //테스트를 위해 잠시 주석처리. 꼭 해제할것
    },
    nickname:{
        type:String,
        required: false,
    },
    address:{
        type:String,
        required: false,
    },
    birth:{
        type:Date,
        required: false,
    },
    profileImgPath:{
        type:String,
        required: false,
        unique: false,
    },
    profileImgName:{
        type:String,
        required: false,
    },
    profileMsg:{
        type:String,
        required: false,
    },
    followingId:[{
        type: ObjectId,
        ref: 'User',
        unique: false
    }],
    followerId:[{
        type: ObjectId,
        ref: 'User',
        unique: false,
    }],
    entryType:{
        type:String,
        required: false,
    },
    userState:{
        type:Boolean,
        required: false,
        default: true
    },
    createdAt:{
        type:Date,
        required: false,
        default: Date.now,
    },
    deleteAt:{
        type:Date,
        required: false,
    }
});

UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function(password){
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result;
};

UserSchema.methods.serialize = function(){
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
}

UserSchema.methods.generateToken = function(){
    const token = jwt.sign({
        _id: this.id,
        username: this.username
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '7d', //7일동안 유효
    },
);
  return token;  
};

UserSchema.statics.findByUserId = function(userId){
    return this.findOne({ userId });
};

module.exports = mongoose.model('User', UserSchema); //User객체이름으로  userSchema라는 모델구조를 매핑해줌.
//index.js에서 매핑했지만, 몽구스에서는 여기서 해줌