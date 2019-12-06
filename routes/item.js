var express = require('express');
var router = express.Router();

var Item = require('../schemas/item');

router.get('/', function (req, res, next) {
  // User.find({})
  //   .then((users) => {
  //     res.render('mongoose', { users });
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     next(err);
  //   });
});

//itemList.vue의 items에 넣을 내용
router.get('/list', function(req, res, next) {
    Item.find()
    .then(items=>{
        res.json(items);
    })
    .catch(e=>{
        console.error(e);
    })
});

//detail:id
//itemDetail.vue의 각 페이지 item에 들어갈 내용
router.get('/detail/:id', function(req, res, next){
    Item.findOne({ _id: req.params.id }).populate('categoryId')
    .then(item=>{
        res.json(item)
    })
    .catch(e=>{
        console.error(e);
        next(e);
    })
});

//modify:id
//itemModify.vue의 각 페이지 item에 들어갈 내용
router.get('/modify/:id', function(req, res, next){
    Item.findOne({ _id: req.params.id }).populate('categoryId')
    .then(item=>{
        res.json(item)
    })
    .catch(e=>{
        console.error(e);
        next(e);
    })
});

//modify:id
//itemModify.vue에서 변경된 내용 DB에 수정반영하기
router.patch('/modify/:id', function(req, res, next){
    console.log('patch\n');
    //카테고리는 나중에 구현
    const item = {
        itemName: req.body.itemName,
        itemPrice: req.body.itemPrice,
        itemLink: req.body.itemLink,
        itemRank: req.body.itemRank,
        visibleTo: req.body.visibleTo,
        itemMemo: req.body.itemMemo,
        purchasedBy : req.body.purchasedBy
        // categoryId: 1
    };
    console.log(item);
   Item.findOneAndUpdate({ _id:req.body._id }, {
        $set: item
    },
    {new:true})
    // .then(result=>{
    //     return Item.populate(result, { path: 'categoryId'});
    // })
    .then(result=>{
        console.log("여기!"+ result);
        res.status(201).json({
            code: 200,
            msg: '아이템 수정 성공',
            item: result
        });
    })
    .catch(e=>{
        console.error(e);
        next(e);
    });
});

router.delete('/detail/:id', function(req, res, next){
    const { id } = req.params;
    Item.findByIdAndRemove(id).exec()
    .then(result=>{
        res.status(204).json({
            code: 204,
            msg: '아이템 삭제 성공'
        });
    }).catch(e=>{
        console.error(e);
        next(e);
    })
});
//itemAdd.vue에서 생성된 내용 DB에 저장하기
router.post('/add', function(req, res, next){
    console.log('아이템 추가 요청'+req.body);

    //카테고리는 나중에 구현
    const item = new Item({
        itemName: req.body.itemName,
        itemPrice: req.body.itemPrice,
        itemLink: req.body.itemLink,
        itemRank: req.body.itemRank,
        visibleTo: req.body.visibleTo,
        itemMemo: req.body.itemMemo,
        // categoryId: 1
    });
    console.log(item);
    item.save()
    .then(result=>{
        return Item.populate(result, { path: 'categoryId'});
    })
    .then(result=>{
        res.status(201).json({
            code: 200,
            msg: '아이템 저장 성공'
        });
    })
    .catch(e=>{
        console.error(e);
        next(e);
    });

});



module.exports = router;