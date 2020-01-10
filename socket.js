const SocketIO = require('socket.io');
const Item = require('./schemas/item');
const Noti = require('./schemas/notification');

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

//함수형 모듈
module.exports = (server, connectedClients) =>{
    const io = SocketIO(server, {path:'/socket.io'});
    
    
    io.on('connection', (socket)=>{
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);
        
        //클라이언트가 웹소켓 연결을 끊었을 때, 현재 연결 중 클라이언트 목록인 connectedClients에서 삭제해야한다.
        socket.on('disconnect', ()=>{
            console.log('클라이언트 접속 해제', ip, socket.id);
            console.log(connectedClients);
            const key = getKeyByValue(connectedClients, socket.id);
            console.log(key);
            if(key){
                console.log(key+'를 연결목록에서 삭제합니다.');
                delete connectedClients.key;
            }
        });

        //웹소캣 연결 중 문제가 생겼을 때
        socket.on('error', (error)=>{
            console.error(error);
        });

        //웹소켓이 연결되면,
        //1. 클라이언트에 socket의 id를 보낸다.
        socket.emit('sid', socket.id);
        //2-1. 클라이언트에서 사용자의 uid(DB User의 _id해시값)을 받는다.
        //2-2. uid를 소켓 전역객체의 connectedClient의 키로 삼고, 값으로 socket.id값을 넣어 uid가 있다면 소켓아이디를 조회가능하도록 한다.
        socket.on('uid', uid=>{
            if(uid){
                connectedClients[uid]= socket.id;
            }
            console.log('\n\n\n연결된 클라이언트 목록',connectedClients);
            // socket.emit('confirmConnection', connectedClients);
        })      

        //팔로잉이 발생하면,
        socket.on('follow-add', (data)=>{
            //1. 클라이언트로부터 data(user정보)를 받는다.
            //2. 받은 user정보의 _id값으로 현재 connectedClients인지 확인한다.
            const { me, other } = data;
            console.log('\n\n\n팔로잉발생. 현재 연결된 클라이언트들', connectedClients)
            if(connectedClients[other._id]){ // 현재 connectedClient가 맞다면,
                console.log('*****사용자가 있습니다.', (connectedClients[other._id]));
                //해당 사용자의 socket.id에게 to메소드를 보낸다.
                try {
                    const newFollowNoti = {
                        type: 'noti-follow',
                        by: me.nickname,
                        userId: me._id,
                        profileImgPath: me.profileImgPath,
                        profileImgName : me.profileImgName,
                    };
                    socket.to(connectedClients[other._id]).emit('noti-fired'); //알림목록에 follow-noti를 발생시키는 이벤트 발생
                } catch (e) {
                    console.error(e);
                }
                // socket.to(connectedClients[data.other._id]).emit('increase-noti'); //클라이언트의 noti갯수를 늘리라는 이벤트 발생
                // socket.to(connectedClients[data.other._id]).emit('add-follower', user);
            }else{
                console.error('해당사용자가 없습니다.');
            }
        });

        socket.on('follow-remove', (data)=>{
            const { user, followUser } = data;
            if(connectedClients[followUser._id]){
                socket.to(connectedClients[followUser._id]).emit('remove-follower', user);
            }
        });

        socket.on('remove-noti', id=>{
            (async()=>{
                try{
                    await Noti.findByIdAndRemove(id).exec();
                    try{
                        const notis = await Noti.find().exec();
                        socket.emit('update-noti', notis);
                    }catch(e){
                        console.error(e);
                        next(e);
                    }   
                }catch(e){
                    console.error(e);
                    next(e); 
                }
                
            })();
        });

        socket.on('request-noti', async()=>{
            try{
                const notis = await Noti.find().exec();
                socket.emit('response-noti', notis);
            }catch(e){
                console.error(e);
                next(e);
            }   
        })
        
    })
}