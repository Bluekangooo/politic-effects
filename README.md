# politic-effects

Wirkungsanalyse politischer Vorhaben auf Einzelne und Gesellschaft.

## Datenmodell

Das Projekt folgt einem fünfstufigen Workflow:

1. **Erfassung** eines politischen Vorhabens
2. **Aufteilung** in Untervorhaben (optional)
3. **Zielgruppen** pro Vorhaben und/oder Untervorhaben
4. **Rechenvorschrift** für Effekte auf betroffene Zielgruppen
5. **Dashboard** mit hierarchischer Auswahl und Zeithorizonten

### Kernregel: Zielgruppen auf beiden Ebenen

Ein **Vorhaben** muss mindestens eine der folgenden Angaben haben:

- eigene `zielgruppen` (wenn keine Untervorhaben nötig sind), oder
- `untervorhaben` (jeweils mit eigenen `zielgruppen`)

Beides gleichzeitig ist möglich – z. B. direkte Unternehmer-Effekte auf Vorhabenebene plus Untervorhaben für Mieter/Eigentümer.

```
Vorhaben
├── zielgruppen[]          ← optional, direkt auf Vorhabenebene
└── untervorhaben[]        ← optional
    └── zielgruppen[]      ← pro Untervorhaben
```

### Typen (TypeScript)

| Typ | Beschreibung |
|-----|-------------|
| `Vorhaben` | Politisches Vorhaben mit optionalen Zielgruppen und/oder Untervorhaben |
| `Untervorhaben` | Konkrete Maßnahme mit eigenen Zielgruppen |
| `Zielgruppe` | Globale Definition einer betroffenen Gruppe |
| `ZielgruppenZuordnung` | Verknüpfung Zielgruppe ↔ Fragen ↔ Rechenvorschrift |
| `Rechenvorschrift` | Deklarative Formeln pro Zeithorizont |
| `Frage` | Fragebogen-Eintrag mit Zielgruppen-Mapping |
| `VorhabenKatalog` | Gesamtkatalog mit Zielgruppen, Fragen und Vorhaben |

### JSON-Schema

Schemas liegen unter `schema/` und validieren Vorhaben-Daten:

- `vorhaben.json` – einzelnes Vorhaben (`anyOf`: Zielgruppen oder Untervorhaben)
- `untervorhaben.json` – Untervorhaben mit Pflicht-Zielgruppen
- `vorhaben-katalog.json` – vollständiger Katalog

### Beispieldaten

`data/examples/katalog.json` enthält drei Vorhaben:

1. **Mindestlohnerhöhung** – nur Zielgruppen, keine Untervorhaben
2. **Mobilitätsreform** – nur Untervorhaben mit je eigenen Zielgruppen
3. **Steuerreform KMU** – Zielgruppen auf Vorhaben- **und** Untervorhaben-Ebene

## Entwicklung

```bash
npm install
npm run dev         # Webapp starten (http://localhost:5173)
npm run typecheck   # TypeScript prüfen
npm run validate    # Beispieldaten gegen Schema validieren
npm run build       # Library + Webapp bauen
npm run build:pages # Build für GitHub Pages (lokal testen)
```

### Demo-Flow: Solidaritätszuschlag

1. **Startseite** → Fragebogen starten
2. **Fragebogen**: konkrete Zahlen (Alter, Einkommen je Quelle, Kapitalerträge) – keine Klassen
3. **Dashboard**: Vorhaben/Untervorhaben hierarchisch auswählen, Effekte auf sich und Gesellschaft in drei Zeithorizonten sehen

**Fragebogen-Prinzip:** Nur numerische Eingaben. Zielgruppen und Einkommensklassen werden in der Engine aus Schwellenwerten abgeleitet.

Testprofil „gut verdienender Angestellter“: Alter 42 · 95.000 € Anstellung · 0 € Selbstständigkeit · 2.000 € Kapitalerträge.

## Live-Demo (GitHub Pages)

Nach dem Merge auf `main` ist die App unter erreichbar:

**https://bluekangooo.github.io/politic-effects/**

### Einmalige Einrichtung im GitHub-Repository

1. **Settings** → **Pages**
2. Unter **Build and deployment** → **Source**: **Deploy from a branch**
3. **Branch**: `gh-pages` / **/(root)** → **Save**
4. Nach dem ersten Push auf `main` erstellt der Workflow den `gh-pages`-Branch automatisch (ca. 1–2 Minuten)

Falls die Seite nach dem ersten Merge noch 404 zeigt: oben die Pages-Einstellung prüfen und unter **Actions** den Workflow **Deploy to GitHub Pages** erneut ausführen (**Re-run all jobs**).

### Auf dem iPhone

1. URL in **Safari** öffnen
2. **Teilen** (Teilen-Symbol) → **Zum Home-Bildschirm**
3. Die App startet danach wie eine normale App – ohne Terminal

## Projektstruktur

```
src/types/          TypeScript-Domänentypen
src/engine/         Berechnungs- und Zielgruppen-Logik
schema/             JSON-Schema-Definitionen
data/katalog.json   Aktiver Vorhabenskatalog (Soli-Demo)
data/examples/      Weitere Beispieldaten
web/                React-Webapp (Vite)
scripts/            Validierungsskripte
```
