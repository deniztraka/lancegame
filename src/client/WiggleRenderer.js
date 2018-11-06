import Renderer from 'lance/render/Renderer';

let ctx = null;
let canvas = null;
let game = null;

export default class WiggleRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        game = gameEngine;
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        document.body.insertBefore(canvas, document.getElementById('logo'));
        game.w = canvas.width;
        game.h = canvas.height;
        game.zoom = game.h / game.spaceHeight;
        if (game.w / game.spaceWidth < game.zoom) game.zoom = game.w / game.spaceWidth;
        ctx = canvas.getContext('2d');
    }

    draw(t, dt) {
        super.draw(t, dt);

        // Clear the canvas
        ctx.clearRect(0, 0, game.w, game.h);

        // Transform the canvas
        // Note that we need to flip the y axis since Canvas pixel coordinates
        // goes from top to bottom, while physics does the opposite.
        ctx.save();
        ctx.translate(game.w/2, game.h/2); // Translate to the center
        ctx.scale(game.zoom, -game.zoom);  // Zoom in and flip y axis

        // Draw all things
        game.world.forEachObject((id, obj) => {
            if (obj instanceof Wiggle) this.drawWiggle(obj);
            else if (obj instanceof Food) this.drawFood(obj);
        });

        ctx.restore();

    }

    drawWiggle(wObj) {
        let body = wObj.physicsObj;
        let x = body.position[0];
        let y = body.position[1];
        this.drawCircle(x, y, game.headRadius);
        for (let i = 0; i < wObj.bodyParts.length; i++) {
            switch (wObj.bodyParts[i]) {
            case 'up':
                y += 1; break;
            case 'down':
                y -= 1; break;
            case 'right':
                x += 1; break;
            case 'left':
                x -= 1; break;
            }
            this.drawCircle(x, y, game.bodyRadius);
        }
    }

    drawFood(foodObj) {
        let body = foodObj.physicsObj;
        this.drawCircle(body.position[0], body.position[1], game.foodRadius);
    }

    drawCircle(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }

}
