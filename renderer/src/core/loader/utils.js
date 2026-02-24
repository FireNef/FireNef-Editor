export async function fetchLocal(path) {
    const response = await fetch(path);
    const text = await response.text();
    return text;
}

export async function fetchLocalJSON(path) {
    const text = await fetchLocal(path);
    return JSON.parse(text);
}
