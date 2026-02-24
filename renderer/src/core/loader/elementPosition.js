export function positionElements(container, aspecRatio) {

    for (const element of container.children) {
        element.style.position = "absolute";
        element.style.width = "100vw";
        element.style.height = "100vh";
        element.style.left = 0;
        element.style.top = 0;
    }
}