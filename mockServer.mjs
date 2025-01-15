import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8080,
  host: '192.168.0.112'
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.on("close", () => {
    console.log("close")
  })

  ws.send('hello');
});
