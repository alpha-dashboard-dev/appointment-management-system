export function toTitleCase(str = '') {
    return str
        .replaceAll('_', ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

export function toUpperLabel(str = '') {
    return str
        .replaceAll('_', ' ')
        .toUpperCase()
}