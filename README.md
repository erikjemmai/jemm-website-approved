# Jemm Website Approved

Production-ready static site built from the approved **Version C** frames in [Jemm Marketing Website (Figma)](https://www.figma.com/design/f6l3Pb4cW3bLS7KsjqfNah/Jemm-Marketing-Website).

## Pages

| Page | File | Figma node |
|------|------|------------|
| Home | `index.html` | `41:299` |
| Jemm Arc (product) | `jemm-arc.html` | `75:104` |
| About | `about.html` | `78:767` |
| Contact | `contact.html` | *(not in Figma — derived from nav + partner patterns)* |

## Figma connection

- Config: `figma.config.json` (file key, node IDs, sync notes)
- Refresh designs via Figma MCP: `get_design_context` with `fileKey: f6l3Pb4cW3bLS7KsjqfNah` and the node ID from the config
- Assets exported to `assets/images/` from Figma MCP (URLs expire in ~7 days; re-export when updating)

## Local preview

```bash
cd jemm-website-approved
python3 -m http.server 8766
```

Open [http://localhost:8766](http://localhost:8766)

## Structure

```
jemm-website-approved/
├── index.html          # Homepage
├── jemm-arc.html       # Product page
├── about.html          # About page
├── contact.html        # Contact page
├── figma.config.json   # Figma file + node mapping
├── css/styles.css      # Design tokens + layout
├── js/site.js          # Nav, scroll
├── js/hey-jemm.js      # Hey Jemm demo chips
└── assets/             # Logos, images, icons
```

## Design tokens (from Figma)

- **Type:** Inter — H1 56/600, H2 44/600, H3 32/600, H4 24/400, body 16/1.6
- **Colors:** Ink `#121212`, Deep Green `#002928`, Emerald `#059161`, Neon `#00D58C`, Lite Gray `#F2F2F2`, Dark Steel `#283239`

## Notes

- This project is separate from `jemm-prototype-website` (A/B/C prototype tooling).
- Contact page follows the same hero, partner band, and footer patterns until a dedicated Figma frame is added.
