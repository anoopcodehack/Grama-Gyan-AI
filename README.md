# Grama-Gyan AI (ग्राम-ज्ञान): Offline-First Vernacular Science Tutor for Rural India

Grama-Gyan is a responsive Web Application and Microservice layer engineered to deliver high-quality, curricularly aligned, and culturally contextualized Science and Technology guidance to secondary students (Class 9 & 10) in remote division classrooms across Maharashtra and other rural Indian states.

Designed specifically for intermittent off-grid connectivity and powered by Gemini models, Grama-Gyan bridges abstract scientific principles (gravity, force, magnetism) with familiar agrarian and rural household analogies.

---

## 🚀 Key Features

1. **Bilingual Conversational Interface**: Fluid translation and vocal assistance between Marathi and English (Marathi standard pronunciation assists).
2. **Textbook Grounding (RAG)**: Search queries undergo dynamic vector keyword matching against Maharashtra SSC and CBSE standard textbooks. 
3. **Indigenous Village Analogies**: Concepts like *buoyancy* and *pressure* are mapped onto indigenous, authentic rural tools (e.g. *gophan*, clay stoves, water well pulleys, bullock carts).
4. **Offline Resilience Architecture**: Standard local conversation databases saved natively on device caches (indexedDB/localStorage wrapper) to guarantee offline retrieval during cellular signal dropouts.
5. **Teacher & Community Crowdsourcing Portal**: Empower educators to submit local cultural analogies to the active tutor database.

---

## 📂 Operational File Structure

The project has been architected according to proper modern multi-service repository patterns:

```text
grama-gyan-ai/
│
├── README.md                 ← Main directory guidebook
├── .env.example              ← System variable templates
│
├── backend/                  ← Express.js API services
│   ├── package.json          ← Backend dependencies
│   ├── server.js             ← Express main entry point
│   ├── config/               ← Mongo Connection, Groq API, Bhashini configs
│   ├── routes/               ← Query routing tables (/query, /asr, /tts)
│   ├── services/             ← Orchestrators, Vector matches, voice synth
│   ├── middleware/           ← Security, Rate limiters, validators
│   ├── models/               ← Mongoose database schemas
│   └── utils/                ← Vernacular detection & noun parsers
│
├── frontend/                 ← React.js user dashboard
│   ├── package.json          ← Client-side requirements
│   ├── vite.config.js        ← Vite bundler proxy configuration
│   ├── src/                  ← Components, contexts, and sw workers
│   └── tailwind.config.js    ← Neo-brutalist custom color configurations
│
└── ingestion/                ← Textbook semantic parsing pipeline
    ├── package.json
    └── main.js               ← Automatic textbook parser and generator
```

---

## 🛠️ Local Environment Kickoff

To run the unified stack locally on your workstation, configure your secrets block and run:

```bash
# Clone the repository
git clone https://github.com/builds/grama-gyan-ai.git
cd grama-gyan-ai

# Set up variables
cp .env.example .env
```

### Option A: Run Unified Sandbox Developer Server (Default)
This builds and boots both backend and frontfacing channels simultaneously out of the container core:
```bash
npm install
npm run dev
# Server initiates on Port 3000
```

### Option B: Run Service Modules Separately
To configure individual docker nodes or localized process managers:

**Backend Setup:**
```bash
cd backend
npm install
npm run dev # Initiates on Port 3001
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev # Initiates Vite on Port 3000
```

---

## 🛡️ Telemetry and Core Environment Variables

Copy `.env.example` and supply your variables:

* `GEMINI_API_KEY`: Generative language engine (Gemini 3.5 Flash).
* `MONGODB_URI`: Persistent database cluster storing students and logs.
* `GROQ_API_KEY`: Fallback backup LLM.
* `BHASHINI_API_KEY`: India National Language Translation Mission key.

---

*Crafted with 💛 for Indian rural school students and regional state board science classrooms.*
