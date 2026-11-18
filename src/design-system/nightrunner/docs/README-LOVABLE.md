# Nightrunner UI — consegna a Lovable

Questo archivio contiene il sottoinsieme **web React** del design system, pronto per essere integrato come sorgente locale. Non include le dipendenze o l'adattatore React Native.

## Come iniziare

1. Allega lo ZIP alla chat di Lovable. Allega anche `reference/nightrunner-ui.jpg` separatamente se vuoi che il riferimento sia immediatamente visibile.
2. Incolla il contenuto di `PROMPT-LOVABLE.txt`.
3. Chiedi di importare i sorgenti e gli stili prima di applicare il tema all'app.
4. Controlla almeno una pagina reale su desktop e mobile.

La documentazione Lovable descrive l'importazione di sorgenti caricati. L'accettazione di questo ZIP o di un file `.tgz` non è stata verificata dentro un account Lovable. Se l'archivio non viene letto, estrailo e allega i file sorgenti/Markdown richiesti dall'agente.

## Struttura

```text
src/
  index.ts                              # export per la scoperta dei componenti
  design-system/nightrunner/
    index.ts                            # componenti + token
    core/                               # token, gradienti, geometria
    react/                              # componenti React
  styles/
    nightrunner.css                      # token CSS + componenti
    nightrunner-fonts.css                # font-face locali
    fonts/                              # TTF e licenza OFL
tokens.json
system.md
PROMPT-LOVABLE.txt
reference/nightrunner-ui.jpg
```

Importare CSS e font una volta dall'entry point/layout dell'app:

```tsx
import './styles/nightrunner.css';
import './styles/nightrunner-fonts.css';
import { HudTheme, HudPanel, HudButton } from './design-system/nightrunner';

<HudTheme gradientIntensity={65} style={{ minHeight: '100svh', padding: 24 }}>
  <HudPanel heading="Workspace">
    <HudButton onClick={() => { /* azione dell'app */ }}>Salva</HudButton>
  </HudPanel>
</HudTheme>
```

Nel progetto esistente, non sostituire `src/index.ts` o altri file di ingresso: integra soltanto gli export/import necessari. I percorsi senza estensione sono predisposti per un bundler TypeScript come Vite. React deve essere già fornito dall'app.

## Libreria centralizzata fra progetti Lovable

Se il piano include Design systems, crea prima il progetto dedicato con `+ → Design → Use a design system → Create design system`, importa questi sorgenti e chiedi a Lovable di verificare la scoperta dei componenti da `src/index.ts` e dei token da `src/styles/nightrunner.css`. `system.md` contiene le regole narrative da conservare nelle istruzioni del design system. Usa poi la funzione Release version e collega il sistema alle tue app.

Il flusso locale è distinto da un wrapper di un pacchetto npm esterno. Non serve pubblicare Nightrunner su npm per usare i sorgenti. Non creare un wrapper che cerchi `@nightrunner/ui` nel registry: il pacchetto attuale è privato e disponibile soltanto come archivio locale.

## Alternativa: archivio npm

Se vuoi usare il `.tgz` originale e Lovable riesce a conservarlo nel repository, chiedi di salvarlo come `vendor/nightrunner-ui-0.1.0.tgz` e installarlo con `npm install ./vendor/nightrunner-ui-0.1.0.tgz`. Il file deve essere versionato insieme a package.json e al lockfile affinché le build successive possano reinstallarlo. Poi usare gli import `@nightrunner/ui/react`, `@nightrunner/ui/styles.css` e, facoltativamente, `@nightrunner/ui/fonts.css`. Non usare contemporaneamente la copia dei sorgenti e quella del pacchetto.

## Riferimenti

- [Design systems Lovable](https://docs.lovable.dev/features/design-systems)
- [Istruzioni persistenti Lovable](https://docs.lovable.dev/features/knowledge)
- [Caricamento dei file](https://lovable.dev/blog/lovable-file-uploads)
