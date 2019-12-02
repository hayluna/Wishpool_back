const SocketIO = require('socket.io');
const Item = require('./schemas/item');

//함수형 모듈
module.exports = (server) =>{
    const io = SocketIO(server, {path:'/socket.io'});

    io.on('connection', (socket)=>{
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);
        socket.on('disconnect', ()=>{
            console.log('클라이언트 접속 해제', ip, socket.id);
            clearInterval(socket.interval);
        });
        socket.on('error', (error)=>{
            console.error(error);
        });
        socket.on('reply', (data)=>{ //on: reply란 이름의 통신을 대기중이다
            console.log(data);
            socket.interval = setInterval(()=>{
                if(data){
                    data = false;
                }else{
                    data = true;
                }
                socket.emit('news', data);
            },3000);
        });
        socket.on('purchasedBy', (data)=>{ //on: reply란 이름의 통신을 대기중이다
            if(data === 'cancel'){
                //db에 구매한사람 정보 ''로 바꾸기
            }else{
                //db에 data(구매한사람)정보 입력
            }
        });
        socket.on('reqList', (data)=>{

            Item.find()
            .then(items=>{
                socket.emit('resList', items);
            })
            .catch(e=>{
                console.error(e);
            })
            
        });
        
        // socket.on('loadList', (data)=>{
        //     socket.
        // })
        
    })
}