var express = require("express");
var path = require("path");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

io.set('log level',  1);

io.on('connection', function (socket) {
    socket.emit('open');

    console.log(socket.handshake);

    var client = {
        socket: socket,
        name: false,
        color: getColor()
    }

    socket.on("message", function(msg) {
        var obj = {
            time: getTime(),
            color: client.color
        };

        if(!client.name) {
            client.name = msg;
            obj['text'] = client.name;
            obj['author'] = 'System';
            obj['type'] = 'welcome';
            console.log(client.name + 'login');

            socket.emit('system', obj);
            socket.broadcast.emit('system', obj);
        } else {
            obj['text'] = msg;
            obj['author'] = client.name;
            obj['type'] = 'message';
            console.log(client.name + 'say:' + msg);

            socket.emit('message', obj);

            socket.broadcast.emit('message', obj);
        }
    });

    socket.on('disconnet', function() {
        var obj = {
            time: getTime(),
            color: client.color,
            author: 'System',
            text: client.name,
            type: 'disconnect'
        };

        socket.boradcast.emit('system', obj);
        console.log(client.name + 'disconect');
    });
});

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

var getTime = function() {
    var date = new Date();
    return date.getHours() + ":" +date.getMilliseconds() + ":" +date.getSeconds();
}

var getColor = function() {
    var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green','orange','blue','blueviolet','brown','burlywood','cadetblue'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
}
