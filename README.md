# Cyber Class Circuit

Voglio progettare una piattaforma didattica. Deve esistere un pannello amministratore, il quale può creare classi, inserire studenti nelle classi, inserire corsi, associare capitoli a corsi, collegare un corso ad una classe.
Per ora la creazione dei corsi la teniamo fatta qua in chat, perchè non è detto che la struttura sia sempre quella, ma almeno ti ho dato l'architettura di massima.
Usiamo un template grafico universale, lo stesso usato nel progetto Agent Time Weaver.

Intanto creiamo la piattaforma.
Come titolo metterei banalmente "Cybersecurity 101"

Locked
- Titolo della piattaforma: “Cybersecurity 101”.
- Riprendere il template grafico universale del progetto Agent Time Weaver, con tema scuro profondo, accenti ciano e giallo neon, tipografia Rajdhani e pannelli con angoli tagliati.
- La piattaforma è didattica e include un pannello amministratore per gestire classi e studenti; la struttura prevista contempla anche corsi, capitoli associati ai corsi e corsi collegati alle classi.
- Per ora la creazione e la definizione strutturale dei corsi restano in chat; non fissare una struttura definitiva dei corsi nell'interfaccia.

Open
- Implementa una piattaforma web funzionante con dati persistenti per classi e studenti, flussi completi per creare/modificare le classi e inserire studenti nelle classi, e una base estendibile per collegare in futuro corsi, capitoli e classi.
- Mantieni aperta la struttura dei corsi: non costruire ora un editor definitivo dei corsi o dei capitoli.
- Decidi i dettagli di navigazione, le schermate e le interazioni necessarie per completare i flussi amministrativi, mantenendo l'esperienza semplice e coerente con il template indicato.

Build a real working app, not a clickable prototype; the screen and kit files show layout, content and look (a wireframe's, structure only) and are never code to copy. The screens are the moments the user designed, not the whole product. Before building, walk through each flow as its user would and design what the pictures leave out, as a product designer would for this product: the steps a flow needs to finish and how the app responds to what the user does, including the moments its users will actually run into, like waiting on something or finding nothing yet. Add nothing a user of this product would never meet, and keep an app the user wants simple, simple. Never leave a step the product's core flows need as "coming soon", unless the brief says the user chose to. Where such a step needs an outside service, build every part up to it and say in your reply what's left to connect. Fill product gaps only, never a look the design set: an added step reuses the UI kit's tokens, chrome and parts and the nearest designed screen's layout, with no new visual direction. Look at every screen's picture before writing code; design.md says which picture or sheet holds each screen. Open the UI kit's shells and parts HTML for the header, tab bar, composer and components, not only its tokens. Use each finished screen's copy exactly as design.md lists it; never invent copy for one. The screens' photos are placeholders for the mockups only: replace every photo design.md lists with the user's own upload for it, else as design.md says (a photo without people re-composed with imagegen--edit_image from it as a reference, a photo of people generated from its brief and never from the photo), and ship no set photo or its URL. For a design that came with no design.md, every photo on assets.lovable.dev or images.unsplash.com is a set photo: replace it with the user's own upload for it, else a new image generated for its slot, any person in it one who doesn't exist, never from the photo or a picture showing it. Build and check each screen at the canvas it was drawn at: phone 393×764, tablet landscape 1133×744, tablet portrait 744×1133, desktop 1280×832. After building, screenshot the app at those sizes and states, compare each finished screen with its picture, and fix every visual difference you didn't choose; check a wireframe's screen against its structure, never its grey look. After building, add these headings to your reply: "Changed from the mockups" and "Added beyond the mockups".

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3f74a4b-6f8f-44e2-a2d7-7113c79de986).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
