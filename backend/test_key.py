import os
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("GROQ_API_KEY")
print(f"Key length: {len(key) if key else 'None'}")
print(f"Key repr: {repr(key)}")

from groq import Groq
try:
    c = Groq(api_key=key)
    r = c.chat.completions.create(
        messages=[{"role": "user", "content": "say hi"}],
        model="llama-3.3-70b-versatile",
        max_tokens=5
    )
    print(f"SUCCESS: {r.choices[0].message.content}")
except Exception as e:
    print(f"ERROR: {e}")
