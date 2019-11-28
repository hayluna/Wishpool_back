// router.get('/', function (req, res, next) {
//     User.find({})
//       .then((users) => {
//         res.json(users);
//       })
//       .catch((err) => {
//         console.error(err);
//         next(err);
//       });
//   });

//   router.post('/',function(req,res,next){

//     User.create({
//         userId:req.body.email,
//         userName:req.body.userpwd,
//         email:req.body.nickname,
//         password:'local',
//         phone:req.body.snsid,
//         nickName:req.body.username,
//         birth:req.body.telephone,
//         entryDate:'sample.png',
//         profileImgPath:'127.0.0.1',
//         profileImgName:'u',
//         profileMsg:'a',
//         followingId:,
//         followerId: ,
//         entryType
//         userState
//         createdAt
//         deleteAt

//     })
//     .then((result) =>{
//       console.log(result);
//       res.status(201).json(result);
//     })
//     .catch((err) => {
//       console.error(err);
//       next(err);
//     })
  
//   });
  