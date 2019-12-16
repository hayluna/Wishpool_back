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
        s.connectedClients[socket.id]={id:socket.id};
        io.sockets.emit('giveSid', socket.id);
        
        socket.on('follow-add', (data)=>{
            console.log(data.follower+", "+data.followed);
            socket.emit('follow-noti');
        });
        
    })
}