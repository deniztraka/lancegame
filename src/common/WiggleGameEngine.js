'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import Wiggle from './Wiggle';
import Food from './Food';

export default class WiggleGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
        this.on('preStep', this.moveAll.bind(this));

        // game variables
        Object.assign(this, {
            foodRadius: 0.2, headRadius: 0.4, bodyRadius: 0.3, spaceWidth: 16, spaceHeight: 9
        });
    }

    registerClasses(serializer) {
        serializer.registerClass(Wiggle);
        serializer.registerClass(Food);
    }

    start() {
        super.start();
    }

    randomInt(max) {
        return Math.floor(Math.random() * max);
    }

    moveAll() {
        this.world.forEachObject((id, obj) => {
            if (obj instanceof Wiggle) {
                switch (obj.direction) {
                case 'up':
                    obj.position.y += 10; break;
                case 'down':
                    obj.position.y -= 10; break;
                case 'right':
                    obj.position.x += 10; break;
                case 'left':
                    obj.position.x -= 10; break;
                }
                obj.bodyParts.push(obj.direction);
            }
        });
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.getPlayerObject(playerId);
        if (player) {
            player.direction = inputData.input;
        }
    }
}
