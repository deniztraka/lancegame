'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
import ServerEngine from 'lance/ServerEngine';
import Trace from 'lance/lib/Trace';
import Game from './src/common/Game';

// Game Instances
const gameEngine = new Game({ traceLevel: Trace.TRACE_ALL });
const serverEngine = new ServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });

// start the game
serverEngine.start();
