import os
import subprocess
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    video_id = request.args.get('videoId')
    if not video_id:
        return jsonify({"error": "videoId is required"}), 400

    try:
        # Run the existing script as a subprocess to preserve existing behavior exactly
        script_path = os.path.join(os.path.dirname(__file__), "python", "get_transcript.py")
        result = subprocess.run(
            ["python", script_path, video_id],
            capture_output=True,
            text=True
        )
        
        try:
            data = json.loads(result.stdout)
            if result.returncode != 0:
                return jsonify(data), 500
            return jsonify(data)
        except json.JSONDecodeError:
            # Fallback if the script didn't output JSON
            if result.returncode != 0:
                return jsonify({
                    "error": "No transcript is available for this video."
                }), 500
            return jsonify({
                "error": "Failed to parse script output", 
                "stdout": result.stdout
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
