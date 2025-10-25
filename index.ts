import googlefonts from "./googlefonts.js";

interface GoogleFontVariant {
    tag: string;
    start: number;
    end: number;
}

interface GoogleFontItem {
    family: string;
    variants?: string[];
    axes?: GoogleFontVariant[];
}

interface GoogleFontsData {
    items: GoogleFontItem[];
}

interface GetGoogleFontURLOptions {
    googleFontsApi?: string | null;
    fetchLatest?: boolean;
}

const fetchGoogleFontsData = async (apiKey: string): Promise<GoogleFontItem[]> => {
    const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);

    if (response.ok) {
        const data: GoogleFontsData = await response.json();
        return data.items;
    } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch Google Fonts data from API: ${response.status} ${errorText}`);
    }
};

export const getGoogleFontURL = async (family: string, options: GetGoogleFontURLOptions = {}): Promise<string> => {
    if (!family || typeof family !== "string") {
        throw new Error("Font family must be a non-empty string");
    }

    const { googleFontsApi = null, fetchLatest = true } = options;

    let googleFontsData: GoogleFontItem[];

    if (googleFontsApi && fetchLatest) {
        try {
            googleFontsData = await fetchGoogleFontsData(googleFontsApi);
        } catch (error: any) {
            console.warn("Failed to fetch latest fonts, falling back to bundled data:", error.message);
            googleFontsData = googlefonts.items;
        }
    } else {
        googleFontsData = googlefonts.items;
    }

    if (!Array.isArray(googleFontsData)) {
        throw new Error("Invalid Google Fonts data structure");
    }

    const fontData = googleFontsData.find((font) => font.family === family);

    if (!fontData) {
        throw new Error(`Font family "${family}" not found in Google Fonts data`);
    }

    let fontUrl = "https://fonts.googleapis.com/css2?";
    const familyName = "family=" + fontData.family.replace(/ /g, "+");
    let variants = "";
    const fallback = "&display=swap";

    if (fontData.axes && fontData.axes.length > 0) {
        fontData.axes.sort((a, b) => {
            const aTag = a.tag;
            const bTag = b.tag;

            const aIsLower = /^[a-z]/.test(aTag);
            const bIsLower = /^[a-z]/.test(bTag);

            if (aIsLower && !bIsLower) return -1;
            if (!aIsLower && bIsLower) return 1;
            return aTag.localeCompare(bTag);
        });

        let axesList = "";
        let axesValues = "";

        fontData.axes.forEach((axis) => {
            axesList += axis.tag + ",";
            axesValues += axis.start + ".." + axis.end + ",";
        });

        axesList = axesList.slice(0, -1);
        axesValues = axesValues.slice(0, -1);

        if (fontData.variants && fontData.variants.includes("italic")) {
            variants = `:ital,${axesList}@0,${axesValues};1,${axesValues}`;
        } else {
            variants = `:${axesList}@${axesValues}`;
        }

        fontUrl += familyName + variants + fallback;
    } else {
        if (!fontData.variants || fontData.variants.length === 0) {
            fontUrl += familyName + fallback;
        } else {
            const hasItalic = fontData.variants.some((v) => v.toLowerCase().includes("italic"));
            const weights = [...new Set(fontData.variants.map((v) => v.replace("italic", "").trim()).filter((v) => v !== "regular" && v !== ""))];

            if (weights.length > 0) {
                const normalSet = weights.map((w) => `0,${w}`).join(";");
                const italicSet = hasItalic ? weights.map((w) => `1,${w}`).join(";") : "";
                variants = `:ital,wght@${normalSet}${hasItalic ? ";" + italicSet : ""}`;
            } else if (hasItalic) {
                variants = ":ital@0;1";
            }

            fontUrl += familyName + variants + fallback;
        }
    }

    return fontUrl;
};
