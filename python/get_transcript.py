import json
from youtube_transcript_api import YouTubeTranscriptApi
import sys
import re

def clean_text(text):
    text = text.replace("\xa0", " ")
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text

def get_transcript_json(video_id):
    try:
        # Instantiate the API class
        ytt_api = YouTubeTranscriptApi()
        
        # Use fetch method which returns a FetchedTranscript object (iterable)
        # It defaults to 'en', but we can pass more languages if needed.
        transcript = ytt_api.fetch(video_id)
        
        # Format it for our TypeScript types: { start: number, duration: number, text: string }
        formatted = []
        for snippet in transcript:
            formatted.append({
                "start": getattr(snippet, "start", 0),
                "duration": getattr(snippet, "duration", 0),
                "text": clean_text(getattr(snippet, "text", ""))
            })
        
        print(json.dumps(formatted))
    except Exception as e:
        # Check for specific error types if needed, otherwise format generic error
        error_message = str(e)
        if "PoTokenRequired" in error_message or "bot" in error_message.lower():
            error_message = "YouTube is currently blocking automated access. Please use the Manual Transcript Fallback."
        
        print(json.dumps({"error": error_message}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_transcript_json(sys.argv[1])
