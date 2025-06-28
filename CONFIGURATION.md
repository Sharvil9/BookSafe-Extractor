# Configuration Guide

Welcome to the configuration guide for **BookSafe Extractor**. This document explains how to customize your setup for an optimal, private, and efficient book extraction experience.

---

## Default Settings

| Option             | Default                 | Description                                  |
|--------------------|------------------------|----------------------------------------------|
| Output Directory   | `./output`             | Where extracted content is saved             |
| Supported Formats  | `.pdf, .epub, .txt`    | File types you can load/extract              |
| Language           | `en`                   | Default interface language                   |
| Processing Mode    | `local`                | All processing happens on your device        |

---

## Setup Instructions

1. **Open the Configuration File**
   - Located at `config/default.json` or similar.
2. **Edit Parameters**
   - Use your preferred text editor to change values, e.g.:
     ```json
     {
       "outputDir": "./my-book-extracts",
       "language": "en"
     }
     ```
3. **Save and Restart**
   - Save your changes and restart the app to apply them.

---

## Examples

- **Change Output Directory:**
  ```json
  { "outputDir": "./my-extracts" }

Switch Language:
{ "language": "fr" }


Advanced Tips
Environment Variables:
Override config by setting environment variables, e.g., BOOKSAFE_OUTPUT=./secure.

CLI Flags:
Run with --output ./secure to change output directory for a session.

Troubleshooting
Issue: “Cannot write to output directory.”
Solution: Ensure the directory exists and you have write permissions.

Issue: “File format not supported.”
Solution: Check the list of supported formats and suggest new ones via GitHub Issues.


  
