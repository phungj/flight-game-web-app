export class Controls {
    private keys =
        new Set<string>();

    constructor() {
        window.addEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.addEventListener(
            "keyup",
            this.handleKeyUp
        );
    }

    private handleKeyDown = (
        event: KeyboardEvent
    ) => {
        this.keys.add(
            event.code
        );
    };

    private handleKeyUp = (
        event: KeyboardEvent
    ) => {
        this.keys.delete(
            event.code
        );
    };

    isDown(
        code: string
    ) {
        return this.keys.has(
            code
        );
    }

    get pitch() {
        let value = 0;

        if (
            this.isDown("KeyW")
        ) {
            value -= 1;
        }

        if (
            this.isDown("KeyS")
        ) {
            value += 1;
        }

        return value;
    }

    get roll() {
        let value = 0;

        if (
            this.isDown("KeyA")
        ) {
            value += 1;
        }

        if (
            this.isDown("KeyD")
        ) {
            value -= 1;
        }

        return value;
    }

    get yaw() {
        let value = 0;

        if (
            this.isDown("KeyQ")
        ) {
            value += 1;
        }

        if (
            this.isDown("KeyE")
        ) {
            value -= 1;
        }

        return value;
    }

    get throttle() {
        let value = 0;

        if (
            this.isDown("ShiftLeft") ||
            this.isDown("ShiftRight")
        ) {
            value += 1;
        }

        if (
            this.isDown("ControlLeft") ||
            this.isDown("ControlRight")
        ) {
            value -= 1;
        }

        return value;
    }

    dispose() {
        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.removeEventListener(
            "keyup",
            this.handleKeyUp
        );
    }
}