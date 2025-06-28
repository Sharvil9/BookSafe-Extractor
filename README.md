
# Book Scribe Clip Extract

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178c6.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## Overview

**BookSafe-Extractor** is a secure, fast, and privacy-focused tool for extracting and processing book content directly on your device. All processing happens locally—no data ever leaves your machine. This ensures your information is private and stays in your control. The project is designed to be simple to use, efficient, and robust for a variety of book content extraction tasks.

![front](https://github.com/user-attachments/assets/d501362e-b5e8-43e0-a841-a699b88fd6cb)

---

## What Can This Project Do?

![edit](https://github.com/user-attachments/assets/7e7ca85c-7b44-4dd4-8488-27917bc2c0e8)

- **Extract Text Content:** Quickly extract text from your book files or supported sources.
- **Instant Processing:** All operations run on your device, ensuring speed and privacy.
- **Easy to Use:** Straightforward interface with minimal setup and dependencies.
- **Secure:** No information is sent to any server; your data remains yours at all times.

![grid](https://github.com/user-attachments/assets/bd835b85-48d7-4962-8f4b-0306a6f1d09b)

---

## Tech Stack

- **TypeScript** – Main application logic
- **React** – User interface
- **Vite** – Fast build tooling
- **shadcn-ui** & **Tailwind CSS** – Styling and UI components

---

## Quick Start

To get up and running with **BookSafe Extractor**, follow these steps:

```bash
# Clone the repository
git clone https://github.com/Sharvil9/BookSafe-Extractor.git

# Navigate into the project directory
cd BookSafe-Extractor

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.
---

## Usage

1. **Launch** the app locally.
2. **Load** your book file or content.
3. **Extract** the text content you need.
4. **Copy or use** the results directly.

---

## Configuration

- Edit configuration files to adjust file paths and processing preferences.
- No network setup required: all processing is local.

---

## FAQ & Troubleshooting

- **Q:** Is any of my book data sent to a server?  
  **A:** No. All processing is done on your device for complete privacy.

- **Q:** What file formats are supported?  
  **A:** By default: PDF, EPUB, and TXT. Check documentation for updates; open an issue to suggest more formats.(sometimes it bug outs)

- **Q:** The application won’t start. What should I do?  
  **A:** Make sure you have Node.js (v18+) and npm installed. Run `npm install` again to ensure dependencies are set up.

- **Q:** My extracted files are empty or missing content.  
  **A:** Ensure your source file is supported and not corrupted. If the problem persists, open an issue with file details (no sensitive info).

- **Q:** I get a “Cannot write to output directory” error.  
  **A:** Make sure the output directory exists and you have write permissions. You can change the directory in the configuration.

- **Q:** How do I change the output folder?  
  **A:** Edit `outputDir` in your configuration file (see CONFIGURATION.md) or use an environment variable.

- **Q:** Can I use BookSafe Extractor on Mac, Windows, or Linux?  
  **A:** Yes, it is cross-platform and should work on any OS with Node.js and npm.

- **Q:** How do I update to the latest version?  
  **A:** Pull the latest changes from GitHub and run `npm install` to get new dependencies.

- **Q:** How can I contribute or request a feature?  
  **A:** See [CONTRIBUTING.md](./CONTRIBUTING.md) for details, or open an issue/discussion on GitHub.(don't expect me to respond though.)

- **Q:** How do I reset all my settings to default?  
  **A:** Delete or rename your configuration file, and the app will generate a new one with defaults.

For further help, please open an [Issue](https://github.com/Sharvil9/BookSafe-Extractor/issues).

---

## Documentation

**Which files are necessary and useful?**

- **CONFIGURATION.md** – Useful. Explains how to customize settings and adjust file paths, formats, or behaviors.
- **CONTRIBUTING.md** – Useful if you want others to help improve or fix the project; explains how to contribute, coding style, etc.
- **CHANGELOG.md** – Useful for tracking what’s changed between versions, especially if others depend on your tool.
- **SECURITY.md** – Less critical for a local-only, non-networked tool, but still good practice if you want to show you care about privacy and responsible disclosure.

If you want to keep things minimal: keep CONFIGURATION.md and CONTRIBUTING.md at a minimum, and add CHANGELOG.md if you expect regular updates.

---

## Acknowledgements

- Thanks to Me myself and Lovable.dev as well for bringing this to life.

---

## Contact & Community

- [GitHub Issues](https://github.com/Sharvil9/BookSafe-Extractor/issues)
- [Discussions](https://github.com/Sharvil9/BookSafe-Extractor/discussions)
