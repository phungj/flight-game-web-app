import * as THREE from "three";
import {Enemy} from "@/src/engine/enemy/enemy";

export class GameHud {
    private root: HTMLDivElement;

    private reticle: HTMLDivElement;
    private leadIndicator: HTMLDivElement;

    private missileWarning: HTMLDivElement;
    private missileDirections: HTMLDivElement[] = [];

    private targetHuds =
        new Map<
            Enemy,
            HTMLDivElement
        >();

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
            "fixed";

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
            "fixed";

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
            "fixed";

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
        missiles: THREE.Vector3[],
        playerPosition: THREE.Vector3,
        playerQuaternion: THREE.Quaternion
    ) {
        if (missiles.length === 0) {
            this.hideMissileWarning();
            return;
        }

        this.ensureMissileDirections(
            missiles.length
        );

        this.missileWarning.style.display =
            "block";

        this.missileWarning.style.color =
            "red";

        this.missileWarning.textContent =
            missiles.length === 1
                ? "MISSILE"
                : `MISSILES × ${missiles.length}`;

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
                missiles[i];

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
            "fixed";

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

    showTargetHud(
        enemy: Enemy,
        x: number,
        y: number,
        text: string
    ) {
        const hud =
            this.targetHuds.get(enemy);

        if (!hud) {
            return;
        }

        hud.style.left =
            `${x}px`;

        hud.style.top =
            `${y}px`;

        hud.textContent =
            text;

        hud.style.display =
            "block";
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