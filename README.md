# Google Fonts URL Generator

Easily generate Google Fonts URLs that include every style of a font family - weights, widths, and other variants. Simply provide a font name to get a URL that fetches the complete set of styles.

No more manually constructing complex URLs!

## Installation

```bash
npm install google-fonts-url-generator
```

## Usage

```javascript
import { getGoogleFontURL } from "google-fonts-url-generator";

const fontURL = await getGoogleFontURL("Roboto");
```

generates the following URL:

```
https://fonts.googleapis.com/css2?family=Roboto:ital,wdth,wght@0,75..100,100..900;1,75..100,100..900&display=swap
```

Note: Font Family name should be the same as listed on [Google Fonts](https://fonts.google.com/).

## Options

### `googleFontsApi`

By default, the package comes with bundled Google Fonts data, which is updated monthly. If you want to fetch the latest data from the Google Fonts API, provide your API key here. You can get an API key from - [Google Fonts API](https://developers.google.com/fonts/docs/developer_api#APIKey)

#### Example:

```javascript
const fontURL = await getGoogleFontURL("Roboto", {
    googleFontsApi: "YOUR_API_KEY_HERE",
});
```

### `fetchLatest`

This is `true` by default when `googleFontsApi` is provided, so it doesn’t need to be set explicitly. Set it to `false` if you want to use the bundled font data even when an API key is provided. Useful for testing purposes.

#### Example:

```javascript
const fontURL = await getGoogleFontURL("Roboto", {
    googleFontsApi: "YOUR_API_KEY_HERE",
    fetchLatest: false, // Use bundled data instead of API
});
```
