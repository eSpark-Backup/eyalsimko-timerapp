import { WebSocketServer } from 'ws';

// *TODO Dev Note:-Mock server Ip and port should be same as the one in the connectionStore client
const wss = new WebSocketServer({
  port: 8001,
  host: '192.168.100.4'
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
