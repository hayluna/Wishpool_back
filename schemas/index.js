const mongoose = require('mongoose');

module.exports = () =>{
    //몽고 db 연결 설정
    const connect = () =>{
        if(process.env.NODE_ENV !== 'production'){
            mongoose.set('debug', true); // production 모드가 아니면 디버깅 가능하게 설정
        }

        mongoose.connect('mongodb://localhost:27017',{
            dbName: 'wishlistDB',
        },(error)=>{
            if(error){
                console.error('몽고 디비 연결에러', error);
            }else{
                console.log('몽고디비 연결성공');
            }
        });
    };
    
    connect();

    //연결에 에러가 발생하면,
    mongoose.connection.on('error', (error)=>{
        console.error('몽고디비 연결에러', error);
    });
    
    //연결이 끊어진 이벤트가 발생하면,
    mongoose.connection.on('disconnected', (error)=>{
        console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다.');
        connect();
    });

    require('./item');
    require('./user'); // == userSchema
    require('./category');
    require('./group');
}