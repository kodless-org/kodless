# How to use

0. Clone the repository and run `npm install`.
1. Create a file called `.env` and copy over contents from `.env.example`. The next steps explain how to fill in the values.
2. Create a directory (folder) anywhere in your system (e.g., "projects" in your Desktop), not inside this project. Take the path of this directory and fill in the value for `PROJECTS_DIRECTORY` in `.env` (e.g., `~/Desktop/projects`).
3. Set `OPENAI_KEY` in `.env` to your OpenAI API key. I suggest creating a new key for this app so you can track usage ($$).
4. In OpenAI dashboard, go to "Assistants" (https://platform.openai.com/assistants). There are prompts under `prompts` directory in this project. Create a new assistant for each prompt and fill in the assistant id to the corresponding value in `.env`.

Now, you are ready to use the app by typing `npm run dev` in the terminal. This will start the server and you can access the app at `http://localhost:3000`.

# TODO

- [ ] Ability to undo changes. In general, keep history of generated code.
- [ ] Dependency tree between concepts and synchronizations. This helps with bunch of things.
 - [ ] Renaming concepts can be done using this.
- [ ] Transactional updates. Right now, if something fails, the whole operation is not rolled back. This can cause inconsistencies.