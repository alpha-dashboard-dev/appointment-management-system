const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function normalizeDateOnly(input: any): string {
    if (!input) throw new Error("Appointment has invalid date");

    if (input instanceof Date) {
        if (isNaN(input.getTime())) throw new Error("Appointment has invalid date");
        return input.toISOString().split("T")[0];
    }

    const text = String(input).trim();
    const datePart = text.includes("T") ? text.split("T")[0] : text;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (!m) {
        const parsed = new Date(text);
        if (isNaN(parsed.getTime())) throw new Error("Appointment has invalid date");
        return parsed.toISOString().split("T")[0];
    }

    return datePart;
}

function getWorkingDayFromDate(input: any): string {
    const dateOnly = normalizeDateOnly(input);
    const [year, month, day] = dateOnly.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return DAYS_OF_WEEK[utcDate.getUTCDay()];
}

function normalizeTimeToHHMM(input: any, label: "startTime" | "endTime"): string {
    const raw = input == null ? "" : String(input).trim();
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(raw);
    if (!match) {
        throw new Error(`Invalid ${label} format. Use HH:MM`);
    }
    return `${match[1]}:${match[2]}`;
}

function normalizeTimeToHHMMSS(input: any): string {
    const raw = input == null ? "" : String(input).trim();
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(raw);
    if (!match) return raw;
    return `${match[1]}:${match[2]}:${match[3] || "00"}`;
}


export {
    normalizeTimeToHHMMSS,
    normalizeTimeToHHMM,
    getWorkingDayFromDate,
    normalizeDateOnly
}