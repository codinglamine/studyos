# Getting your projects onto GitHub

Account: **github.com/codinglamine**

## Where things stand

| Project | On GitHub | Needs |
|---|---|---|
| Real Pong (CNN agent) | yes, `realpong-agent-lamine`, documented | a repo description, and the first attempt added |
| Real Pong arena | yes, `realpong-arena-lamine` | a repo description |
| heydia site | yes, `heydia-site` | topics only |
| **studyos** | no | first push |
| **jax** | no | first push |
| Marvel recognizer, poster recognizer | yes | descriptions |

Nothing else needs touching.

---

## Do this — three commands

Open your terminal and run them one at a time.

```powershell
cd $HOME\studyos
.\push-to-github.ps1
```

```powershell
cd "$HOME\Downloads\Real Pong"
.\publish-first-attempt.ps1
```

```powershell
cd $HOME\studyos
.\gh-descriptions.ps1
```

If the first one stops with an auth error, run `gh auth login` first, pick
GitHub.com, HTTPS, and log in through the browser. Then start again.

**What each does**

1. Creates `codinglamine/studyos` as a public repo and pushes it. Your
   `apps/api/.env` is excluded by `.gitignore`, and the script aborts before
   committing if any real `.env` ends up staged. `.env.example` is kept.
2. Clones `realpong-agent-lamine`, adds a `first-attempt/` folder with the
   policy-gradient code and the full training log, links to it from the main
   README, and pushes.
3. Fills in the one-line descriptions on the five repos that currently show
   nothing.

---

## Then jax

jax is on your Desktop, which I can't reach from the chat. Paste this into
Claude Code in VS Code:

```
The jax project is in ~\Desktop\jax — a private, local-first AI assistant,
Tauri (Rust + WebView2). Put it on GitHub as codinglamine/jax, public.

1. Read the repo and write a README.md: what it is, what it does, the stack,
   how to run it, and what is unfinished. No emojis. Do not invent features —
   if something is a stub or navigation-only, say so.
2. Write a .gitignore excluding: .env and .env.* (keep .env.example),
   node_modules, dist/build output, src-tauri/target, and any signing keys,
   .pem files or certs. Tauri's updater private key must never be committed.
3. Before committing, print every file that would be staged and stop if any
   real .env, key or cert appears in the list.
4. Create the repo with gh and push.

Do not touch ~\Downloads\realpong_battle — it's the tournament package I was
given, containing the organisers' trained opponent, not my work.
Do not touch ~\Astro — it's a clone of Blueturboguy07/Astro, not mine.
```

---

## The point of all this

You do not have a project problem. You have three real projects. What you have
is a visibility problem: five of your ten repos show no description at all, and
your two strongest pieces of work live only on your laptop. An admissions reader
who opens your GitHub today sees less than half of what you've actually done.

That is why the first attempt at Real Pong is worth publishing rather than
hiding. Shipping a working agent shows you can build. Shipping the version that
failed, with the training log and the three specific reasons it failed, shows
you can diagnose — which is the thing a research supervisor is actually
looking for.
