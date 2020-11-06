// const path = require('path');
// const express = require('express');
// const app = express();
// const socketio = require('socket.io');

// app.set('port',process.env.PORT || 7171);
// app.use(express.static(path.join(__dirname,'public')));

// const server = app.listen(app.get('port'));

// const io = socketio(server);

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(7171, () => { console.log('listening on *:7171'); });

io.on('connection',(vsocket)=>{
    console.log("nueva conexion");

    vsocket.on('dashboard_ready',(data)=>{
        console.log(`El dashboard de ${data.workpoint.alias} esta activo por ${data.me.nick}`);
        vsocket.broadcast.emit('dashboard_ready',data);
    });

    vsocket.on('joinme_to_dashboard',(gdata)=>{
        let notify = `${gdata.me.nick} de ${gdata.workpoint.alias} se ha unido`;
        let sdata = {msg:notify};
        console.log(sdata.msg);
        vsocket.broadcast.emit('joined_at_dashboard',sdata);
    });

    vsocket.on('creatingorder',gdata=>{
        console.log(gdata);
        vsocket.broadcast.emit('creatingorder',gdata);
    });

    vsocket.on('order_changestate',gdata=>{
        console.log("actualizando pedido...");
        console.log(`${gdata.profile.me.nick} de ${gdata.profile.workpoint.alias} ha cambiado el status de la orden ${gdata.order.id} a ${gdata.state.id} (${gdata.state.name})`);
        vsocket.broadcast.emit('order_changestate',gdata);
    });

    vsocket.on('using_order',gdata=>{
        console.log(`${gdata.profile.me.nick} abrio la orden ${gdata.order.id}`);
        vsocket.broadcast.emit('using_order', gdata);
    });
});