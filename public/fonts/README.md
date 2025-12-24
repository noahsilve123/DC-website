# Fonts

This project expects the **Coves** font to be available as local `.woff2` files.

## Add these files

Place the following files in this folder:

- `Coves-Regular.woff2` (weight 400)
- `Coves-Bold.woff2` (weight 700)

## What uses Coves

- Site title
- Navigation links
- Headings (`h1`–`h6`)

If the files are missing, the site will automatically fall back to the system UI font stack.

## Download helper (optional)

If you have a licensed source that provides direct `.woff2` URLs, you can use:

- `scripts/download-coves-fonts.mjs`

PowerShell example:

- ` $env:COVES_REGULAR_URL="https://.../Coves-Regular.woff2"; $env:COVES_BOLD_URL="https://.../Coves-Bold.woff2"; node scripts/download-coves-fonts.mjs `

Only use this if you have the right to use and redistribute the font files.
