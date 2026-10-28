# 🎨 DESIGN.md — Sanvium Technologies Design System

> **Style Architecture:** Electric High-Tech Yellow & Obsidian Black · Avant-Garde Technical Luxury · Scroll-Scrubbed Diorama World

---

## 🎨 Color Palette & Tokens

| Role | Name | Hex Code / Value | Usage |
|---|---|---|---|
| **Page Background** | Obsidian Onyx | `#080808` | Deep void page canvas |
| **Card Surface 01** | Dark Graphite | `#101216` | Primary bento cards & components |
| **Card Surface 02** | Elevated Onyx | `#16181F` | Hover state cards & modal bodies |
| **Card Surface 03** | Highlight Graphite | `#1F222B` | Active states & container borders |
| **Primary Accent** | Electric Bright Yellow | `#FFE500` | CTAs, focus indicators, badges, 3D nodes |
| **Hover Yellow** | Luminescent Yellow | `#FFF04D` | Button hover & highlighted interactive items |
| **Accent Dim** | Soft Yellow Tint | `rgba(255, 229, 0, 0.16)` | Subtle badge backgrounds & tags |
| **Accent Glow** | Yellow Aura | `rgba(255, 229, 0, 0.08)` | Cursor spotlight & ambient illumination |
| **Secondary Accent**| Silver Zinc | `#D4D4D8` | Subtitles, icon highlights, subtle borders |
| **Border Color** | Glass Border | `rgba(255, 255, 255, 0.09)` | Container grid dividers |
| **Border Accent** | Yellow Neon Border | `rgba(255, 229, 0, 0.48)` | Active borders & hovered cards |
| **Text Primary** | Crisp Pure White | `#FAFAFA` | Primary headlines & main copy |
| **Text Secondary** | Muted Silver Slate | `#A1A1AA` | Body paragraphs & secondary text |
| **Text Muted** | Dark Slate | `#52525B` | Footer captions & disabled text |

---

## 🔤 Typography System

- **Headings (Display / H1 - H6):** `Cabinet Grotesk`, sans-serif (Weights: 700, 800, 900) — Distinctive, architectural, bold editorial style
- **Body & Subtitles:** `Space Grotesk` or `Inter`, sans-serif (Weights: 400, 500, 600)
- **Labels, Tags, & Code:** `Space Mono`, monospace (Weights: 400, 700) with wide letter-spacing (`0.2em`)

```css
--font-heading: 'Cabinet Grotesk', 'Space Grotesk', sans-serif;
--font-body: 'Space Grotesk', 'Inter', sans-serif;
--font-mono: 'Space Mono', monospace;
```

---

## 🧩 Key UI/UX Patterns

### 1. Fly-Through Studio World (`lets-scroll` Engine)
- Scroll-scrubbed interactive 3D camera flight through Sanvium's Agency Value Chain:
  1. **Studio Entrance:** "Where Vision Meets Velocity"
  2. **Architecture Lab:** Brand systems, strategy, and blueprinting
  3. **Engineering Core:** Fullstack code, cloud scale, and performance
  4. **Spatial Realm:** 3D WebGL, motion storytelling, and immersive design
  5. **Launchpad & Showcase:** Global live deployments & client ROI
- Real-time scrubbing, interactive route rail, and smooth camera pacing with linger effects.

### 2. Morphing Asymmetrical Navigation Drawer
- Floating dock bar at bottom center with interactive status (`🟡 Available for Q3` in Electric Yellow)
- Expands on menu toggle into an **asymmetrical split drawer**:
  - **Left Column:** High-impact editorial navigation links (HOME, STUDIO, CAPABILITIES, PORTFOLIO, JOURNAL, CONNECT) with oversized numbers (`01`, `02`, etc.)
  - **Right Column:** Agency metadata, live time widget, email quick-copy, and social links

### 3. Interactive Spotlight & Cursor Follower
- Custom glowing cursor ring tracking mouse coordinates in Electric Yellow (`rgba(255, 229, 0, 0.08)`)
- Bento cards featuring interactive spotlight radial gradients (`radial-gradient(600px at mouseX mouseY, rgba(255, 229, 0, 0.16), transparent)`)

### 4. Kinetic GSAP Motion & 3D WebGL Hero
- Obys Agency-style split-reveal text animations on scroll
- 2.5D hero scene: "Volt", a white robot mascot with a black glass visor and yellow glow, floats large and centred in the right column. It rises and waves on load, floats and tilts toward the cursor, and on scroll turns as the stars streak, leading into Studio Flight (layered WebP + SVG, no WebGL)
- Magnetic pull effect on primary CTA buttons
