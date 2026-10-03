import * as THREE from "three";

import {
    Enemy,
    type EnemyControls,
    type EnemyOptions,
} from "../enemy";

import {
    Missile,
} from "../../missile";

export type GroundEnemyType =
    | "truck"
    | "tank"
    | "aa"
    | "sam";

export type GroundEnemyOptions =
    EnemyOptions & {
    missileFireInterval?: number;

    aaFireInterval?: number;
    aaRange?: number;
    aaDamage?: number;
    aaRoundsPerSecond?: number;
};

export class GroundEnemy extends Enemy {
    readonly type: GroundEnemyType;

    /*
     * Ground units are stationary by default.
     *
     * Speed is still inherited from Enemy so that
     * moving ground units can be introduced later
     * without changing the class interface.
     */

    /*
     * ==================================================
     * SAM system
     * ==================================================
     *
     * Used by "sam" units.
     *
     * SAMs have unlimited ammunition and simply fire
     * at a fixed interval whenever their AI provides
     * a valid target.
     */

    missileFireInterval: number;
    missileCooldown = 0;

    /*
     * ==================================================
     * AA gun system
     * ==================================================
     *
     * Used by "aa" units.
     *
     * This is conceptually similar to ship CIWS, but
     * represents a ground-based automatic cannon.
     */
    aaFireInterval: number;
    aaCooldown = 0;

    readonly aaRange: number;
    readonly aaDamage: number;

    readonly aaRoundsPerSecond: number;

    /*
     * Ground AA guns generally have a much more limited
     * vertical engagement envelope than a ship's CIWS.
     *
     * Horizontal traversal is still very wide.
     */
    readonly aaHorizontalAngle: number;
    readonly aaVerticalAngle: number;

    /*
     * Accumulates fractional rounds between frames.
     */
    private aaRoundAccumulator = 0;

    constructor(
        type: GroundEnemyType,
        position: THREE.Vector3,
        options: GroundEnemyOptions = {}
    ) {
        const health =
            type === "truck"
                ? options.health ?? 50
                : type === "tank"
                    ? options.health ?? 100
                    : type === "aa"
                        ? options.health ?? 75
                        : options.health ?? 100;

        const collisionRadius =
            options.collisionRadius ??
            (
                type === "truck"
                    ? 7
                    : type === "tank"
                        ? 8
                        : type === "aa"
                            ? 6
                            : 7
            );

        super(
            position,
            collisionRadius,
            {
                health,
                /*
                 * Ground units don't move yet.
                 */
                speed: 0,
            }
        );

        this.type = type;

        /*
         * ==================================================
         * SAM timing
         * ==================================================
         */

        this.missileFireInterval =
            options.missileFireInterval ??
            (
                type === "sam"
                    ? 8
                    : 0
            );

        /*
         * ==================================================
         * AA gun timing
         * ==================================================
         */

        this.aaFireInterval =
            options.aaFireInterval ??
            (
                type === "aa"
                    ? 0.05
                    : 0
            );

        /*
         * Ground AA engagement range.
         *
         * Shorter than the ship CIWS range because these
         * weapons are intended to be local defenses.
         */
        this.aaRange =
            options.aaRange ??
            (
                type === "aa"
                    ? 500
                    : 0
            );

        /*
         * Damage per AA projectile.
         *
         * Keep individual rounds weak because the threat
         * comes primarily from volume of fire.
         */
        this.aaDamage =
            options.aaDamage ??
            (
                type === "aa"
                    ? 2
                    : 0
            );

        /*
         * Ground AA volume of fire.
         */
        this.aaRoundsPerSecond =
            options.aaRoundsPerSecond ??
            (
                type === "aa"
                    ? 30
                    : 0
            );

        /*
         * Ground AA tracking envelope.
         *
         * Horizontal coverage is effectively all-around.
         *
         * Vertical coverage is intentionally more limited.
         * The exact value can be tuned once we have actual
         * ground combat in the game.
         */
        this.aaHorizontalAngle =
            THREE.MathUtils.degToRad(180);

        this.aaVerticalAngle =
            THREE.MathUtils.degToRad(60);

        /*
         * Ground units currently don't maneuver.
         */
        this.quaternion.identity();

        /*
         * Create the appropriate visual model.
         */
        if (type === "truck") {
            this.createTruck();
        } else if (type === "tank") {
            this.createTank();
        } else if (type === "aa") {
            this.createAA();
        } else {
            this.createSAM();
        }

        this.syncTransform();
    }

    // ==================================================
    // Materials
    // ==================================================

    private createHullMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x4f5548,
        });
    }

    private createDarkMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x292c27,
        });
    }

    private createWeaponMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x25292a,
        });
    }

    private createMissileMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x8b8f8d,
        });
    }

    // ==================================================
    // Truck
    // ==================================================

    private createTruck() {
        /*
         * Simple military cargo truck.
         *
         * This is intentionally uncomplicated. These
         * units are primarily there to give the player
         * ground targets to attack.
         */

        const chassis =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    7,
                    2,
                    12
                ),
                this.createDarkMaterial()
            );

        chassis.position.y = 2;

        this.group.add(chassis);

        /*
         * Cab.
         */
        const cab =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6.5,
                    4,
                    4
                ),
                this.createHullMaterial()
            );

        cab.position.y = 5;

        cab.position.z = -3.5;

        this.group.add(cab);

        /*
         * Cargo bed.
         */
        const cargo =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6.5,
                    3.5,
                    6
                ),
                this.createHullMaterial()
            );

        cargo.position.y = 4.75;

        cargo.position.z = 2.5;

        this.group.add(cargo);

        /*
         * Wheels.
         */
        const wheelGeometry =
            new THREE.CylinderGeometry(
                1.2,
                1.2,
                0.8,
                10
            );

        for (const x of [-3.5, 3.5]) {
            for (const z of [-3.5, 3.5]) {
                const wheel =
                    new THREE.Mesh(
                        wheelGeometry,
                        this.createDarkMaterial()
                    );

                wheel.rotation.z =
                    Math.PI / 2;

                wheel.position.x = x;

                wheel.position.y = 1.2;

                wheel.position.z = z;

                this.group.add(wheel);
            }
        }
    }

    // ==================================================
    // Tank
    // ==================================================

    private createTank() {
        /*
         * Basic main battle tank.
         *
         * Again, this is primarily a visual target
         * at this stage.
         */

        const hull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    8,
                    2.5,
                    12
                ),
                this.createHullMaterial()
            );

        hull.position.y = 2.5;

        this.group.add(hull);

        /*
         * Sloped upper hull.
         */
        const upperHull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    7,
                    2,
                    7
                ),
                this.createHullMaterial()
            );

        upperHull.position.y = 4.25;

        upperHull.position.z = 0.5;

        this.group.add(upperHull);

        /*
         * Turret.
         */
        const turret =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    2.5,
                    2.5,
                    1.5,
                    8
                ),
                this.createDarkMaterial()
            );

        turret.position.y = 5.75;

        this.group.add(turret);

        /*
         * Main gun.
         */
        const barrel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.7,
                    0.7,
                    7
                ),
                this.createWeaponMaterial()
            );

        barrel.position.y = 6.2;

        barrel.position.z = -4;

        this.group.add(barrel);

        /*
         * Tracks.
         */
        for (const x of [-4.5, 4.5]) {
            const track =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.5,
                        2.5,
                        12
                    ),
                    this.createDarkMaterial()
                );

            track.position.x = x;

            track.position.y = 2.2;

            this.group.add(track);
        }
    }

    // ==================================================
    // AA gun
    // ==================================================

    private createAA() {
        /*
         * Ground-based automatic AA cannon.
         *
         * This is visually similar to a radar-directed
         * point-defense weapon, but mounted on a simple
         * ground platform.
         */

        const base =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    2,
                    2.25,
                    1.5,
                    8
                ),
                this.createDarkMaterial()
            );

        base.position.y = 1.5;

        this.group.add(base);

        /*
         * Weapon housing.
         */
        const housing =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.8,
                    2.2,
                    2.8
                ),
                this.createWeaponMaterial()
            );

        housing.position.y = 3.2;

        this.group.add(housing);

        /*
         * Twin barrels.
         */
        for (const x of [-0.4, 0.4]) {
            const barrel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.3,
                        0.3,
                        4
                    ),
                    this.createWeaponMaterial()
                );

            barrel.position.x = x;

            barrel.position.y = 3.6;

            barrel.position.z = -2;

            this.group.add(barrel);
        }

        /*
         * Radar / optical sensor.
         */
        const sensor =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.6,
                    8,
                    6
                ),
                this.createDarkMaterial()
            );

        sensor.position.y = 4.8;

        this.group.add(sensor);
    }

    // ==================================================
    // SAM
    // ==================================================

    private createSAM() {
        /*
         * Simple ground-based SAM launcher.
         *
         * The launcher is deliberately generic for now.
         * We can make individual SAM systems later if
         * different ranges / missile behaviors are useful.
         */

        const platform =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    7,
                    1.5,
                    7
                ),
                this.createDarkMaterial()
            );

        platform.position.y = 1;

        this.group.add(platform);

        /*
         * Launcher frame.
         */
        const launcher =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    5,
                    1.5,
                    5
                ),
                this.createWeaponMaterial()
            );

        launcher.position.y = 2.5;

        this.group.add(launcher);

        /*
         * Four visible missiles.
         */
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -1; z <= 1; z += 2) {
                const missile =
                    new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.3,
                            0.3,
                            3,
                            8
                        ),
                        this.createMissileMaterial()
                    );

                missile.position.x =
                    x * 1.3;

                missile.position.y =
                    5;

                missile.position.z =
                    z * 1.3;

                this.group.add(missile);
            }
        }
    }

    // ==================================================
    // Missile system
    // ==================================================

    canFireMissile(): boolean {
        return (
            this.alive &&
            this.missileFireInterval > 0 &&
            this.missileCooldown <= 0
        );
    }

    fireMissile(
        target: THREE.Vector3
    ): Missile | null {
        if (
            !this.canFireMissile()
        ) {
            return null;
        }

        const direction =
            target
                .clone()
                .sub(this.position)
                .normalize();

        const launchPosition =
            this.position
                .clone()
                .addScaledVector(
                    direction,
                    6
                );

        launchPosition.y += 5;

        const missile =
            new Missile(
                launchPosition,
                direction,
                target
            );

        this.missileCooldown =
            this.missileFireInterval;

        return missile;
    }

    // ==================================================
    // AA system
    // ==================================================

    canFireAA(): boolean {
        return (
            this.alive &&
            this.aaFireInterval > 0 &&
            this.aaCooldown <= 0
        );
    }

    fireAA(): boolean {
        if (
            !this.canFireAA()
        ) {
            return false;
        }

        this.aaCooldown =
            this.aaFireInterval;

        return true;
    }

    /*
     * Returns the number of AA rounds that should
     * be fired during this frame.
     *
     * Fractional rounds are accumulated so the actual
     * rate remains stable regardless of frame rate.
     */
    getAARounds(
        dt: number
    ): number {
        if (
            !this.alive ||
            this.aaRoundsPerSecond <= 0
        ) {
            return 0;
        }

        this.aaRoundAccumulator +=
            this.aaRoundsPerSecond * dt;

        const rounds =
            Math.floor(
                this.aaRoundAccumulator
            );

        this.aaRoundAccumulator -=
            rounds;

        return rounds;
    }

    // ==================================================
    // Update
    // ==================================================

    update(
        dt: number,
        _controls: EnemyControls
    ) {
        if (!this.alive) {
            return;
        }

        this.missileCooldown =
            Math.max(
                0,
                this.missileCooldown - dt
            );

        this.aaCooldown =
            Math.max(
                0,
                this.aaCooldown - dt
            );

        /*
         * Ground units currently remain stationary.
         *
         * The inherited speed property is retained so
         * movement can be introduced later.
         */
        if (this.speed > 0) {
            const forward =
                new THREE.Vector3(
                    0,
                    0,
                    -1
                ).applyQuaternion(
                    this.quaternion
                );

            this.position.addScaledVector(
                forward,
                this.speed * dt
            );
        }

        this.syncTransform();
    }

    private syncTransform() {
        this.group.position.copy(
            this.position
        );

        this.group.quaternion.copy(
            this.quaternion
        );
    }
}