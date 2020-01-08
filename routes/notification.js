var express = require('express');
var router = express.Router();

// const { verifyToken } = require('./middlewares'); 
// const { checkObjectId } = require('./middlewares'); 

var User = require('../schemas/user');
var Noti = require('../schemas/notification');

router.get('/list/:id', async(req, res, next)=>{
    const { id } = req.params;
    try {
        const notis = await Noti.findById({userId:id});
        if(notis){
            res.json({
                code: 200,
                msg: 'noti 목록 조회 성공',
                notis
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/add/:id', async(req, res, next)=>{
    const { me, other } = req.body;

    //DB알림목록에 저장
    const newNoti = {
        type: 'noti-follow',
        by: me.userName,
        userId: me._id,
        profileImgPath: me.profileImgPath,
        profileImgName : me.profileImgName,
    };
    let noti = new Noti(newNoti);
    (async()=>{
        try {
            await noti.save();
           
        } catch (e) {
            console.error(e);
            next(e);
        }
    })();
})
module.exports = router;