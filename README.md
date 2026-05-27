 # 🎯 Resume Intelligence
  
  **Direct-to-LLM local ATS scanner, parser, and optimizer built for the privacy-focused job seeker.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Vite](https://img.shields.io/badge/Vite-v6.x-blueviolet.svg)](https://vite.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.x-38bdf8.svg)](https://tailwindcss.com)
  [![React](https://img.shields.io/badge/React-v19.x-61dafb.svg)](https://react.dev)
</div>

---

## ✨ Key Features

- 🔒 **Zero-Server Processing (100% Privacy)**: Your resume never touches a third-party server. All parsing, analysis, and API communication occur directly from your browser to the LLM (Gemini/OpenAI).
- 🔑 **Bring Your Own Key (BYOK)**: Connect using your own API credentials. Key remains in local/session storage and never leaves your browser.
- 📄 **Interactive PDF Highlight Viewer**: Visualize where improvements are needed directly on your original PDF layout with synchronized highlight boxes.
- 🤖 **ATS Scoring & Deep Insights**: Generates an overall match score, analyzes keyword density, and flags compatibility issues.
- 💡 **AI Rewrites & Suggestions**: Get precise, contextual bullet-point improvements to align your resume with the target Job Description (JD).
- 🗄️ **Local History**: Revisit past analysis reports locally inside your browser using IndexedDB.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev) (Vite + JSX)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) & [PostCSS](https://postcss.org) (for modern, highly responsive utility styling)
- **Icons**: [Lucide React](https://lucide.dev)
- **PDF Processing**: [pdfjs-dist](https://github.com/mozilla/pdf.js) (client-side text extraction & rendering)
- **State & Storage**: Local Storage / Session Storage for keys, IndexedDB for history.

---

## 🚀 Running Locally

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) (version 18+) installed on your machine.

### Setup Steps

1. **Clone & Navigate**
   ```bash
   cd ats-resume
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key (Optional)**
   You can supply your API key inside the application interface or create a local environment file:
   - Create a file named `.env.local` in the root directory.
   - Add your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
ats-resume/
├── src/
│   ├── components/         # React components (Analyzer, Header, PDF Viewer, etc.)
│   │   └── ui/             # Core visual UI primitives (buttons, inputs)
│   ├── lib/                # PDF, History database, and LLM orchestration logic
│   ├── App.jsx             # Main App component
│   ├── index.css           # Global stylesheet & Tailwind theme directives
│   └── main.jsx            # Application mount entrypoint
├── index.html              # HTML shell
├── package.json            # Node project configuration
├── vite.config.js          # Vite server and build config
├── postcss.config.js       # PostCSS plugins (autoprefixer)
└── tailwind.config.js      # Tailwind theme configuration
```

---

### 👨💻 Author
**Anuj Kushwaha**

