var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isLoggedIn } = require('./middlewares');
const nodemailer = require('nodemailer');
const Joi = require('joi');

var User = require('../schemas/user');
//이미지 업로드용 모듈
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
const azureStorage = require('azure-storage');
const getStream = require('into-stream');

// production모드가 아닐 때 dotenv모듈을 통해 환경변수 읽어들인다.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
//blob관련 클래스
const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY); 

//이미지 업로드용 함수들
uploadFileToBlob = async (directoryPath, file) => {
 
    return new Promise((resolve, reject) => {
 
        const blobName = getBlobName(file.originalname);
        const stream = getStream(file.buffer);
        const streamLength = file.buffer.length;
        // const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY); 
        blobService.createBlockBlobFromStream('images', `${directoryPath}/${blobName}`, stream, streamLength, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ filename: blobName, 
                    originalname: file.originalname, 
                    size: streamLength, 
                    path: `images/${directoryPath}/${blobName}`,
                    url: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/images/${directoryPath}/${blobName}` });
            }
        });
 
    });
 
};
 
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

router.get('/', (req, res, next) => {
  User.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

// 회원가입
// 회원 가입과 동시에 로그인하게끔 처리
router.post('/register', async (req, res, next) => {
  // Request Body 검증하기
  const schema = Joi.object().keys({
    userId: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required(),
    password: Joi.string().required(),
    phone: Joi.string().allow(''),
    nickname: Joi.string().allow(''),
    address: Joi.string().allow(''),
    profileImgPath: Joi.string().allow(''),
    profileImgName: Joi.string().allow(''),
    profileMsg: Joi.string().allow(''),
    followingId: Joi.array().allow(''),
    followerId: Joi.array().allow(''),
    email: Joi.string().allow(''),
    entryType: Joi.string().allow('')
  });
  const result = Joi.validate(req.body, schema);
  if(result.error){
    console.log(result.error);
    return res.json({
      code: 400,
      msg: '유효하지 않은 가입입니다. 다시 시도하세요.'
    })
  }

  const { userId, password, phone, nickname, address, entryType } = req.body;
  try {
    // userId가 이미 존재하는지 확인
    const exists = await User.findByUserId(userId);
    if(exists){
      return res.json({
        code: 409,
        msg: '이미 존재하는 사용자 입니다. 다른 아이디를 입력해주세요'
      })
    }
    const user = new User({ userId, phone, nickname, address, entryType });
    await user.setPassword(password); //비밀번호 hash화 설정
    await user.save(); // DB에 저장

    //바로 로그인처리
    const token = user.generateToken();
    const payload ={
      newUser: user.serialize(), //응답할 데이터에서 hashedPassword필드 제거
      token
    };
    
    res.json({
      code: 200,
      msg: '회원가입 성공',
      payload
    })
  } catch (e) {
    console.error(e);
    next(e);
  }
});

//(혜은) 회원가입 테스트용
router.post('/temp', async (req, res, next) => {
  console.log(req.body);
  let user = new User(req.body);
  try {
    await user.save();
    res.json({
      code: 200,
      msg: '회원 저장성공',
    })
  } catch (e) {
    console.error(e);
    next(e);
  }
});

//(혜은) follow리스트 조회용
router.get('/list/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    let user = await User.findById(id).populate('followingId').populate('followerId').exec();
    console.log(user);
    if (user) {
      res.json({
        code: 200,
        msg: '회원 및 팔로우 정보 조회 성공',
        user
      });
    } else {
      res.json({
        code: 500,
        msg: '회원 및 팔로우 정보 조회 불가'
      })
    }
  } catch (e) {
    console.error(e);
  }
})


// 로그인 처리
router.post('/login', async (req, res, next) => {
  const { userId, password } = req.body;
  // userId, password가 없으면 에러 처리
  if(!userId || !password){
    return res.json({
      code: 401,
      msg: 'id 혹은 password를 입력하지 않으셨습니다.'
    });
  }

  try {
    const user = await User.findByUserId(userId);
    //계정이 존재하지 않으면 에러처리
    if(!user){
      return res.json({
        code: 401,
        msg: '계정이 존재하지 않습니다.'
      });
    }
    const valid = await user.checkPassword(password);
    //잘못된 비밀번호
    if(!valid){
      return res.json({
        code: 402,
        msg: '비밀번호가 일치하지 않습니다.'
      });
    }
    
    const token = user.generateToken();
    user.serialize();
    const payload ={
      user: user.serialize(),
      token
    }
    res.json({
      code: 200,
      msg : '로그인에 성공하였습니다.',
      payload
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});


//(혜은) 회원 프로필정보 조회
router.get('/profile/:id', async(req,res,next)=>{
  const { id } = req.params;
  try{
    let user = await User.findOne({_id:id});
    if(user){
      res.json({
        code: 200,
        msg: '일치하는 사용자프로필을 찾았습니다.',
        user
      })
    }else{
      res.json({
        code: 503,
        msg: '일치하는 사용자가 없습니다.',
      })
    }
  }catch(e){
    console.error(e);
    next(e);
  }
    
})

// 회원 정보 조회
router.get('/profile', verifyToken, (req, res) => {
  const userId = req.decoded.userId;
  console.log('호출');
  User.findOne({
    userId: userId
  }, (err, user) => {
    if (err) {
      console.error('에러발생');
      return res.status(500).json({ code: 500, message: '서버에러' });
    }

    if (user) {
      console.log(user);
      return res.json({ code: 200, result: user });
    } else {
      return res.json({ code: 500, message: '유효하지 않은 회원입니다' });
    }
  })
})

//modify:id
router.patch('/profile/modify/:id', singleFileUpload.single('thumbnail'), async function(req, res, next){
  let image = null;
  try{
    if(req.file){
      image = await uploadFileToBlob('users', req.file); // images is a directory in the Azure container
    }
  }catch (error) {
      console.error(error);
  }
  if(image){
    req.body.profileImgPath = image.url;
    req.body.profileImgName = image.filename;
  }

  const { id } = req.params;
  try{
      //findByIdAndUpdate는 조건식 주지 않고, id값만 첫번재 파라미터로 주면, 해당 객체를 반환해준다.
      const newUser = await User.findByIdAndUpdate(id, req.body, {new: true}).exec();
      //new:true를 설정해야 업데이트 된 객체를 반환
      //설정하지 않으면 업데이트 되기 전의 객체를 반환
      
      await blobService.deleteBlobIfExists('images', `users/${req.body.prevImgName}`,function(error, result){
        if(error){
            console.error('blob삭제 실패');
        }else{
            // console.log('blob 삭제 성공')
        }
    });
      if(newUser){
        return res.json({
          code: 200,
          msg: '회원 프로필 정보 수정 성공',
          newUser
        });
      }else{
        return res.json({
          code: 500,
          msg: '회원 프로필 정보 수정 실패'
        })
      }
  }catch(e){
      console.error(e);
      next(e);
  }
});

// 로그아웃
router.get('/logout', verifyToken, (req, res) => {
  console.log('호출');
  console.log(req.decoded);
  const userId = req.decoded.userId;

  User.findOne({
    userId: userId
  }, (err, user) => {

    if (err) {
      console.error('에러발생');
      return res.status(500).json({ code: 500, message: '서버에러' });
    }
    return res.json({ code: 200, result: '로그아웃' });
  })
}
)

// 이메일 전송 테스트용 
router.post("/mail", function (req, res, next) {
  let email = req.body.email;
  console.log('email:'+email);

  User.findOne({ email: email, userState: true }, (err, user) => {
    if (err) {
      console.error(err);
    }

    if (user) {
      const token = jwt.sign({
        email: email,
      }, process.env.JWT_SECRET, {
        expiresIn: '1d',
        issuer: 'wishlist'
      });

      // 이메일 발송 객체를 생성
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'wishlistunicorn@gmail.com',  // wishlist 이메일 계정
          pass: 'unicornstore'          // wishlist 이메일 계정의 비밀번호(나중에 이 부분 빼기)
        }
      });

      let mailOptions = {
        from: 'wishlistunicorn@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: email,                     // 수신 메일 주소
        subject: 'wishlist 회원 비밀번호 변경',   // 제목
        html: `<p>비밀 번호를 재설정 하기 위해 아래의 링크를 클릭해주세요.
                아래 링크는 하루 동안 유효합니다.</p>` +
          "<a href='http://localhost:8080/user/auth/" + token + "'>인증하기</a>"
      };
      // 메일을 발송
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        }
        else {
          console.log('Email sent: ' + info.response);
          return res.json({ code: 200, result: '비밀번호 재설정 메일 전송' });
        }
      });
    } else {
      console.log('존재하지 않는 회원');
      return res.json({ code: 500, result: '존재하지 않는 회원' });
    }
  })
})



// 비밀번호 수정(이메일에서 호출)
router.patch('/resetPwd', verifyToken, (req, res) => {
  // const password = req.body.password;
  
  const email = req.decoded.email;
  console.log('email=' + email);

  const hash = bcrypt.hashSync(req.body.password, 12);
  User.findOne({ email: email, userState: true }, (err, user) => {
    console.log('email!');
    if (err) {
      console.error('에러발생');
      next(err);
    }
    if (user) {
      User.update(
        { email: email }, { password: hash }, (err, user) => {
          if (err) {
            console.error(err);
          }
          console.log('비밀번호 변경 완료');
          return res.json({ code: 200, result: '비밀번호 변경 완료' });
        })
      }
  })
})



// 회원탈퇴
router.patch('/deleteAccount', verifyToken, (req, res) => {
  const userId = req.decoded.userId;
  User.update(
    { userId: userId }, { userState: false }, (err, user) => {
      if (err) {
        console.error(err);
      }
      console.log(userId + '님이 탈퇴하셨습니다.');
      return res.json({ code: 200, result: '탈퇴 완료' });

    })

})

router.get('/check', verifyToken, async (req,res,next)=>{
  //여기까지 넘어왔다면, 인증된 사용자
  //decoded의 값으로 user에서 _id값 찾아 보내준다.
  console.log(req.decoded);
  try {
    const data = await User.findById({_id:req.decoded._id});
    const user = data.serialize();
    console.log('user', user);
    if(!user){
      return res.json({
        code: 401,
        msg: '로그인이 유효하지 않습니다.'
      });
    }
    res.json({
      code: 200,
      msg: '로그인이 유효한 사용자입니다.',
      user
    });
  } catch (e) {
    console.error(e);
    next(e)
  }
});

//
router.get('/loginInfo/:id', async (req, res)=>{
  const { id } = req.params;
  const user = await User.findOne({userId:id}, '_id').exec();
  console.log(user);
  if(user){
    res.json({
      code: 200,
      _id: user._id
    })
  }

})
module.exports = router;
