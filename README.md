# QuickClip

QuickClip is a production-ready Next.js web application that instantly turns any YouTube video into structured study notes, key insights, timestamps, and an interactive quiz. Designed for students, researchers, and lifelong learners.

Built with a modern stack and refined for premium performance:
- **Core**: [Next.js 14](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini Pro](https://ai.google.dev/) & [OpenAI GPT-4o](https://openai.com/) (Provider Swappable)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Auth + Cloud Firestore)
- **Rich Summaries**: [react-markdown](https://github.com/remarkjs/react-markdown) for beautiful AI formatting
- **Exports**: [jsPDF](https://github.com/parallax/jsPDF) for professional PDF generation
- **Icons**: [Lucide-React](https://lucide.dev/) for sleek modern iconography
- **Transcripts**: Custom Python bridge using `youtube-transcript-api`

---

## Features

- **AI-Powered Summaries**: Extracts the transcript and generates grounded notes (no hallucinations).
- **Map-Reduce for Long Videos**: Automatically chunks transcripts that exceed token limits to process any video length.
- **Timestamps**: Clickable chips that jump straight to the exact second in the video.
- **Interactive Quiz**: Tests your comprehension based strictly on the transcript.
- **Export**: Download your notes as well-formatted PDF or TXT files.
- **User History**: Sign in with Email/Password or Google to permanently save and access your past summaries.
- **Provider Swappable**: Easily switch between Google Gemini and OpenAI simply by changing a `.env` variable.
- **Mock Fallback**: Runs UI purely on mock data for local testing without API keys.

---

## Architecture

- **Frontend**: Next.js App Router (`app/`), React Context (`context/AuthContext.tsx`), and responsive vanilla-CSS + Tailwind design (`app/globals.css`).
- **Backend API**: Next.js API Routes (`app/api/`) handle validation, transcript extraction, LLM generation, and database CRUD.
- **Services layer**: `lib/` directory separates concerns (YouTube, Transcript, Chunking, LLM orchestrator, Firestore).
- **Security**: The client has no access to LLM or Firebase Admin secrets. API routes verify the user's Firebase token before modifying Firestore history.

---

## Setup Instructions

### 1. Install Dependencies

**Node.js Dependencies:**
```bash
cd QuickClip
npm install
```

**Python Dependencies:**
QuickClip uses Python for transcript extraction. Ensure you have Python 3.9+ installed, then set up the virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

### 3. Firestore Security Rules

Deploy or paste these rules into the Firestore "Rules" tab in the Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{userId}/history/{historyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Modifying the LLM Provider

QuickClip uses a provider-agnostic bridge (`lib/llm.ts`).
To switch models:
1. Change `LLM_PROVIDER` in `.env.local` to `"openai"` or `"gemini"`.
2. Add the respective `API_KEY`.
3. (Optional) Adjust the specific model choice via `OPENAI_MODEL` (default: gpt-4o-mini) or `GEMINI_MODEL` (default: gemini-1.5-flash).

---

## Future Improvements

1. **Caching Layer**: Cache identical summaries (by YouTube canonical video ID) in Firestore or Redis to save API costs on popular videos.
2. **Analytics**: Add PostHog or Google Analytics to track feature usage (export hits, etc).
3. **Alternative Transcripts**: Fallback to Whisper API or Deepgram if YouTube's auto-captions fail or are disabled.
4. **Export formatting**: Use standard markdown exporting.

---

