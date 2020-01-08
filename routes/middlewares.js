const jwt = require('jsonwebtoken');
var User = require('../schemas/user');

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        try{
            req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
            return next();
        }catch(e){
            console.error(e);
        }
    }else{
        res.json({
            code: 403,
            message: '로그인 되어있지 않습니다. 로그인이 필요합니다.'
        })
    }
};

exports.verifyToken = (req,res,next) => {
    try{
        req.decoded = jwt.verify(req.headers.authorization,process.env.JWT_SECRET);
        // console.log('결과:',req.decoded);
        // //토큰의 남은 유효기간이 3.5일 미만이면 재발급
        // const now = Math.floor(Date.now() / 1000);
        // if(decoded.exp - now < 60 * 60 * 24 * 3.5){
        //     const user = await User.findById(decoded._id);
        //     const token = user.generateToken();

        // }
        return next();
    }catch(err){
        // 만료된 토큰인 경우
         if(err.name === 'TokenExpiredError'){
            // return res.status(419).json({
            return res.json({
                code:419,
                message:'인증 토큰이 만료되었습니다.'
            });
        }
        // 토큰이 유효하지 않은 경우
        return res.json({
            code:401,
            message:'유효하지 않은 토큰입니다.'
        });
        
    }
};

const { ObjectId } = require('mongoose').Types;

exports.checkObjectId = (req, res, next)=>{
    const { id } = req.params;

    //검증 실패
    if(!ObjectId.isValid(id)){
        res.status = 400;
        return null;
    }
    return next();
}