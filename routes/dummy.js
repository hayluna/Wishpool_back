//테스트용 더미데이터 만드는 임시 파일
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var User = require('../schemas/user');
var Item = require('../schemas/item');

//각 유저에게 아이템 10개씩 생성 call
//생성 후 주석처리.
router.get('/', async(req,res,next)=>{
    try{
        let users = await User.find().exec();
        console.log(users.length);
        let visibleTo = true;
        for(var j=0;j<users.length;j++){
            for(var i=0;i<10;i++){
                let itemName = users[j].userId+'-'+'아이템 '+(i+1);
                let userId = users[j]._id;
                visibleTo = !visibleTo;
                let newItem = {
                    itemName,
                    userId,
                    visibleTo
                }
                console.log(newItem);
                let item = await new Item(newItem);
                
                await item.save();
            }
        }
        let items = await Item.find().exec();
        res.json(items);
    }catch(e){
        console.error(e);
    }
   
});
//프로필 사진 임시로 추가
router.get('/photo', async(req,res,next)=>{
    try {
        let users = await User.find().exec();
        console.log(users.length);
        for(var i=0; i< users.length;i++){
            const id = users[i]._id;
            if(i<9){
                users[i].profileImgPath = '/assets/samples/avatar-0'+(i+1)+'.jpg';
            }else{
                users[i].profileImgPath = '/assets/samples/avatar-'+(i+1)+'.jpg';
            }
            const user = await User.findByIdAndUpdate(id, users[i], {new: true}).exec();
            console.log('여기',user);
        }
    } catch (e) {
        console.error(e);
    }
})

router.get('/pwd', async(req,res,next)=>{
//dummy데이터 비번 암호화. 비번은 모두 1234로 동일.

    try{
        let users = await User.find(null, '_id password');
        console.log(users);
        users.forEach(async user=>{
            let pwd = await bcrypt.hashSync(user.password, 12);
            let newUser = await User.findByIdAndUpdate(user._id, {password: pwd}, {new:true});
            console.log('오이오이', newUser);
        })
    }catch(e){
        console.error(e);
    }
    
})
module.exports = router;