# 🎬 QuickClip

**QuickClip** is a high-performance, AI-driven web application that transforms any YouTube video into structured study notes, key insights, interactive quizzes, and clickable timestamps. Designed for students, researchers, and power learners, it simplifies complex video content into actionable knowledge in seconds.

---

## 🚀 Key Features

*   **Deep Summarization**: Generates grounded, halluciation-free notes using Google Gemini Pro or OpenAI GPT-4.
*   **Dynamic Depth**: Summary depth automatically scales based on video duration—a 30-minute video gets the detail it deserves.
*   **Interactive Learning**: Test your knowledge with an AI-generated quiz based strictly on the video transcript.
*   **Precision Timestamps**: Clickable time chips that jump you straight to the most important moments in the video.
*   **Professional Exports**: Download your summaries as beautifully formatted PDFs or clean TXT files.
*   **User History**: Securely save your summaries to your personal cloud history using Firebase.
*   **Rich Formatting**: Uses Markdown rendering (headers, bolding, lists) for maximum readability.

---

## 🛠 Tech Stack & Addons

QuickClip is built with a refined stack for speed, reliability, and visual excellence:

*   **Frontend**: Next.js 14, TypeScript, Tailwind CSS.
*   **Backend**: Next.js API Routes (Node.js).
*   **AI Engine**: Google Generative AI (Gemini) & OpenAI (Swappable).
*   **Database & Auth**: Firebase (Authentication + Cloud Firestore).
*   **Key Libraries**:
    *   `react-markdown`: For high-quality summary rendering.
    *   `jsPDF`: For professional document generation.
    *   `lucide-react`: For sleek, modern iconography.
    *   `react-hot-toast`: For elegant user feedback.

---

## ⚙️ Setup & Installation

Follow these steps to get QuickClip running on your local machine.

### 1. Prerequisites
*   **Node.js**: v18.x or higher
*   **npm**: v9.x or higher
*   **Python**: v3.9 or higher (required for transcript extraction)

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Setup Python Virtual Environment
QuickClip uses a Python bridge for reliable transcript extraction. You must set up a virtual environment and install the required dependencies:

```bash
# Create the virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt
```

### 4. Configuration
Create a `.env.local` file in the root directory and populate it with your API keys. You can use `.env.local.example` as a template.

**Critical Note on Firebase Admin**:
To enable user history, you must provide a `FIREBASE_SERVICE_ACCOUNT_KEY`.
1.  Download your Service Account JSON from the Firebase Console.
2.  Base64 encode the JSON file: `cat your-file.json | base64 | tr -d '\n'`
3.  Paste the resulting string into the `FIREBASE_SERVICE_ACCOUNT_KEY` variable.

### 5. Firestore Rules
Paste the following rules into the **Rules** tab of your Firestore Database to secure user history:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/history/{historyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🏃 How to Run

1.  Ensure your Python virtual environment is active if you've freshly opened your terminal.
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use

1.  **Paste URL**: Find a YouTube video you want to summarize and paste the link into the main input field.
2.  **Select Length**: Choose from **Brief**, **Standard**, or **Detailed** depending on how much depth you need.
3.  **Generate**: Click "Summarize" and wait a few seconds. For very long videos, QuickClip will automatically chunk the transcript to ensure a complete summary.
4.  **Learn**: Review your structured notes, click timestamps to watch specific parts, and take the quiz to verify your learning.
5.  **Save & Export**: Your summary is automatically saved to your **History** (if signed in). Use the export buttons to download a PDF for offline study.

---

*Built with ❤️ for the future of learning.*
