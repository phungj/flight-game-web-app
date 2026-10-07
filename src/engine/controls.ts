export type ControlAction =
    | "pitchUp"
    | "pitchDown"
    | "rollLeft"
    | "rollRight"
    | "yawLeft"
    | "yawRight"
    | "throttleUp"
    | "throttleDown"
    | "fireGun"
    | "launchMissile"
    | "nextTarget"
    | "reset"
    | "exit";

export type ControlBindings = {
    pitchUp: string[];
    pitchDown: string[];

    rollLeft: string[];
    rollRight: string[];

    yawLeft: string[];
    yawRight: string[];

    throttleUp: string[];
    throttleDown: string[];

    fireGun: string[];
    launchMissile: string[];
    nextTarget: string[];
    reset: string[];
    exit: string[];
};

const DEFAULT_BINDINGS: ControlBindings = {
    pitchUp: ["KeyW"],
    pitchDown: ["KeyS"],

    rollLeft: ["KeyA"],
    rollRight: ["KeyD"],

    yawLeft: ["KeyQ"],
    yawRight: ["KeyE"],

    throttleUp: [
        "ShiftLeft",
        "ShiftRight",
    ],

    throttleDown: [
        "ControlLeft",
        "ControlRight",
    ],

    fireGun: ["KeyF"],
    launchMissile: ["Space"],
    nextTarget: ["Tab"],
    reset: ["KeyR"],
    exit: ["Escape"],
};

function cloneBindings(
    bindings: ControlBindings
): ControlBindings {
    return {
        pitchUp: [...bindings.pitchUp],
        pitchDown: [...bindings.pitchDown],

        rollLeft: [...bindings.rollLeft],
        rollRight: [...bindings.rollRight],

        yawLeft: [...bindings.yawLeft],
        yawRight: [...bindings.yawRight],

        throttleUp: [...bindings.throttleUp],
        throttleDown: [...bindings.throttleDown],

        fireGun: [...bindings.fireGun],
        launchMissile: [...bindings.launchMissile],
        nextTarget: [...bindings.nextTarget],
        reset: [...bindings.reset],
        exit: [...bindings.exit],
    };
}

function cloneDefaultBindings(): ControlBindings {
    return cloneBindings(
        DEFAULT_BINDINGS
    );
}

export class Controls {
    private keys =
        new Set<string>();

    private bindings:
        ControlBindings;

    private rebindingAction:
        ControlAction | null = null;

    private rebindingCallback:
        ((code: string) => void) | null = null;

    constructor(
        bindings?: ControlBindings
    ) {
        this.bindings =
            bindings
                ? cloneBindings(bindings)
                : cloneDefaultBindings();

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
        if (
            this.rebindingAction
        ) {
            event.preventDefault();

            if (
                event.code === "Escape"
            ) {
                this.cancelRebinding();

                return;
            }

            const action =
                this.rebindingAction;

            const callback =
                this.rebindingCallback;

            this.rebindingAction =
                null;

            this.rebindingCallback =
                null;

            this.setBinding(
                action,
                event.code
            );

            callback?.(
                event.code
            );

            return;
        }

        if (
            this.isBoundKey(
                event.code
            )
        ) {
            event.preventDefault();
        }

        this.keys.add(
            event.code
        );
    };

    private handleKeyUp = (
        event: KeyboardEvent
    ) => {
        if (
            this.isBoundKey(
                event.code
            )
        ) {
            event.preventDefault();
        }

        this.keys.delete(
            event.code
        );
    };

    private isBoundKey(
        code: string
    ) {
        return Object.values(
            this.bindings
        ).some(
            bindings =>
                bindings.includes(code)
        );
    }

    private isActionDown(
        action: ControlAction
    ) {
        return this.bindings[action].some(
            code => this.isDown(code)
        );
    }

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
            this.isActionDown("pitchUp")
        ) {
            value -= 1;
        }

        if (
            this.isActionDown("pitchDown")
        ) {
            value += 1;
        }

        return value;
    }

    get roll() {
        let value = 0;

        if (
            this.isActionDown("rollLeft")
        ) {
            value += 1;
        }

        if (
            this.isActionDown("rollRight")
        ) {
            value -= 1;
        }

        return value;
    }

    get yaw() {
        let value = 0;

        if (
            this.isActionDown("yawLeft")
        ) {
            value += 1;
        }

        if (
            this.isActionDown("yawRight")
        ) {
            value -= 1;
        }

        return value;
    }

    get throttle() {
        let value = 0;

        if (
            this.isActionDown("throttleUp")
        ) {
            value += 1;
        }

        if (
            this.isActionDown("throttleDown")
        ) {
            value -= 1;
        }

        return value;
    }

    get fireGun() {
        return this.isActionDown(
            "fireGun"
        );
    }

    get launchMissile() {
        return this.isActionDown(
            "launchMissile"
        );
    }

    get nextTarget() {
        return this.isActionDown(
            "nextTarget"
        );
    }

    get reset() {
        return this.isActionDown(
            "reset"
        );
    }

    get exit() {
        return this.isActionDown(
            "exit"
        );
    }

    getBindings(): ControlBindings {
        return cloneBindings(
            this.bindings
        );
    }

    setBinding(
        action: ControlAction,
        code: string
    ) {
        this.bindings[action] = [
            code,
        ];

        this.keys.clear();
    }

    resetBindings() {
        this.bindings =
            cloneDefaultBindings();

        this.keys.clear();
    }

    startRebinding(
        action: ControlAction,
        callback?: (code: string) => void
    ) {
        this.keys.clear();

        this.rebindingAction =
            action;

        this.rebindingCallback =
            callback ?? null;
    }

    cancelRebinding() {
        this.rebindingAction =
            null;

        this.rebindingCallback =
            null;

        this.keys.clear();
    }

    isRebinding() {
        return this.rebindingAction !== null;
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

        this.keys.clear();
    }
}