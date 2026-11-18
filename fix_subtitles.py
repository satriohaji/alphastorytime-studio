import json
import re

# Load script source
with open('C:/Users/Lenovo/.gemini/antigravity/scratch/alphastorytime-studio/part2_word_timestamps.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total segments: {len(data['segments'])}")
for seg in data['segments']:
    print(f"\n--- Segment {seg['id']} ({seg['start']}s - {seg['end']}s) ---")
    words_list = [f"{w['no']}:{w['word']}" for w in seg['words']]
    print(" ".join(words_list))
