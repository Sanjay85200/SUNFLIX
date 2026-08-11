/**
 * Reusable Date Normalization Utility for SUNFLIX
 * Defensively converts any date input (string, number, Date, null, undefined, object)
 * into a safe release year string or normalized date string without throwing errors.
 */

/**
 * Safely extracts a 4-digit release year string from any date type.
 * @param {string|number|Date|Object|null|undefined} releaseDate 
 * @returns {string} Clean release year (e.g., "2024") or empty string ""
 */
export function getReleaseYear(releaseDate) {
    if (releaseDate === null || releaseDate === undefined) return "";

    if (typeof releaseDate === "number") {
        return String(releaseDate);
    }

    if (typeof releaseDate === "string") {
        const trimmed = releaseDate.trim();
        if (!trimmed) return "";
        // Handle ISO strings (2024-05-12T...), YYYY-MM-DD, or YYYY/MM/DD
        const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) return yearMatch[0];
        const firstPart = trimmed.split(/[-/]/)[0]?.trim();
        return firstPart || "";
    }

    if (releaseDate instanceof Date && !isNaN(releaseDate.getTime())) {
        return String(releaseDate.getFullYear());
    }

    if (typeof releaseDate === "object") {
        if (releaseDate.year) return String(releaseDate.year);
        if (releaseDate.release_date) return getReleaseYear(releaseDate.release_date);
    }

    return "";
}

/**
 * Standardizes any date input into a clean string or null.
 * @param {string|number|Date|Object|null|undefined} dateInput 
 * @returns {string|null} Standardized string or null
 */
export function normalizeReleaseDate(dateInput) {
    if (dateInput === null || dateInput === undefined) return null;

    if (typeof dateInput === "number") {
        return String(dateInput);
    }

    if (typeof dateInput === "string") {
        const trimmed = dateInput.trim();
        return trimmed || null;
    }

    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        return dateInput.toISOString().split('T')[0];
    }

    return String(dateInput);
}

export default {
    getReleaseYear,
    normalizeReleaseDate
};
