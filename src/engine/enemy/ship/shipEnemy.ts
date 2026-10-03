import * as THREE from "three";

import {
    Enemy,
    type EnemyControls,
    type EnemyOptions,
} from "../enemy";

import {
    Missile,
} from "../../missile";

export type ShipEnemyType =
    | "supply"
    | "destroyer"
    | "cruiser";

export type ShipEnemyOptions =
    EnemyOptions & {
    missileFireInterval?: number;

    ciwsFireInterval?: number;
    ciwsRange?: number;
    ciwsDamage?: number;
    ciwsRoundsPerSecond?: number;
};

export class ShipEnemy extends Enemy {
    readonly type: ShipEnemyType;

    /*
     * AA missile system.
     *
     * Ships have unlimited missiles.
     * They simply fire at a fixed interval whenever
     * their AI gives them a valid target.
     */
    missileFireInterval: number;
    missileCooldown = 0;

    /*
     * CIWS system.
     *
     * CIWS has unlimited ammunition.
     *
     * Unlike the SAM system, CIWS is intended to
     * produce a continuous wall of fire at close
     * range.
     */
    ciwsFireInterval: number;
    ciwsCooldown = 0;

    readonly ciwsRange: number;
    readonly ciwsDamage: number;

    /*
     * Number of rounds the CIWS attempts to fire
     * per second.
     *
     * This is deliberately high. The Game layer
     * converts this into individual projectiles.
     */
    readonly ciwsRoundsPerSecond: number;

    /*
     * CIWS engagement angle.
     *
     * This is intentionally very wide because the
     * weapon is radar-directed rather than tied to
     * the ship's forward direction.
     *
     * Stored in radians.
     */
    readonly ciwsHorizontalAngle: number;
    readonly ciwsVerticalAngle: number;

    /*
     * Accumulates fractional rounds between frames.
     *
     * For example, at 40 rounds/sec and 60 FPS,
     * most frames accumulate ~0.67 rounds. Eventually
     * that becomes one actual projectile.
     */
    private ciwsRoundAccumulator = 0;

    constructor(
        type: ShipEnemyType,
        position: THREE.Vector3,
        options: ShipEnemyOptions = {}
    ) {
        const health =
            type === "supply"
                ? options.health ?? 150
                : type === "destroyer"
                    ? options.health ?? 350
                    : options.health ?? 650;

        const speed =
            type === "supply"
                ? options.speed ?? 18
                : type === "destroyer"
                    ? options.speed ?? 25
                    : options.speed ?? 20;

        const collisionRadius =
            options.collisionRadius ??
            (
                type === "supply"
                    ? 22
                    : type === "destroyer"
                        ? 18
                        : 28
            );

        super(
            position,
            collisionRadius,
            {
                health,
                speed,
            }
        );

        this.type = type;

        /*
         * Ship SAM timing.
         */
        this.missileFireInterval =
            options.missileFireInterval ??
            (
                type === "destroyer"
                    ? 8
                    : type === "cruiser"
                        ? 5
                        : 0
            );

        /*
         * CIWS timing.
         *
         * These values control the update cadence
         * of the weapon system, not individual rounds.
         */
        this.ciwsFireInterval =
            options.ciwsFireInterval ??
            (
                type === "destroyer"
                    ? 0.05
                    : type === "cruiser"
                        ? 0.05
                        : 0
            );

        /*
         * CIWS engagement range.
         */
        this.ciwsRange =
            options.ciwsRange ?? 800;

        /*
         * Damage per CIWS projectile.
         *
         * Individual rounds remain fairly weak because
         * the weapon is supposed to be dangerous through
         * volume of fire.
         */
        this.ciwsDamage =
            options.ciwsDamage ??
            (
                type === "destroyer"
                    ? 3
                    : type === "cruiser"
                        ? 3
                        : 0
            );

        /*
         * CIWS volume of fire.
         *
         * This is the important change.
         *
         * A real-looking CIWS effect needs dozens of
         * projectiles per second rather than one every
         * tenth of a second.
         */
        this.ciwsRoundsPerSecond =
            options.ciwsRoundsPerSecond ??
            (
                type === "destroyer"
                    ? 35
                    : type === "cruiser"
                        ? 45
                        : 0
            );

        /*
         * Radar-directed engagement envelope.
         *
         * 180 degrees means a full 360-degree field when
         * interpreted as +/- angle around the ship.
         *
         * The vertical angle is similarly generous.
         */
        this.ciwsHorizontalAngle =
            THREE.MathUtils.degToRad(180);

        this.ciwsVerticalAngle =
            THREE.MathUtils.degToRad(75);

        this.quaternion.identity();

        if (type === "supply") {
            this.createSupplyShip();
        } else if (type === "destroyer") {
            this.createDestroyer();
        } else {
            this.createCruiser();
        }

        this.syncTransform();
    }

    // ==================================================
    // Materials
    // ==================================================

    private createHullMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x4f575b,
        });
    }

    private createDeckMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x697174,
        });
    }

    private createStructureMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x7b8284,
        });
    }

    private createDarkMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x303638,
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
    // Supply ship
    // ==================================================

    private createSupplyShip() {
        /*
         * Large merchant-style hull.
         *
         * Roughly 110 units long, making it
         * substantially larger than the bomber.
         *
         * Forward:
         *   bow
         *
         * Center:
         *   cargo
         *
         * Rear:
         *   bridge / engineering
         *
         * No weapons.
         */

        const hull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    22,
                    8,
                    100
                ),
                this.createHullMaterial()
            );

        hull.position.y = 4;

        this.group.add(hull);

        /*
         * Raised deck.
         */
        const deck =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    19,
                    1.5,
                    94
                ),
                this.createDeckMaterial()
            );

        deck.position.y = 8.75;

        this.group.add(deck);

        /*
         * Cargo containers.
         */
        const cargoMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x858a89,
            });

        for (let row = -1; row <= 1; row += 2) {
            for (let i = 0; i < 5; i++) {
                const cargo =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            7,
                            6,
                            12
                        ),
                        cargoMaterial
                    );

                cargo.position.x =
                    row * 4.7;

                cargo.position.y =
                    12.5;

                cargo.position.z =
                    18 - i * 14;

                this.group.add(cargo);
            }
        }

        /*
         * Rear bridge.
         */
        const bridge =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    12,
                    12,
                    15
                ),
                this.createStructureMaterial()
            );

        bridge.position.y = 15;

        bridge.position.z = 30;

        this.group.add(bridge);

        /*
         * Bridge roof.
         */
        const bridgeRoof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    14,
                    1.5,
                    17
                ),
                this.createDarkMaterial()
            );

        bridgeRoof.position.y = 21.75;

        bridgeRoof.position.z = 30;

        this.group.add(bridgeRoof);

        /*
         * Funnel.
         */
        const funnel =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    2,
                    2.5,
                    7,
                    8
                ),
                this.createDarkMaterial()
            );

        funnel.position.y = 15;

        funnel.position.z = 12;

        this.group.add(funnel);

        /*
         * Mast.
         */
        this.createMast(
            0,
            31,
            12
        );
    }

    // ==================================================
    // Destroyer
    // ==================================================

    private createDestroyer() {
        /*
         * Large destroyer:
         *
         *                 forward
         *                   -Z
         *
         *              [ MAIN GUN ]
         *
         *              [ BRIDGE ]
         *                  |
         *           [ VLS ] [ VLS ]
         *                  |
         *              [ CIWS ]
         *                  |
         *              [ MAIN GUN ]
         *
         * Approximately 85 units long.
         */

        const hull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    16,
                    7,
                    78
                ),
                this.createHullMaterial()
            );

        hull.position.y = 4;

        this.group.add(hull);

        /*
         * Upper deck.
         */
        const deck =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    13,
                    1.5,
                    72
                ),
                this.createDeckMaterial()
            );

        deck.position.y = 8.25;

        this.group.add(deck);

        /*
         * Forward main gun.
         */
        this.createMainGun(
            0,
            -27,
            9,
            6
        );

        /*
         * Bridge.
         */
        const bridge =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    9,
                    12,
                    13
                ),
                this.createStructureMaterial()
            );

        bridge.position.y = 14;

        bridge.position.z = -7;

        this.group.add(bridge);

        /*
         * Bridge roof.
         */
        const bridgeRoof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    10,
                    1.5,
                    15
                ),
                this.createDarkMaterial()
            );

        bridgeRoof.position.y = 20.75;

        bridgeRoof.position.z = -7;

        this.group.add(bridgeRoof);

        /*
         * Forward VLS bank.
         */
        this.createMissileLauncher(
            -4,
            9.5,
            7
        );

        this.createMissileLauncher(
            4,
            9.5,
            7
        );

        /*
         * Rear VLS bank.
         */
        this.createMissileLauncher(
            -4,
            9.5,
            17
        );

        this.createMissileLauncher(
            4,
            9.5,
            17
        );

        /*
         * Forward CIWS.
         */
        this.createCIWS(
            -5,
            10,
            -16
        );

        /*
         * Rear CIWS.
         */
        this.createCIWS(
            5,
            10,
            25
        );

        /*
         * Rear main gun.
         */
        this.createMainGun(
            0,
            27,
            9,
            5.5
        );

        /*
         * Radar / communications mast.
         */
        this.createMast(
            0,
            -1,
            25
        );

        /*
         * Large radar.
         */
        const radar =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    3,
                    10,
                    6
                ),
                this.createDarkMaterial()
            );

        radar.scale.y = 0.35;

        radar.position.y = 27;

        radar.position.z = 1;

        this.group.add(radar);
    }

    // ==================================================
    // Cruiser
    // ==================================================

    private createCruiser() {
        /*
         * Heavy cruiser:
         *
         * Approximately 125 units long and
         * substantially wider than destroyer.
         *
         * Two heavy forward guns, one rear gun,
         * extensive superstructure, VLS banks,
         * four CIWS mounts, and large radar.
         */

        const hull =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    24,
                    9,
                    116
                ),
                this.createHullMaterial()
            );

        hull.position.y = 5;

        this.group.add(hull);

        /*
         * Broad upper deck.
         */
        const deck =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    21,
                    1.75,
                    108
                ),
                this.createDeckMaterial()
            );

        deck.position.y = 10.25;

        this.group.add(deck);

        /*
         * Forward main gun.
         */
        this.createMainGun(
            0,
            -42,
            11.25,
            8
        );

        /*
         * Second forward main gun.
         */
        this.createMainGun(
            0,
            -27,
            11.25,
            7
        );

        /*
         * Main bridge.
         */
        const forwardStructure =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    14,
                    15,
                    19
                ),
                this.createStructureMaterial()
            );

        forwardStructure.position.y = 18;

        forwardStructure.position.z = -8;

        this.group.add(
            forwardStructure
        );

        /*
         * Bridge roof.
         */
        const forwardRoof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    16,
                    1.75,
                    21
                ),
                this.createDarkMaterial()
            );

        forwardRoof.position.y = 26;

        forwardRoof.position.z = -8;

        this.group.add(
            forwardRoof
        );

        /*
         * Forward VLS bank.
         */
        for (let i = 0; i < 4; i++) {
            this.createMissileLauncher(
                -7,
                12,
                10 + i * 5
            );

            this.createMissileLauncher(
                7,
                12,
                10 + i * 5
            );
        }

        /*
         * Forward CIWS.
         */
        this.createCIWS(
            -8,
            13,
            -20
        );

        this.createCIWS(
            8,
            13,
            -20
        );

        /*
         * Rear CIWS.
         */
        this.createCIWS(
            -8,
            13,
            32
        );

        this.createCIWS(
            8,
            13,
            32
        );

        /*
         * Rear superstructure.
         */
        const rearStructure =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    15,
                    10,
                    13
                ),
                this.createStructureMaterial()
            );

        rearStructure.position.y = 15;

        rearStructure.position.z = 37;

        this.group.add(
            rearStructure
        );

        /*
         * Rear main gun.
         */
        this.createMainGun(
            0,
            48,
            11.25,
            7
        );

        /*
         * Tall radar mast.
         */
        this.createMast(
            0,
            3,
            32
        );

        /*
         * Primary radar.
         */
        const radar =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    4.5,
                    12,
                    6
                ),
                this.createDarkMaterial()
            );

        radar.scale.y = 0.3;

        radar.position.y = 35;

        radar.position.z = 3;

        this.group.add(radar);

        /*
         * Secondary radar.
         */
        const secondaryRadar =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    3,
                    10,
                    5
                ),
                this.createDarkMaterial()
            );

        secondaryRadar.scale.y = 0.3;

        secondaryRadar.position.y = 28;

        secondaryRadar.position.z = 8;

        this.group.add(secondaryRadar);
    }

    // ==================================================
    // Weapon geometry
    // ==================================================

    private createMainGun(
        x: number,
        z: number,
        y: number,
        barrelLength: number
    ) {
        /*
         * Main naval gun turret.
         */

        const turret =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    3,
                    3,
                    2,
                    10
                ),
                this.createWeaponMaterial()
            );

        turret.position.x = x;

        turret.position.y = y;

        turret.position.z = z;

        this.group.add(turret);

        /*
         * Gun housing.
         */
        const housing =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    2.5,
                    4.5
                ),
                this.createWeaponMaterial()
            );

        housing.position.x = x;

        housing.position.y =
            y + 1.4;

        housing.position.z =
            z - 0.75;

        this.group.add(
            housing
        );

        /*
         * Barrel points forward along -Z.
         */
        const barrel =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.45,
                    0.6,
                    barrelLength,
                    8
                ),
                this.createWeaponMaterial()
            );

        barrel.rotation.x =
            Math.PI / 2;

        barrel.position.x = x;

        barrel.position.y =
            y + 2.25;

        barrel.position.z =
            z - barrelLength / 2;

        this.group.add(
            barrel
        );
    }

    private createCIWS(
        x: number,
        y: number,
        z: number
    ) {
        /*
         * Radar-guided point-defense gun.
         */

        const base =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    2,
                    2.25,
                    1.5,
                    8
                ),
                this.createWeaponMaterial()
            );

        base.position.x = x;

        base.position.y = y;

        base.position.z = z;

        this.group.add(base);

        const housing =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.8,
                    2.4,
                    2.8
                ),
                this.createWeaponMaterial()
            );

        housing.position.x = x;

        housing.position.y =
            y + 1.5;

        housing.position.z = z;

        this.group.add(
            housing
        );

        /*
         * Twin barrels.
         */
        for (let i = -1; i <= 1; i += 2) {
            const barrel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.3,
                        0.3,
                        4
                    ),
                    this.createWeaponMaterial()
                );

            barrel.position.x =
                x + i * 0.4;

            barrel.position.y =
                y + 1.9;

            barrel.position.z =
                z - 2;

            this.group.add(
                barrel
            );
        }

        /*
         * Sensor dome.
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

        sensor.position.x = x;

        sensor.position.y =
            y + 3.2;

        sensor.position.z = z;

        this.group.add(
            sensor
        );
    }

    private createMissileLauncher(
        x: number,
        y: number,
        z: number
    ) {
        /*
         * Vertical-launch AA missile launcher.
         */

        const launcher =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    4,
                    1.8,
                    5
                ),
                this.createMissileMaterial()
            );

        launcher.position.x = x;

        launcher.position.y = y;

        launcher.position.z = z;

        this.group.add(
            launcher
        );

        /*
         * Three visible cell covers.
         */
        for (let i = -1; i <= 1; i++) {
            const cell =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1,
                        0.25,
                        1
                    ),
                    this.createDarkMaterial()
                );

            cell.position.x =
                x + i * 1.2;

            cell.position.y =
                y + 1;

            cell.position.z =
                z;

            this.group.add(cell);
        }
    }

    private createMast(
        x: number,
        z: number,
        height: number
    ) {
        const mast =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.7,
                    height,
                    0.7
                ),
                this.createDarkMaterial()
            );

        mast.position.x = x;

        mast.position.y =
            10 + height / 2;

        mast.position.z = z;

        this.group.add(mast);

        /*
         * Crossbar.
         */
        const crossbar =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    6,
                    0.35,
                    0.35
                ),
                this.createDarkMaterial()
            );

        crossbar.position.x = x;

        crossbar.position.y =
            10 + height * 0.65;

        crossbar.position.z = z;

        this.group.add(
            crossbar
        );
    }

    // ==================================================
    // Missile system
    // ==================================================

    canFireMissile(): boolean {
        return (
            this.alive &&
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
                    10
                );

        launchPosition.y += 8;

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
    // CIWS system
    // ==================================================

    canFireCIWS(): boolean {
        return (
            this.alive &&
            this.ciwsFireInterval > 0 &&
            this.ciwsCooldown <= 0
        );
    }

    fireCIWS(): boolean {
        if (
            !this.canFireCIWS()
        ) {
            return false;
        }

        this.ciwsCooldown =
            this.ciwsFireInterval;

        return true;
    }

    /*
     * Returns the number of CIWS rounds that should
     * be fired during this frame.
     *
     * This is separate from fireCIWS().
     *
     * fireCIWS() controls the weapon's firing cadence,
     * while this method controls its enormous volume
     * of fire.
     */
    getCIWSRounds(
        dt: number
    ): number {
        if (
            !this.alive ||
            this.ciwsRoundsPerSecond <= 0
        ) {
            return 0;
        }

        this.ciwsRoundAccumulator +=
            this.ciwsRoundsPerSecond * dt;

        const rounds =
            Math.floor(
                this.ciwsRoundAccumulator
            );

        this.ciwsRoundAccumulator -=
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

        this.ciwsCooldown =
            Math.max(
                0,
                this.ciwsCooldown - dt
            );

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