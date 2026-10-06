export class GameHud {
    private reticle: HTMLDivElement;
    private radar: HTMLDivElement;
    private targetHuds: HTMLDivElement[] = [];

    constructor() {
        // --------------------------------------------------
        // Reticle
        // --------------------------------------------------

        const reticle =
            document.createElement(
                "div"
            );

        reticle.style.position =
            "fixed";

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

        document.body.appendChild(
            reticle
        );


    }

    update(...) {
        // Update HUD elements
    }

    destroy() {
        // Remove HUD elements
    }
}