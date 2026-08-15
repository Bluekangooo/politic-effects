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
npm run typecheck   # TypeScript prüfen
npm run validate    # Beispieldaten gegen Schema validieren
npm run build       # Nach dist/ kompilieren
```

## Projektstruktur

```
src/types/          TypeScript-Domänentypen
schema/             JSON-Schema-Definitionen
data/examples/      Beispiel-Vorhabenskatalog
scripts/            Validierungsskripte
```
