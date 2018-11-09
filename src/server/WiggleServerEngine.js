import ServerEngine from 'lance/ServerEngine';
import TwoVector from 'lance/serialize/TwoVector';
import Wiggle from '../common/Wiggle';
import Food from '../common/Food';

export default class WiggleServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.gameEngine.on('postStep', this.stepLogic.bind(this));
    }

    start() {
        super.start();
        for (let f = 0; f < this.gameEngine.foodCount; f++) {
            let newF = new Food(this.gameEngine, null, { position: this.gameEngine.randPos() });
            this.gameEngine.addObjectToWorld(newF);
        }
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let player = new Wiggle(this.gameEngine, null, { position: this.gameEngine.randPos() });
        player.direction = 'up';
        player.bodyParts = [];
        for (let i = 0; i < this.gameEngine.startBodyLength; i++) player.bodyParts.push('right');
        player.playerId = socket.playerId;
        this.gameEngine.addObjectToWorld(player);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        let playerObj = this.gameEngine.world.queryObjects({ playerId });
        this.gameEngine.removeObjectFromWorld(playerObj);
    }

    wiggleEatFood(w, f) {
        if (!(f.id in this.gameEngine.world.objects))
            return;

        w.grow = true;
        this.gameEngine.removeObjectFromWorld(f);
        let newF = new Food(this.gameEngine, null, { position: this.gameEngine.randPos() });
        this.gameEngine.addObjectToWorld(newF);
    }

    stepLogic() {
        let wiggles = this.gameEngine.world.queryObjects({ instanceType: Wiggle });
        let foodObjects = this.gameEngine.world.queryObjects({ instanceType: Food });
        for (let w of wiggles) {
            for (let f of foodObjects) {
                let distance = w.position.clone().subtract(f.position);
                if (distance.length() < this.gameEngine.eatDistance) {
                    this.wiggleEatFood(w, f);
                }
            }
        }
    }
}
