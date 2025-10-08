## BetterWrite

BetterWrite is an AI‑powered document editor that acts as your writing co‑pilot. It combines a polished TipTap editor, an AI command palette (⌘K) for contextual rewrites, and a document‑aware chat panel. Select text, describe what you want, and BetterWrite transforms it instantly while preserving formatting and voice.

### Key Features
- **AI Command Palette (⌘K)**: Highlight text and run quick actions like Improve, Shorter, Longer, Fix grammar, or provide a custom instruction.
- **Contextual Document Chat**: Ask questions and get suggestions grounded in your current document content.
- **Rich Editing UX**: Toolbar for formatting, links, alignment, image insertion, and keyboard shortcuts with a help panel.
- **Dashboard + Marketing Site**: Landing page with hero, features, demo, pricing; authenticated dashboard shell ready for persistence.
- **Performance & Polish**: Motion animations, tactile UI components, and a focused, distraction‑free writing surface.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Editor**: TipTap (`@tiptap/react`, StarterKit, TextAlign, Image, Placeholder, Underline, Link)
- **State**: Zustand (central editor store)
- **UI**: Tailwind CSS + custom SCSS, Motion, Lucide icons
- **Auth**: Better Auth (`better-auth`) React client + Next handler
- **AI**: `ai` SDK + `@ai-sdk/openai` (GPT‑4o‑mini), Supermemory tools for contextual grounding
- **Analytics**: `@vercel/analytics`, `@vercel/speed-insights`

## Project Structure
```
src/
  app/
    page.tsx                 # Marketing home (Hero, Features, Demo, Pricing)
    editor/page.tsx          # Editor page hosting DemoTextEditor
    dashboard/               # Auth‑gated shell (sidebar + content)
    api/
      edit/route.ts          # Text edit endpoint (AI rewrite)
      chat/route.ts          # Document chat endpoint (streaming)
      auth/[...all]/route.ts # Better Auth handler
  components/
    editor/                  # Editor UI (palette, overlay, shortcuts, editor)
    homepage/                # Marketing components
  lib/
    tiptap-config.ts         # TipTap extensions & config
    store/editor-store.ts    # Zustand store (content, selection, AI lifecycle)
    auth-client.ts           # Better Auth client (signIn, signOut, useSession)
  styles/                    # SCSS tokens & animations
  types/editor.ts            # Editor & AI types
```

## How It Works
- **Selection tracking**: The store maintains exact selection ranges and selected text on every editor transaction.
- **AI edits**: The palette posts to `/api/edit` with the instruction, selected text, and a trimmed document context. The server uses OpenAI (GPT‑4o‑mini) to generate a rewrite, then the client converts markdown‑like output to safe HTML and inserts it at the precise selection via TipTap chains.
- **Document chat**: The chat panel streams responses from `/api/chat` using `ai` SDK, primed with the current document content.
- **Auth gating**: The dashboard checks `useSession` (Better Auth). Unauthenticated users are redirected to the landing page; the hero provides Google sign‑in.

## Routes
- `/` – Marketing site (Navbar, Hero, Features, Demo, Pricing)
- `/editor` – Editor experience (TipTap + AI palette + chat)
- `/dashboard` – Auth‑gated shell (fixtures shown; ready for persistence)
- `/api/edit` – POST: AI text edit (selectedText, prompt, documentContext)
- `/api/chat` – POST: AI chat over current document (messages, documentContent)
- `/api/auth/*` – Better Auth routes

## Environment Variables
Create a `.env.local` with:
```
OPENAI_API_KEY=
BETTER_AUTH_URL=
SUPERMEMORY_API_KEY=
```
Other Better Auth configuration can be found in `AUTH_SETUP.md` and `auth.ts` at the project root.

## Development
```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

### Available Scripts
- `pnpm dev` – Start the Next.js dev server
- `pnpm build` – Build for production
- `pnpm start` – Start production server

## Keyboard Shortcuts
- AI Palette: **⌘K** (with selection)
- Align Left/Center/Right/Justify: **⌘⇧L / ⌘⇧E / ⌘⇧R / ⌘⇧J**
- Standard TipTap shortcuts: **⌘B / ⌘I / ⌘U**, etc.

## Roadmap (Next)
- Persistent documents, autosave, and version history
- Share links, export (PDF/Markdown/Docx), and collaboration primitives
- Improved diffing/accept‑reject flows for AI suggestions
- Tests (unit + e2e) for editor and API routes

## License
MIT (see LICENSE if present). All product names and logos are property of their respective owners.
