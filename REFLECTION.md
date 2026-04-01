# Reflection

## Why I chose this stack

I went with Groq's API mainly because it's free and sreally fast. Llama 3.3 70B gave really solid output for this kind of structured analysis task so I just stuck with it.

FastAPI for the backend because I've seen it recommended a lot and it saved me a ton of time when testing endpoints.

PyMuPDF for PDFs- it just worked. React + Vite on the frontend because Vite is fast and I'm more comfortable with React than the alternatives.

## Biggest challenge

The PDF parsing took longer than I expected. I assumed it would just work but some PDFs came back with barely any text, or weirdly jumbled characters, especially the ones that were more design-heavy. Spent a while figuring out that those are basically image-based PDFs with no actual text layer underneath.

Once I understood that I added a proper check- if the extracted text is too short or empty, it tells the user to paste their resume text instead rather than just throwing a random error at them. Small thing but it made the app feel a lot more usable.

## What I'd do differently

Honestly the match score relying fully on the LLM's judgment feels a bit weird to me. I'd want to add proper similarity scoring on top of it so the score has a more solid mathematical basis rather than just trusting what the model decides.

Also would've deployed it somewhere so it actually runs without local setup.
