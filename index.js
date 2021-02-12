// const path = require('path');
// const express = require('express');
// const app = express();
// const socketio = require('socket.io');

// app.set('port',process.env.PORT || 7171);
// app.use(express.static(path.join(__dirname,'public')));

// const server = app.listen(app.get('port'));

// const io = socketio(server);

/**
 * npm run dev
 * 
 * 
 * 
 */

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(45174, () => { console.log('listening on *:45174'); });

const counters = io.of('/counters');

counters.on('connection',counter=>{
    console.log("nueva conexion en inventarios");

    counter.on('index',gdata=>{
        console.log(`${gdata.me.names} ${gdata.me.surname_pat} [${gdata.me.nick}] de ${gdata.workpoint.name} [${gdata.workpoint.alias}] ha ingresado al home de Inventarios`);
    });

    counter.on('joinat',gdata=>{
        let room = gdata.room;
        let user = gdata.user;

        let msg = `${user.me.names} ${user.me.surname_pat} [${user.me.nick}] de ${user.workpoint.name} [${user.workpoint.alias}]`;

        console.log(`Uniendo a sala: ${room}`);
        counter.join(room);
        console.log(`${msg} se ha unido al ROOM: ${room}`);
        counters.in(room).emit('joined',user);
    });

    counter.on('counting',gdata=>{
        let user = gdata.by;
        let product = gdata.product;
        let room = gdata.room;

        let msg = `${user.me.names} ${user.me.surname_pat} [${user.me.nick}] de ${user.workpoint.name} [${user.workpoint.alias}]`;
        console.log(`${msg} esta contando un elemento`);

        counter.broadcast.to(room).emit('counting',{by:user, product:product});
    });

    counter.on('cancelcounting',gdata=>{
        // console.log(gdata);
        let user = gdata.by;
        let product = gdata.product;
        let room = gdata.room;

        let msg = `${user.me.names} ${user.me.surname_pat} [${user.me.nick}] de ${user.workpoint.name} [${user.workpoint.alias}]`;
        console.log(`${msg} ha cancelado el conteo en el ROOM: ${room}`);
        counter.broadcast.to(room).emit('cancelcounting',{by:user, product:product});
    });

    counter.on('countingconfirmed',gdata=>{
        // console.log(gdata);
        let user = gdata.by;
        let product = gdata.product;
        let room = gdata.room;
        let settings = gdata.settings;
        let msg = `${user.me.names} ${user.me.surname_pat} [${user.me.nick}] de ${user.workpoint.name} [${user.workpoint.alias}]`;
        console.log(`${msg} ha confirmado el conteo en el ROOM: ${room}`);

        counter.broadcast.to(room).emit('countingconfirmed',{by:user, product:product, settings:settings});
    });
});


io.on('connection',(vsocket)=>{
    console.log("nueva conexion");
    console.log("ID Connection: "+vsocket.id);

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
        console.log("Se esta creando un pedido");
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