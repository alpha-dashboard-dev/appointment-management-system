export function parseInclude(include: any) {

    if (!include) return [];

    const list = String(include || "")
            .split(",")
            .map(i => i.trim())
            .filter(Boolean);

    // console.log(list)

    return list.map(alias => ({
        alias,
        attributes: []
    }));
}