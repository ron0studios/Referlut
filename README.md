# Referlut

## Inspiration
- We saw, and have experienced first hand, the struggles of student finance. We discovered that many businesses and even student friendly organisations offer refer-a-friend or pooling-based programmes to help bolster both their firm and customers.
However, such programs are often difficult to find and are difficult to find peers to refer.

## What it does
Referlut is our bespoke and innovate solution to tackle student finance, through common but difficult to navigate programs, such as "refer-a-friend". We help users find and advertise their offers, and match up with other users to work and benefit together. Our web scraping system is able to both navigate the web and validate deals with Gemini, whilst being able to fill in missing or biased details.
Lastly, we realised navigating the sea of deals and exclusives

## How we built it
We used a react based frontend, and supabase for the backend. We used a vast array of Agentic tools to power the project. Gemini was extensively used for it's clean integration into Google search for fact-checking. ChatGPT 3.5 Turbo was efficient and effective against summarising convoluted deals. Manwhile GPT 4.1 was much better suited for longer and denser financial analytics.

## Challenges we ran into
Powering the AI agents with large amounts of data was quite difficult in the later stages of the project, as having longing prompts LLMs tend to lose their context frequently, making them less reliable. For context that was too short, LLMs were also difficult to rely on as they could not make proper deductions on the data.
Outside the AI zone, aspects such as authentication, reliable responsive design were provably challenging, especially for our team as we had little experience with front-end in the past.

## Accomplishments that we're proud of
Our system was able to handle intense LLM inference and web scrape on several thousands of tokens, with little no lag on the website, due to our parallel fetching and buffered rendering. We were able to create useful LLM insights on personal finance, and create a collaborative experience in a concept that hasn't been truly tested before.

## What we learned
We learnt a lot about agentic flows, MCP, and web scraping techniques. Our previously weak web development skills were made far stronger over this weekend, and our ability to navigate disasters was pushed to its limits. It was overall an extremely valuable experience for the whole team.

## What's next for Referlut
We would want to extend on the social side of the app, as well as support other forms of pooling such as car-pooling or student renting! Hopefully we can take Referlut to the moon!!
