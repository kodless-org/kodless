# How to use

0. Clone the repository and run `npm install`.
1. Create a file called `.env` and copy over contents from `.env.example`. The next steps explain how to fill in the values.
2. Create a directory (folder) anywhere in your system (e.g., "projects" in your Desktop), not inside this project. Take the path of this directory and fill in the value for `PROJECTS_DIRECTORY` in `.env` (e.g., `/home/barish/Desktop/projects`).
3. Set `OPENAI_KEY` in `.env` to your OpenAI API key. I suggest creating a new key for this app so you can track usage ($$). Note that by default the app uses `gpt-4-turbo-preview` engine.

Now, you are ready to use the app by typing `npm run dev` in the terminal. This will start the server and you can access the app at `http://localhost:3000`.

# TODO

- [ ] Use a different UI framework due to bad incompability of Naive UI with Nuxt.
 - Options are Nuxt UI, PrimeVue, etc.