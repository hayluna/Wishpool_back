const jwt = require('jsonwebtoken');
exports.verifyToken = (req,res,next) => {

    try{
        req.decoded = jwt.verify(req.headers.authorization,process.env.JWT_SECRET);
        return next();

    }catch(err){
        // 만료된 토큰인 경우
         if(err.name === 'TokenExpiredError'){
            return res.status(419).json({
                code:419,
                message:'기한 만료된 토큰'
            });
        }
        // 유효하지 않인 토큰인 경우
        return res.status(401).json({
            code:401,
            message:'유효하지 않은 토큰'
        });
    }
};