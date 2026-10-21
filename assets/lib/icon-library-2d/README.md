# Salesforce 2D Product / Industry Icon Library

The full official 2D iconography set (106 icons) — products, clouds, platform
services, security, developer tools, and **industry verticals**. Use these whenever
a tile, domain box, or callout *is* a specific Salesforce product or industry,
instead of a generic line-icon SVG.

Mix of **PNG** (full-color, flat; ~110–180px, transparent bg) and **SVG** (110×110
viewBox, scale-perfectly — prefer these for crisp rendering at any size).

## Usage rule (official)

> A product/industry icon must sit next to the thing it represents — **never** as
> ornament. Industries icon = an industry tile; Tableau icon = an analytics tile.

In CSS, drop the tint background (these are already colored) and size the `<img>`:
```css
.dico { width: 56px; height: 56px; display:flex; align-items:center; justify-content:center; }
.dico img { width: 50px; height: 50px; object-fit: contain; }
```

## Index

**Core products / clouds**
`Agentforce.svg` · `Agentforce Vibes.png` ⭐ (Vibe Codey mascot — use for Agentforce Vibes / vibe-coding) ·
`Code Builder.png` ⭐ (use for Code Builder / pro-code / Apex development) ·
`C360.svg` (Customer 360) · `Data Cloud.png` · `Marketing.png` · `Sales.png` ·
`Service.png` · `Commerce.png` · `Tableau.png` · `Slack.png` · `MuleSoft.png` ·
`Platform.png` · `Heroku.png` · `Experience Cloud.png` ·
`Field Service.png` · `Contact Center.png` · `Channels.png` · `Segments.png` ·
`Bots.png` · `Net Zero.svg` · `Canvas (Quip).png`

Also: `Analytics.png` · `Customer 360.png` · `Small Business.png` / `Small Business 2026.png` ·
`Agent Exchange.png` · `Partner Apps & Experts.png` · `Partners Consulting.png`

**Platform services / developer tools**
`Hyperforce.png` ⭐ (Hyperforce — infra/trust/data-residency) · `Code Builder.png` ⭐ ·
`Apex.png` · `Apex Guru.png` · `Lightning Web Components.png` · `Blockchain.png` ·
`Data Residency.png` · `DX.png` · `Low Code.png` · `Mobile.png` · `Platform Builder.png` ·
`Workflow Automation.png` · `Sandboxes.png` · `Scale Center.svg` · `Scale Testing.png` ·
`Robotic Process Automation.png` · `Artificial Intelligence.png` · `Architect.png` ·
`Admin.png` · `Authenticator.png` · `Salesforce Starter.png` · `Salesforce Backup.png` ·
`Salesforce Discover.png` · `Radio.png` · `Playground.png` · `Idea Exchange.png` ·
`Loyalty Management.png` · `CMS.png` · `Connected Experiences Gateway.png` ·
`Events.png` · `Service delivery.png`

**Security & governance**
`Security.png` · `Security Center.png` · `Shield.png` · `Privacy Center.png` ·
`Private Connect.png` · `Policy Center.png` · `Customer Identity.png` · `Data Mask.png` ·
`Archive.png` · `Mobile App Security & Compliance.png`

**Industry verticals** (use for domain/vertical tiles)
`Financial Services.svg` ⭐ · `Industries.png` · `Healthcare.svg` ·
`Automotive.png` · `Consumer Goods.png` · `Communications.png` · `Media.svg` ·
`Energy & Utilities.png` · `Education.svg` · `Public Sector.png` ·
`Government Cloud Public Sector.png` · `Nonprofit.png` · `Professional Services.png` ·
`Eng-Con-RE.png` / `Engineering Construction & Real Estate.png` · `Life Sciences.png` ·
`Manufacturing.png` · `Retail.png` · `Sustainability.png` · `Technology.png` ·
`Travel Transportation & Hospitality.png` · `Insurance.png`

**Service (Service Cloud family)**
`HR.png` · `IT+HR.png` (IT + HR support agents)

**AI assistants / external platforms**
`ChatGPT.png` ⭐ — use whenever referencing ChatGPT / OpenAI ·
`Microsoft Copilot.png` ⭐ — use whenever referencing Microsoft Copilot ·
`Microsoft Teams.png` ⭐ — use whenever referencing Microsoft Teams

**Sales / GTM / enablement**
`Sales Enablement.png` · `Sales Map.png` · `Sales Partner Cloud.png` ·
`Sales Revenue.png` · `Referral Marketing.png` · `Partner.svg` · `Small Business.png` ·
`Customer Success.png` · `Success Plans.png` · `Trailhead.png`

## Where it came from

Extracted from the official **Iconography 2D+3D Library** Figma export (grids in
`~/Downloads/Iconography 2D+3D Library (1)/`). Only the **first-row full-color** variant
of each product column was extracted (retired / in-development / empty cells skipped),
auto-trimmed with a transparent background — see `extract_icons.py` provenance. This is the
canonical product/industry icon set — pair it with the brand PNGs documented in
[`../README.md`](../README.md) (Astro, devices, flags, sparkles, logo from the sibling
`presentacion-salesforce` skill).
