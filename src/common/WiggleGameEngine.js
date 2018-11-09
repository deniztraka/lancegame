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
            foodRadius: 0.2, headRadius: 0.2, bodyRadius: 0.15,
            spaceWidth: 16, spaceHeight: 9,
            moveDist: 0.1
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
                    obj.position.y += this.moveDist; break;
                case 'down':
                    obj.position.y -= this.moveDist; break;
                case 'right':
                    obj.position.x += this.moveDist; break;
                case 'left':
                    obj.position.x -= this.moveDist; break;
                }
                obj.bodyParts.push(obj.direction);
                obj.bodyParts.shift();
                if (obj.position.y > this.spaceHeight / 2) obj.direction = 'down';
                if (obj.position.x > this.spaceWidth / 2) obj.direction = 'left';
                if (obj.position.y < -this.spaceHeight / 2) obj.direction = 'up';
                if (obj.position.x < -this.spaceWidth / 2) obj.direction = 'right';
            }
        });
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.queryObject({ playerId });
        if (player) {
            player.direction = inputData.input;
        }
    }
}
