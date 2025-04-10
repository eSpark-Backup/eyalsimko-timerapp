import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8080,
  host: '192.168.1.2'
});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const dataStr = Buffer.from(data).toString()
    if (dataStr === "shutdown") {
      console.log("shutdown")
      return ws.close()
    }

    console.log('received: %s', data, dataStr);
  });

  ws.on("close", () => {
    console.log("close")
  })

  ws.send('hello');
});
