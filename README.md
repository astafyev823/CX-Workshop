# CX Workshop Copilot — Deploy Bundle

This is the live workshop site. It deploys to Vercel as a static page (`public/index.html`) plus one tiny serverless function (`api/claude.js`) that talks to Anthropic on the page's behalf.

## What's in here

```
workshop-deploy/
├── public/
│   └── index.html       ← the workshop page itself (everything: HTML, CSS, JS in one file)
├── api/
│   └── claude.js        ← serverless function; proxies AI calls so the API key stays secret
├── package.json         ← tells Vercel this is a Node project
├── vercel.json          ← Vercel routing config
└── README.md            ← this file
```

## How to change content after launch

The whole workshop page is one file: `public/index.html`. To update copy, restructure sections, etc., edit that file. Two ways to do it:

**Option A — quick edit in GitHub's web UI**

1. Go to your repo on github.com
2. Click `public/index.html`
3. Click the pencil icon (top right of the file viewer)
4. Make your changes
5. Scroll down, write a short note ("update agenda times"), click "Commit changes"
6. Vercel sees the commit and redeploys automatically — your live site updates in ~30 seconds

**Option B — edit locally, then push**

If you have the repo cloned to your computer: edit `public/index.html` in any text editor (VS Code, Sublime, even Notepad), then `git add . && git commit -m "your message" && git push`. Vercel redeploys on push.

## Where the AI API key lives

Never in the code. It's set as an environment variable in Vercel:

- Vercel dashboard → your project → Settings → Environment Variables
- Variable name: `ANTHROPIC_API_KEY`
- Value: your key from console.anthropic.com

If you rotate the key, update it there and click "Redeploy" on the latest deployment.

## Cost

- Vercel hosting: free for personal/small use (Hobby plan)
- Anthropic API: pay-per-use, charged to your console.anthropic.com account. A full workshop session typically costs well under $1 in API calls.

## Storage mode

Currently runs in **single-user mode**: each visitor's data (arrivals, friction points, commitments, etc.) is stored only in their own browser via `localStorage`. Refreshing keeps it; opening on a different device starts fresh.

If you want **shared mode** later (one person types, the whole room sees it sync) we need to add a real backend datastore. Doable in ~30 min when ready.

## Common changes — quick recipes

**Change a time on the agenda:** search `index.html` for the time string (e.g. `9:15`) — it appears in the day-nav pill and the section kicker. Update both.

**Change a card's text:** search for a unique phrase from the card (e.g. `Experiment Playbook`) and edit around it.

**Change the AI model:** in `index.html` search for `claude-sonnet-4-20250514` (appears twice — synthesis and steelman). Replace with the model string of your choice.

**Restore the original Big Picture phased workshop:** the original 285-line phased workshop content was set aside as `big-picture-original-BACKUP.html` (kept separately, ask Claude to splice it back into `index.html` when needed).
