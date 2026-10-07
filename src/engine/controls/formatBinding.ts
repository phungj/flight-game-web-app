export function formatBinding(
    code: string
) {
    switch (code) {
        case "KeyW":
            return "W";

        case "KeyS":
            return "S";

        case "KeyA":
            return "A";

        case "KeyD":
            return "D";

        case "KeyQ":
            return "Q";

        case "KeyE":
            return "E";

        case "KeyF":
            return "F";

        case "KeyR":
            return "R";

        case "ShiftLeft":
        case "ShiftRight":
            return "SHIFT";

        case "ControlLeft":
        case "ControlRight":
            return "CTRL";

        case "Space":
            return "SPACE";

        case "Tab":
            return "TAB";

        case "Escape":
            return "ESC";

        case "ArrowUp":
            return "↑";

        case "ArrowDown":
            return "↓";

        case "ArrowLeft":
            return "←";

        case "ArrowRight":
            return "→";

        default:
            return code;
    }
}

export function formatBindings(
    bindings: string[]
) {
    return [
        ...new Set(
            bindings.map(
                formatBinding
            )
        ),
    ].join(" / ");
}
