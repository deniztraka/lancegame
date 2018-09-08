import TwoVector from 'lance/serialize/TwoVector';
import DynamicObject from 'lance/serialize/DynamicObject';
import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';

const PADDING = 20;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

// a game object to represent each paddle
class Paddle extends DynamicObject {}

// a game object to represent the ball
class Ball extends DynamicObject {

    get bendingMultiple() { return 0.8; }
    get bendingVelocityMultiple() { return 0; }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.velocity.set(2, 2);
    }
}

export default class Game extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });

        // common code
        this.on('postStep', this.postStepHandleBall.bind(this));

        // server-only code
        this.on('server__init', this.serverSideInit.bind(this));
        this.on('server__playerJoined', this.serverSidePlayerJoined.bind(this));
        this.on('server__playerDisconnected', this.serverSidePlayerDisconnected.bind(this));

        // client-only code
        this.on('client__init', this.clientSideInit.bind(this));
        this.on('client__draw', this.clientSideDraw.bind(this));
    }

    registerClasses(serializer) {
        serializer.registerClass(Paddle);
        serializer.registerClass(Ball);
    }

    postStepHandleBall() {
        let objects = this.world.queryObjects();
        if (objects.length !== 3) return;
        let ball = objects[0];
        let paddle1 = objects[1];
        let paddle2 = objects[2];

        // CHECK LEFT EDGE:
        if (ball.position.x <= PADDING + PADDLE_WIDTH &&
            ball.position.y >= paddle1.y && ball.position.y <= paddle1.position.y + PADDLE_HEIGHT &&
            ball.velocity.x < 0) {

            // ball moving left hit player 1 paddle
            ball.velocity.x *= -1;
            ball.position.x = PADDING + PADDLE_WIDTH + 1;
        } else if (ball.position.x <= 0) {

            // ball hit left wall
            ball.velocity.x *= -1;
            ball.position.x = 0;
            console.log(`player 2 scored`);
        }

        // CHECK RIGHT EDGE:
        if (ball.position.x >= WIDTH - PADDING - PADDLE_WIDTH &&
            ball.position.y >= paddle2.position.y && ball.position.y <= paddle2.position.y + PADDLE_HEIGHT &&
            ball.velocity.x > 0) {

            // ball moving right hits player 2 paddle
            ball.velocity.x *= -1;
            ball.position.x = WIDTH - PADDING - PADDLE_WIDTH - 1;
        } else if (ball.position.x >= WIDTH ) {

            // ball hit right wall
            ball.velocity.x *= -1;
            ball.position.x = WIDTH - 1;
            console.log(`player 1 scored`);
        }

        // ball hits top
        if (ball.position.y <= 0) {
            ball.position.y = 1;
            ball.velocity.y *= -1;
        } else if (ball.position.y >= HEIGHT) {
            // ball hits bottom
            ball.position.y = HEIGHT - 1;
            ball.velocity.y *= -1;
        }

    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);

        // get the player paddle tied to the player socket
        let playerPaddle = this.world.queryObject({ playerId });
        if (playerPaddle) {
            if (inputData.input === 'up') {
                playerPaddle.position.y -= 5;
            } else if (inputData.input === 'down') {
                playerPaddle.position.y += 5;
            }
        }
    }

    //
    // SERVER ONLY CODE
    //
    serverSideInit() {
        // keep track of connected players
        this.players = { player1: null, player2: null };

        // create the paddle objects
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(PADDING, 0), playerId: 1 }));
        this.addObjectToWorld(new Paddle(this, null, { position: new TwoVector(WIDTH - PADDING, 0), playerId: 2 }));
        this.addObjectToWorld(new Ball(this, null, { position: new TwoVector(WIDTH /2, HEIGHT / 2) }));
    }

    // attach newly connected player to next available paddle
    serverSidePlayerJoined() {
        if (this.players.player1 === null) {
            this.players.player1 = socket.id;
            this.gameEngine.paddle1.playerId = socket.playerId;
        } else if (this.players.player2 === null) {
            this.players.player2 = socket.id;
            this.gameEngine.paddle2.playerId = socket.playerId;
        }
    }

    serverSidePlayerDisconnected(ev) {
        if (this.players.player1 == ev.id) {
            this.players.player1 = null;
        } else if (this.players.player2 == ev.id) {
            this.players.player2 = null;
        }
    }


    //
    // CLIENT ONLY CODE
    //
    clientSideStart() {

        document.querySelector('body').innerHTML = `
                <div style="width: 400px; height: 400px; background: black">
                    <div style="position:absolute;width:10px;height:50px;background:white" class="paddle1"></div>
                    <div style="position:absolute;width:10px;height:50px;background:white" class="paddle2"></div>
                    <div style="position:absolute;width:5px; height:5px;background:white" class="ball"></div>
                </div>`;

        this.controls = new KeyboardControls(this);
        this.controls.bindKey('up', 'up', { repeat: true } );
        this.controls.bindKey('down', 'down', { repeat: true } );

        this.sprites = {
            '1': { el: document.querySelector('.ball') },
            '2': { el: document.querySelector('.paddle1') },
            '3': { el: document.querySelector('.paddle2') }
        };
    }

    clientSideDraw() {
        for (let objId of Object.keys(this.sprites)) {
            if (this.sprites[objId].el) {
                this.sprites[objId].el.style.top = this.gameEngine.world.objects[objId].position.y + 'px';
                this.sprites[objId].el.style.left = this.gameEngine.world.objects[objId].position.x + 'px';
            }
        }
    }
}
