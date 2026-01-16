export function positionElements(container, aspecRatio) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = vw;
    let height = width * (1 / aspecRatio);

    if (height > vh) {
        height = vh;
        width = height * aspecRatio;
    }

    for (const element of container.children) {
        element.style.position = "absolute";
        element.style.width = width + "px";
        element.style.height = height + "px";
        element.style.left = (vw - width) / 2 + "px";
        element.style.top = (vh - height) / 2 + "px";
    }
}