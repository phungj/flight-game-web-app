import * as THREE from "three";
import {Enemy} from "@/src/engine/enemy/enemy";
import {Missile} from "@/src/engine/missile";
import {Player} from "@/src/engine/player";
import {
    Target,
} from "@/src/engine/targeting";

export class GameHud {
    private root: HTMLDivElement;

    private reticle: HTMLDivElement;
    private leadIndicator: HTMLDivElement;

    private missileWarning: HTMLDivElement;
    private missileDirections: HTMLDivElement[] = [];

    private targetBox: HTMLDivElement;

    private targetHuds =
        new Map<
            Enemy,
            HTMLDivElement
        >();

    private readonly radarSize = 512;

    private radar: HTMLDivElement;
    private radarLabel: HTMLDivElement;
    private radarPlayer: HTMLDivElement;

    private radarContacts: {
        enemy: Enemy;
        marker: HTMLDivElement;
    }[] = [];

    private radarEnemyMissileMarkers:
        HTMLDivElement[] = [];

    private radarPlayerMissileMarkers:
        HTMLDivElement[] = [];

    constructor(container: HTMLElement) {
        this.root = document.createElement("div");

        this.root.style.position = "absolute";
        this.root.style.inset = "0";
        this.root.style.pointerEvents = "none";

        container.appendChild(this.root);

        this.reticle =
            this.createReticle();

        this.leadIndicator =
            this.createLeadIndicator();

        this.missileWarning =
            this.createMissileWarning();

        this.targetBox =
            this.createTargetBox();

        this.createRadar();
    }

    // --------------------------------------------------
    // Reticle
    // --------------------------------------------------

    private createReticle() {
        const reticle =
            document.createElement("div");

        reticle.style.position =
            "absolute";

        reticle.style.left =
            "50%";

        reticle.style.top =
            "50%";

        reticle.style.width =
            "18px";

        reticle.style.height =
            "18px";

        reticle.style.border =
            "2px solid white";

        reticle.style.transform =
            "translate(-50%, -50%)";

        reticle.style.pointerEvents =
            "none";

        this.root.appendChild(
            reticle
        );

        return reticle;
    }

    setReticleVisible(visible: boolean) {
        this.reticle.style.display =
            visible ? "" : "none";
    }

    // --------------------------------------------------
    // Lead indicator
    // --------------------------------------------------

    private createLeadIndicator() {
        const leadIndicator =
            document.createElement("div");

        leadIndicator.style.position =
            "absolute";

        leadIndicator.style.width =
            "30px";

        leadIndicator.style.height =
            "30px";

        leadIndicator.style.border =
            "2px solid white";

        leadIndicator.style.borderRadius =
            "50%";

        leadIndicator.style.transform =
            "translate(-50%, -50%)";

        leadIndicator.style.pointerEvents =
            "none";

        leadIndicator.style.display =
            "none";

        leadIndicator.style.boxSizing =
            "border-box";

        this.root.appendChild(
            leadIndicator
        );

        return leadIndicator;
    }

    showLeadIndicator(
        x: number,
        y: number
    ) {
        this.leadIndicator.style.left =
            `${x}px`;

        this.leadIndicator.style.top =
            `${y}px`;

        this.leadIndicator.style.display =
            "block";
    }

    hideLeadIndicator() {
        this.leadIndicator.style.display =
            "none";
    }

    // --------------------------------------------------
    // Missile warning
    // --------------------------------------------------

    private createMissileWarning() {
        const missileWarning =
            document.createElement("div");

        missileWarning.style.position =
            "absolute";

        missileWarning.style.left =
            "50%";

        missileWarning.style.top =
            "80%";

        missileWarning.style.transform =
            "translate(-50%, -50%)";

        missileWarning.style.color =
            "red";

        missileWarning.style.fontFamily =
            "monospace";

        missileWarning.style.fontSize =
            "24px";

        missileWarning.style.fontWeight =
            "bold";

        missileWarning.style.textAlign =
            "center";

        missileWarning.style.pointerEvents =
            "none";

        missileWarning.style.zIndex =
            "20";

        missileWarning.style.textShadow =
            "0 0 4px black";

        missileWarning.style.display =
            "none";

        this.root.appendChild(
            missileWarning
        );

        return missileWarning;
    }

    // --------------------------------------------------
    // Missile directions
    // --------------------------------------------------

    private createMissileDirection() {
        const missileDirection =
            document.createElement("div");

        missileDirection.style.position =
            "absolute";

        missileDirection.style.left =
            "50%";

        missileDirection.style.top =
            "50%";

        missileDirection.style.width =
            "0";

        missileDirection.style.height =
            "0";

        missileDirection.style.borderLeft =
            "12px solid transparent";

        missileDirection.style.borderRight =
            "12px solid transparent";

        missileDirection.style.borderBottom =
            "24px solid red";

        missileDirection.style.transformOrigin =
            "50% 50%";

        missileDirection.style.pointerEvents =
            "none";

        missileDirection.style.zIndex =
            "20";

        missileDirection.style.filter =
            "drop-shadow(0 0 3px black)";

        missileDirection.style.display =
            "none";

        this.root.appendChild(
            missileDirection
        );

        return missileDirection;
    }

    private ensureMissileDirections(
        count: number
    ) {
        while (
            this.missileDirections.length <
            count
            ) {
            this.missileDirections.push(
                this.createMissileDirection()
            );
        }
    }

    updateMissileWarning(
        missilePositions: THREE.Vector3[],
        playerPosition: THREE.Vector3,
        playerQuaternion: THREE.Quaternion
    ) {
        if (missilePositions.length === 0) {
            this.hideMissileWarning();
            return;
        }

        this.ensureMissileDirections(
            missilePositions.length
        );

        this.missileWarning.style.display =
            "block";

        this.missileWarning.style.color =
            "red";

        this.missileWarning.textContent =
            missilePositions.length === 1
                ? "MISSILE"
                : `MISSILES × ${missilePositions.length}`;

        const centerX =
            window.innerWidth / 2;

        const centerY =
            window.innerHeight / 2;

        const radius =
            Math.min(
                centerX,
                centerY
            ) * 0.7;

        for (
            let i = 0;
            i < this.missileDirections.length;
            i++
        ) {
            const arrow =
                this.missileDirections[i];

            const missile =
                missilePositions[i];

            if (!missile) {
                arrow.style.display =
                    "none";

                continue;
            }

            const toMissile =
                missile
                    .clone()
                    .sub(playerPosition)
                    .normalize();

            const localMissile =
                toMissile
                    .clone()
                    .applyQuaternion(
                        playerQuaternion
                            .clone()
                            .invert()
                    );

            const angle =
                Math.atan2(
                    localMissile.x,
                    -localMissile.z
                );

            const x =
                centerX +
                Math.sin(angle) *
                radius;

            const y =
                centerY -
                Math.cos(angle) *
                radius;

            arrow.style.left =
                `${x}px`;

            arrow.style.top =
                `${y}px`;

            arrow.style.transform =
                `translate(-50%, -50%) rotate(${angle}rad)`;

            arrow.style.display =
                "block";
        }
    }

    hideMissileWarning() {
        this.missileWarning.style.display =
            "none";

        this.hideMissileDirections();
    }

    private hideMissileDirections() {
        for (
            const arrow of
            this.missileDirections
            ) {
            arrow.style.display =
                "none";
        }
    }

    private createTargetHud(
        enemy: Enemy
    ) {
        const hud =
            document.createElement(
                "div"
            );

        hud.style.position =
            "absolute";

        hud.style.zIndex =
            "10";

        hud.style.color =
            enemy.team ===
            "friendly"
                ? "blue"
                : "red";

        hud.style.fontFamily =
            "monospace";

        hud.style.fontSize =
            "18px";

        hud.style.fontWeight =
            "bold";

        hud.style.textAlign =
            "center";

        hud.style.whiteSpace =
            "pre";

        hud.style.pointerEvents =
            "none";

        hud.style.textShadow =
            "0 0 4px black";

        hud.style.display =
            "none";

        this.root.appendChild(
            hud
        );

        return hud;
    }

    hideTargetHud(
        enemy: Enemy
    ) {
        const hud =
            this.targetHuds.get(enemy);

        if (!hud) {
            return;
        }

        hud.style.display =
            "none";
    }

    addTarget(enemy: Enemy) {
        this.targetHuds.set(
            enemy,
            this.createTargetHud(enemy)
        );
    }

    removeTarget(enemy: Enemy) {
        const hud =
            this.targetHuds.get(enemy);

        if (!hud) {
            return;
        }

        hud.remove();

        this.targetHuds.delete(
            enemy
        );
    }

    updateTargetHud(
        targetEnemy: Enemy,
        name: string,
        selected: boolean,
        targetLocked: boolean,
        camera: THREE.Camera,
        playerPosition: THREE.Vector3
    ) {
        const hud =
            this.targetHuds.get(
                targetEnemy
            );

        if (!hud) {
            return;
        }

        const projected =
            targetEnemy.position
                .clone()
                .project(camera);

        const halfWidth =
            window.innerWidth / 2;

        const halfHeight =
            window.innerHeight / 2;

        const screenX =
            projected.x *
            halfWidth +
            halfWidth;

        const screenY =
            -projected.y *
            halfHeight +
            halfHeight;

        const onScreen =
            projected.z >= -1 &&
            projected.z <= 1 &&
            screenX >= 0 &&
            screenX <=
            window.innerWidth &&
            screenY >= 0 &&
            screenY <=
            window.innerHeight;

        const distance =
            targetEnemy.position.distanceTo(
                playerPosition
            );

        hud.style.display =
            "block";

        if (onScreen) {
            hud.style.left =
                `${screenX}px`;

            hud.style.top =
                `${screenY}px`;

            hud.style.transform =
                "translate(-50%, -50%)";

            if (
                selected &&
                targetLocked
            ) {
                hud.textContent =
                    `◇ LOCK ${name}\n${distance.toFixed(0)}`;
            } else {
                hud.textContent =
                    `◇ ${name}\n${distance.toFixed(0)}`;
            }
        } else {
            const dx =
                screenX -
                halfWidth;

            const dy =
                screenY -
                halfHeight;

            const angle =
                Math.atan2(
                    dy,
                    dx
                );

            const margin =
                40;

            const radius =
                Math.min(
                    halfWidth,
                    halfHeight
                ) - margin;

            const markerX =
                halfWidth +
                Math.cos(angle) *
                radius;

            const markerY =
                halfHeight +
                Math.sin(angle) *
                radius;

            hud.style.left =
                `${markerX}px`;

            hud.style.top =
                `${markerY}px`;

            hud.textContent =
                selected &&
                targetLocked
                    ? "◇ LOCK"
                    : `◇ ${name}`;
        }
    }

    private createTargetBox() {
        const targetBox =
            document.createElement(
                "div"
            );

        targetBox.style.position =
            "fixed";

        targetBox.style.width =
            "70px";

        targetBox.style.height =
            "70px";

        targetBox.style.border =
            "2px solid red";

        targetBox.style.transform =
            "translate(-50%, -50%)";

        targetBox.style.pointerEvents =
            "none";

        targetBox.style.boxSizing =
            "border-box";

        targetBox.style.zIndex =
            "9";

        targetBox.style.display =
            "none";

        this.root.appendChild(
            targetBox
        );

        return targetBox;
    }

    updateTargetBox(
        targetEnemy: Enemy,
        camera: THREE.Camera
    ) {
        const projected =
            targetEnemy.position
                .clone()
                .project(camera);

        const halfWidth =
            window.innerWidth / 2;

        const halfHeight =
            window.innerHeight / 2;

        const screenX =
            projected.x *
            halfWidth +
            halfWidth;

        const screenY =
            -projected.y *
            halfHeight +
            halfHeight;

        const onScreen =
            projected.z >= -1 &&
            projected.z <= 1 &&
            screenX >= 0 &&
            screenX <=
            window.innerWidth &&
            screenY >= 0 &&
            screenY <=
            window.innerHeight;

        let boxX =
            screenX;

        let boxY =
            screenY;

        if (!onScreen) {
            const dx =
                screenX -
                halfWidth;

            const dy =
                screenY -
                halfHeight;

            const angle =
                Math.atan2(
                    dy,
                    dx
                );

            const margin =
                40;

            const radius =
                Math.min(
                    halfWidth,
                    halfHeight
                ) -
                margin;

            boxX =
                halfWidth +
                Math.cos(angle) *
                radius;

            boxY =
                halfHeight +
                Math.sin(angle) *
                radius;
        }

        this.targetBox.style.left =
            `${boxX}px`;

        this.targetBox.style.top =
            `${boxY}px`;

        this.targetBox.style.display =
            "block";
    }

    hideTargetBox() {
        this.targetBox.style.display =
            "none";
    }

    private createRadar() {
        const radar =
            document.createElement("div");

        radar.style.position =
            "fixed";

        radar.style.left =
            "28px";

        radar.style.bottom =
            "28px";

        radar.style.width =
            `${this.radarSize}px`;

        radar.style.height =
            `${this.radarSize}px`;

        radar.style.border =
            "2px solid rgba(255, 255, 255, 0.65)";

        radar.style.borderRadius =
            "50%";

        radar.style.background =
            "rgba(0, 0, 0, 0.35)";

        radar.style.boxSizing =
            "border-box";

        radar.style.pointerEvents =
            "none";

        radar.style.zIndex =
            "10";

        radar.style.overflow =
            "hidden";

        this.root.appendChild(radar);

        const radarGrid =
            document.createElement("div");

        radarGrid.style.position =
            "absolute";

        radarGrid.style.left =
            "0";

        radarGrid.style.top =
            "0";

        radarGrid.style.width =
            "100%";

        radarGrid.style.height =
            "100%";

        radarGrid.style.pointerEvents =
            "none";

        radar.appendChild(radarGrid);

        for (const fraction of [
            0.25,
            0.5,
            0.75,
        ]) {
            const circle =
                document.createElement("div");

            const diameter =
                this.radarSize * fraction;

            circle.style.position =
                "absolute";

            circle.style.width =
                `${diameter}px`;

            circle.style.height =
                `${diameter}px`;

            circle.style.left =
                `${this.radarSize / 2 - diameter / 2}px`;

            circle.style.top =
                `${this.radarSize / 2 - diameter / 2}px`;

            circle.style.border =
                "1px solid rgba(255, 255, 255, 0.15)";

            circle.style.borderRadius =
                "50%";

            circle.style.boxSizing =
                "border-box";

            radarGrid.appendChild(circle);
        }

        const radarHorizontal =
            document.createElement("div");

        radarHorizontal.style.position =
            "absolute";

        radarHorizontal.style.left =
            "0";

        radarHorizontal.style.top =
            "50%";

        radarHorizontal.style.width =
            "100%";

        radarHorizontal.style.height =
            "1px";

        radarHorizontal.style.background =
            "rgba(255, 255, 255, 0.15)";

        radarGrid.appendChild(radarHorizontal);

        const radarVertical =
            document.createElement("div");

        radarVertical.style.position =
            "absolute";

        radarVertical.style.left =
            "50%";

        radarVertical.style.top =
            "0";

        radarVertical.style.width =
            "1px";

        radarVertical.style.height =
            "100%";

        radarVertical.style.background =
            "rgba(255, 255, 255, 0.15)";

        radarGrid.appendChild(radarVertical);

        this.radarPlayer =
            document.createElement("div");

        this.radarPlayer.style.position =
            "absolute";

        this.radarPlayer.style.left =
            "50%";

        this.radarPlayer.style.top =
            "50%";

        this.radarPlayer.style.width =
            "0";

        this.radarPlayer.style.height =
            "0";

        this.radarPlayer.style.borderLeft =
            "8px solid transparent";

        this.radarPlayer.style.borderRight =
            "8px solid transparent";

        this.radarPlayer.style.borderBottom =
            "16px solid white";

        this.radarPlayer.style.transform =
            "translate(-50%, -50%)";

        this.radarPlayer.style.zIndex =
            "3";

        radar.appendChild(this.radarPlayer);

        this.radarLabel =
            document.createElement("div");

        this.radarLabel.style.position =
            "absolute";

        this.radarLabel.style.left =
            "50%";

        this.radarLabel.style.top =
            "8px";

        this.radarLabel.style.transform =
            "translateX(-50%)";

        this.radarLabel.style.color =
            "rgba(255, 255, 255, 0.65)";

        this.radarLabel.style.fontFamily =
            "monospace";

        this.radarLabel.style.fontSize =
            "12px";

        this.radarLabel.style.zIndex =
            "4";

        radar.appendChild(this.radarLabel);

        this.radar =
            radar;
    }

    addRadarContact(enemy: Enemy) {
        const marker =
            document.createElement("div");

        marker.style.position =
            "absolute";

        marker.style.width =
            "10px";

        marker.style.height =
            "10px";

        marker.style.borderRadius =
            "50%";

        marker.style.transform =
            "translate(-50%, -50%)";

        marker.style.display =
            "none";

        marker.style.zIndex =
            "2";

        marker.style.background =
            enemy.team === "friendly"
                ? "blue"
                : "red";

        this.radar.appendChild(marker);

        this.radarContacts.push({
            enemy,
            marker,
        });
    }

    private createRadarMissileMarker(
        enemyMissile: boolean
    ) {
        const marker =
            document.createElement("div");

        marker.style.position =
            "absolute";

        marker.style.width =
            "9px";

        marker.style.height =
            "9px";

        marker.style.transform =
            "translate(-50%, -50%)";

        marker.style.display =
            "none";

        marker.style.zIndex =
            "2";

        if (enemyMissile) {
            marker.style.background =
                "red";

            marker.style.clipPath =
                "polygon(50% 0%, 100% 100%, 0% 100%)";
        } else {
            marker.style.background =
                "white";

            marker.style.borderRadius =
                "50%";
        }

        this.radar.appendChild(marker);

        return marker;
    }

    private ensureRadarMissileMarkers(
        missileList: Missile[],
        markers: HTMLDivElement[],
        enemyMissile: boolean
    ) {
        while (
            markers.length <
            missileList.length
            ) {
            markers.push(
                this.createRadarMissileMarker(
                    enemyMissile
                )
            );
        }
    }

    updateRadar(
        player: Player,
        enemies: Enemy[],
        target: Target | undefined,
        incomingMissiles: Missile[]
    ) {
        if (!player.alive) {
            this.radar.style.display = "none";
            return;
        }

        this.radar.style.display = "block";

        const radarCenter =
            this.radarSize / 2;

        const radarRadius =
            this.radarSize / 2;

        let nearestEnemyDistance =
            Infinity;

        for (const enemy of enemies) {
            if (!enemy.alive) {
                continue;
            }

            const distance =
                enemy.position.distanceTo(
                    player.position
                );

            nearestEnemyDistance =
                Math.min(
                    nearestEnemyDistance,
                    distance
                );
        }

        const radarRange =
            Number.isFinite(
                nearestEnemyDistance
            )
                ? Math.max(
                    1000,
                    Math.ceil(
                        nearestEnemyDistance /
                        1000
                    ) * 1000
                )
                : 1000;

        this.radarLabel.textContent =
            `RADAR ${(
                radarRange /
                1000
            ).toFixed(0)} KM`;

        const heading =
            player.rotation.y;

        const forwardX =
            -Math.sin(heading);

        const forwardZ =
            -Math.cos(heading);

        const rightX =
            Math.cos(heading);

        const rightZ =
            -Math.sin(heading);

        const updateRadarPosition =
            (
                position: THREE.Vector3,
                marker: HTMLDivElement
            ) => {
                const dx =
                    position.x -
                    player.position.x;

                const dz =
                    position.z -
                    player.position.z;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dz * dz
                    );

                if (
                    distance >
                    radarRange
                ) {
                    marker.style.display =
                        "none";

                    return;
                }

                const right =
                    dx * rightX +
                    dz * rightZ;

                const forward =
                    dx * forwardX +
                    dz * forwardZ;

                const x =
                    radarCenter +
                    (right /
                        radarRange) *
                    radarRadius;

                const y =
                    radarCenter -
                    (forward /
                        radarRange) *
                    radarRadius;

                marker.style.left =
                    `${x}px`;

                marker.style.top =
                    `${y}px`;

                marker.style.display =
                    "block";
            };

        for (const contact of this.radarContacts) {
            const enemy =
                contact.enemy;

            const marker =
                contact.marker;

            if (!enemy.alive) {
                marker.style.display =
                    "none";

                continue;
            }

            updateRadarPosition(
                enemy.position,
                marker
            );

            marker.style.background =
                enemy.team === "friendly"
                    ? "blue"
                    : "red";

            if (
                target &&
                target.enemy === enemy
            ) {
                marker.style.width =
                    "10px";

                marker.style.height =
                    "10px";

                marker.style.border =
                    "2px solid white";

                marker.style.borderRadius =
                    "50%";

                marker.style.clipPath =
                    "none";
            } else {
                marker.style.width =
                    "8px";

                marker.style.height =
                    "8px";

                marker.style.border =
                    "none";

                marker.style.borderRadius =
                    "50%";

                marker.style.clipPath =
                    "none";
            }
        }

        this.ensureRadarMissileMarkers(
            incomingMissiles,
            this.radarEnemyMissileMarkers,
            true
        );

        for (
            let i = 0;
            i < this.radarEnemyMissileMarkers.length;
            i++
        ) {
            const marker =
                this.radarEnemyMissileMarkers[i];

            const missile =
                incomingMissiles[i];

            if (!missile) {
                marker.style.display =
                    "none";

                continue;
            }

            updateRadarPosition(
                missile.position,
                marker
            );
        }
    }

    // --------------------------------------------------
    // General
    // --------------------------------------------------

    hide() {
        this.root.style.display = "none";
    }

    show() {
        this.root.style.display = "";
    }

    destroy() {
        this.root.remove();
    }
}