'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import TwoVector from 'lance/serialize/TwoVector';
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
            spaceWidth: 16, spaceHeight: 9, moveDist: 0.04,
            foodCount: 16, eatDistance: 0.4, startBodyLength: 10
        });
    }

    registerClasses(serializer) {
        serializer.registerClass(Wiggle);
        serializer.registerClass(Food);
    }

    start() {
        super.start();
    }

    // returns a random number between -0.5 and 0.5
    rand() {
        return Math.random() - 0.5;
    }

    randPos() {
        let x = this.rand() * this.spaceWidth;
        let y = this.rand() * this.spaceHeight;
        return new TwoVector(x, y);
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
                if (!obj.grow)
                    obj.bodyParts.shift();
                obj.grow = false;
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
