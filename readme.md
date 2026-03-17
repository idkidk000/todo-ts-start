Testing out Tanstack Start and Better Auth before I commit to using them on anything more significant

### Deps
```bash
nvm
pnpm
```

### Setup
```bash
nvm use
pnpm i
pnpm run init
```

### Dev
`pnpm dev`

Generated credentials are in [`.env`](.env)


### Tanstack Start comparison with NextJS

||Tanstack Start|NextJS|
|---|---|---|
| **Features** |||
|Can roll your own server workers|[Yes, 🟠 via `server.ts`](https://tanstack.com/start/latest/docs/framework/react/guide/server-entry-point)|[Yes, 🟠 via `instrumentation.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation)|
|Builds for Docker|🟢 Yes|🟠 Yes but it includes the entire source, puts `public` in a different dir, and still has a `node_modules` dir|
|Server functions|🟢 Yes|🟢 Yes|
|Single-page applications|🟢 Yes|🟢 Yes|
|Server-side rendering|🟢 Yes|🟢 Yes|
|File-based routing|🟢 Yes|🟢 Yes|
|Typed routes|🟢 Yes|[🟠 Sort of](https://nextjs.org/docs/app/api-reference/config/typescript#statically-typed-links) but it doesn't include work with tubopack or dynamic routes|
|Typed route params|🟠 Yes - as long as they're `string` or `string\|undefined`|🟠 Yes - as long as they're `string`|
|Server-side data loaders|🟢 Yes|🔴 I thought they had something of their own (i.e. not the `use` React hook for awaiting a promise in a sync component, having an async server page which awaits and passes data down to a sync client page, or calling `fetch` or some server function in a `useEffect`) but I can't find any documentation|
| **Documentation** ||
|Thorough|🟢🟢🟢 Very. And it's built on Vite and Tanstack Router so you have their documentation too|🔴 No|
|Well organised|🟠 Ehhh|🟠 Ehhh|
|[Acknowledges that Typescript won. By a lot.](https://2025.stateofjs.com/en-US/usage/)|🟢 Yes|[🔴 No - has a single `Typescript` page](https://nextjs.org/docs/app/api-reference/config/typescript)|
|Documentation site is not buggy/frequently broken|🟠 The nav is currently broken. Returning to a tab I've had open a few days often gives a vague Tanstack Start error until I F5 it|🟢 Yes|
|Documentation site has working/useful search|🟠 Yes - but seems to have a bug with applying product filters|🔴 No - it's only helpful if you know the exact page title. Use a site search through DuckDuckGo or similar|
| **Misc** ||
|Does not have a tendency to overwrite your route files with a template|🔴 No, but maybe related to Biome bugs [923](https://github.com/biomejs/biome-vscode/issues/923), [912](https://github.com/biomejs/biome-vscode/issues/912), [857](https://github.com/biomejs/biome-vscode/issues/857). I don't have the patience for Prettier though|🟢 Yes|
|Org appears somewhat normal|[🟢 Yes](https://tanstack.com/ethos)|[🔴 Not even a bit](https://web.archive.org/web/20260303053312/https://www.middleeasteye.net/trending/developers-drop-vercel-call-boycott-after-ceo-posts-selfie-netanyahu)|