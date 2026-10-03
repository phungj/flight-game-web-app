import { Aircraft } from "./aircraft";

export class Player {
    aircraft: Aircraft;

    health = 100000000;
    maxHealth = 100;

    collisionRadius = 5;

    alive = true;

    constructor() {
        this.aircraft =
            new Aircraft();
    }

    get position() {
        return this.aircraft.position;
    }

    get quaternion() {
        return this.aircraft.quaternion;
    }

    get rotation() {
        return this.aircraft.rotation;
    }

    get speed() {
        return this.aircraft.speed;
    }

    get throttle() {
        return this.aircraft.throttle;
    }

    update(
        dt: number,
        controls: {
            pitch: number;
            roll: number;
            yaw: number;
            throttle: number;
        }
    ) {
        if (!this.alive) {
            return;
        }

        this.aircraft.update(
            dt,
            controls
        );
    }

    takeDamage(
        amount: number
    ) {
        if (!this.alive) {
            return;
        }

        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    destroy() {
        if (!this.alive) {
            return;
        }

        this.health = 0;
        this.alive = false;
    }
}