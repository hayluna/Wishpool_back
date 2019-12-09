
var express = require('express');
var router = express.Router();

// const { verifyToken } = require('./middlewares'); 
// const { checkObjectId } = require('./middlewares'); 

var User = require('../schemas/user');

//(혜은) follow리스트 조회용
router.get('/list/:id', async(req,res,next)=>{
    const { id } = req.params;
    console.log('팔로우 목록조회', id);
    try {
      let user = await User.findById(id).populate('followingId').populate('followerId').exec();
      console.log(user);
      if(user){
        res.json({
          code: 200,
          msg: '회원 및 팔로우 정보 조회 성공',
          user
        });
      }else{
        res.json({
          code: 503, //내가 만든 커스텀 코드번호. 팔로우/팔로잉 내역이 없을 때 사용.
          msg: '팔로우/팔로잉 내역이 없습니다.',
        })
      }
    } catch (e) {
        console.error(e);
        next(e)
    }
  })

  router.get('/searchId/:id', async(req,res,next)=>{
      const { id } = req.params;
    //id값으로 찾고, 있으면 리턴, 없으면
    try {
        let matchUsers = await User.find({userId: {$regex : '.*'+id+'.*'}}).populate('followingId').populate('followerId').exec();
        if(matchUsers.length != 0){
            console.log(matchUsers);
            res.json({
                code: 200,
                msg: '일치하는 사용자를 찾았습니다',
                matchUsers
            });
        }else{
            res.json({
                code: 503,
                msg: '일치하는 사용자가 없습니다.'
            })
        }
    } catch (e) {
        console.error(e);
    }
  });

  router.get('/searchPhone/:id', async(req,res,next)=>{
    const { id } = req.params;
  //id값으로 찾고, 있으면 리턴, 없으면
  console.log('search', id);
  try {
      let matchUsers = await User.find({phone: {$regex : '.*'+id+'.*'}});
      if(matchUsers.length != 0){
          console.log(matchUsers);
          res.json({
              code: 200,
              msg: '일치하는 사용자를 찾았습니다',
              matchUsers
          });
      }else{
          res.json({
              code: 503,
              msg: '일치하는 사용자가 없습니다.'
          })
      }
  } catch (e) {
      console.error(e);
  }

});

router.patch('/add/:id', async function(req, res, next){
  //:id : 내가 팔로우하려는 아디
  //req.body : 나의 유저객체
  console.log('ppp'+req.body.selfUser.followingId.length);
  console.log('ppp'+req.body.followUser.followerId.length);
  try{
      //내 팔로잉 목록이 갱신된 객체로 덮어쓰기
      const { id } = req.params;
      const { selfUser, followUser } = req.body; //프론트에서 넘어온 갱신된 유저 객체들
      
      //내가 팔로잉하는 상대의 팔로워목록이 갱신된 객체로 덮어쓰기
      const followingUser = await User.findByIdAndUpdate(followUser._id, followUser, {new:true}).exec();
      console.log('2', followingUser);
      
      const user = await User.findByIdAndUpdate(id, selfUser, {new: true}).populate('followingId').populate('followerId').exec();
      //new:true를 설정해야 업데이트 된 객체를 반환
      //설정하지 않으면 업데이트 되기 전의 객체를 반환
      console.log('1', user);

      if(user&&followingUser){
        res.status(201).json({
          code: 200,
          msg: '팔로우 추가 성공',
          user,
          followingUser
        });
      }else{
        res.json({
          code: 503,
          msg: '찾는 사용자가 없습니다.',
        })
      }
  }catch(e){
      console.error(e);
      next(e);
  }
});

  module.exports = router;