# STText-Flow 🌊

**Drop it. We’ll write it.**

STText-Flow is a modern, Gen-Z coded Speech-to-Text application powered by Google's latest **Gemini 3** models. It handles audio and video up to 1 hour with professional-grade bilingual transcription accuracy, wrapped in a vibe-checked dark mode UI.

## Features ✨

- **Bilingual Detection**: Automatically detects and transcribes mixed-language conversations. No cap.
- **Deep Dark Mode**: A UI that respects your retinas.
- **Heavy Lifting**: Supports files up to 400MB or 1 Hour in duration.
- **Gemini Powered**: Switches between `gemini-3-flash` for speed and `gemini-3-pro` for maximum fidelity.

## Tech Stack 🛠️

- **Frontend**: React 19, Tailwind CSS
- **AI**: Google GenAI SDK (`@google/genai`)
- **Vibe**: Immaculate

## Setup & Usage

1. **API Key**: This app requires a Google Gemini API Key.
   - The key is accessed via `process.env.API_KEY`.
   - Ensure your environment provides this variable.

2. **Running**:
   - This is a static React application using ES Modules.
   - It relies on `importmap` for dependencies (no `npm install` required for the runtime).
   - Simply serve the root directory.

## License

MIT
