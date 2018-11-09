import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './dist/index.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
import WiggleServerEngine from './src/server/WiggleServerEngine';
import WiggleGameEngine from './src/common/WiggleGameEngine';
import Trace from 'lance/lib/Trace';

// Game Instances
const gameEngine = new WiggleGameEngine({ traceLevel: Trace.TRACE_ALL });
const serverEngine = new WiggleServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });

// start the game
serverEngine.start();
