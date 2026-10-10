# navi radio
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/7f7b775c-86a4-4eca-b895-02015109515d" />

**navi radio** is a beautiful desktop player for your favorite internet radio stations and your local music collection.

It's a proper Electron desktop app from [xvoidsx](https://github.com/xvoidsx) that ships by default in [navi](https://github.com/xvoidsx/navi). Search out any internet radio station, add them to your favorites, and point it at your local music folder — native filesystem access means your whole library just works, no browser permissions dance.

Gorgeous neon visualizers pop off in the background reacting to your music, and the entire app is, as usual, drenched in our [nightshadeNeon](https://rav3ndust.xyz/wiki/nightshadeNeon.html) color theme.

The web version (`index.html`) remains available for browsers and is hosted on GitHub Pages — but the desktop app is the real thing.

## desktop app

The Electron app lives in [`electron/`](electron/). It loads the same `index.html` and adds a native bridge (`preload.js`) for filesystem access: picking your music folder, reading audio files, all outside the browser sandbox.

Build a `.deb` yourself:

```sh
cd electron
npm install
npx electron-builder --linux deb
```

Tagged releases (`v*`) build the `.deb` automatically via GitHub Actions — grab the latest from the [releases page](https://github.com/xvoidsx/navi-radio/releases).
