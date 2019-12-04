const jwt = require('jsonwebtoken');

// JWT 토큰 유효성 검사 공통 모듈
// 이 파일은 토큰이 발행 된 후에 클라이언트 토큰과 비교할 때 사용된다.
exports.verifyToken = (req,res,next) => {

    try{
        // jwt.verify 메소드('브라우저에서 전달되는 토큰','서버에 저장해둔 토큰발급인증키값')
        // process.env.JWT_SECRET = 서버에 저장해둔 토큰 발급인증키값
        // req.headers.authorization = 브라우저에서 전달되는 토큰

        // jwt.verify메소드는 실행 후 토큰 안의 페이로드에 저장되어 있는
        // 사용자 정보를 디코딩해서 반환한다.
        // 검사 후 반환되는 디코드된 사용자 저장값을 req.decoded에 저장한다.
        // 반환 값은 뭐지??? true/false??
        req.decoded = jwt.verify(req.headers.authorization,process.env.JWT_SECRET);
        return next();

    }catch(err){

        // 기한이 토큰인 경우(기한 지났으면 자동으로 에러발생하는거??)
        // TokenExpiredError이건 뭐지??? 어디서 정한거??
        // 클라이언트에서는 어떤 식으로 처리하는지를 봐야지 이해가 될거 같다
        if(err.name === 'TokenExpiredError'){
            return res.status(419).json({
                code:419,
                message:'기한 만료된 토큰'
            });
        }
        // 유효X인 토큰인 경우
        return res.status(401).json({
            code:401,
            message:'유효하지 않은 토큰'
        });
    }
};