# App Icon Design Plan

## Scope

This design plan covers the requested apps:

- Kobaraku: `products/kobaraku`
- AI Answer / AI Concierge: `products/ai-concierge`
- Web Platformer: `products/web-platform`
- KoseSpark: `products/kosespark`
- Trimmer System: `products/trimmer-system`
- Video Auto Editing: `products/ymm-shorts`
- foodee: `products/foodee`
- SNS Auto Posting: `products/instagram-auto-ops`

## Shared Design Rules

Research basis:

- Apple Human Interface Guidelines: app icons should express purpose and personality at a glance, use a simple core idea, avoid unnecessary text, photos, screenshots, and fine details.
- Material icon guidance: icons should use simple, bold, geometric forms that remain clear at small sizes.
- GNOME HIG: choose a simple metaphor clearly related to the app name or function.

Shared constraints:

- No text, product names, initials, UI screenshots, or platform logo copies.
- Use one strong central metaphor per product.
- Keep each icon to two or three primary visual elements.
- Verify at 1024px, 256px, 64px, 32px, and 16px.

## Style Diversity Matrix

Do not generate the eight icons in the same visual treatment. Before each image generation, prepend the relevant style direction below to that product's prompt.

| Product | Style direction | Avoid looking like |
| --- | --- | --- |
| Kobaraku | Flat utilitarian business-tool icon: crisp grid, blueprint-like blue, minimal depth. | glossy social/media icons |
| AI Answer | Soft support-service icon: calm chat shape, approachable human handoff accent, subtle rounded geometry. | generic AI bot or mail app |
| Web Platformer | Light modular design-system icon: off-white canvas, dark ink outlines, cyan/lime construction accents. | dark card-based SaaS icon |
| KoseSpark | Kinetic video-editing icon: dark charcoal, energetic cut spark, strong movement from timeline to short frame. | AI hub, SNS scheduler, chat app |
| Trimmer System | Friendly pet-care record icon: teal, warm white, paw/record mark with soft grooming feel. | veterinary emergency or medical cross icon |
| Video Auto Editing / ymm-shorts | Technical editing-template icon: dark neutral, stable timeline strip, precise automation lightning. | SNS publishing icon |
| foodee | Editorial food-feed icon: deep green, plate/RSS symbol, restaurant news feel. | recipe, delivery, or reservation app |
| SNS Auto Posting | Flat publishing-operations icon: paper-like post card, clock badge, bold send arrow, low-gloss. | Instagram-like gradient, calendar app, analytics app |
---

## 1. Kobaraku

### Product Understanding

Kobaraku helps store staff create formal operational deliverables from a smartphone: mutual check sheets, dish inventory sheets, tenant sales OCR, and Excel outputs.

### Core Message

Store paperwork becomes complete Excel-ready output from a phone.

### Visual Concept

A blue business-tool background with a bold white checklist/grid sheet in the center and a large green completion check. The icon should feel like operational paperwork being finished, not a generic dashboard.

### Prompt

Create a clean modern app icon for a store operations tool. Dark business-blue rounded-square background. Center a bold white checklist/grid sheet with 4 to 6 large cells, and place one large green checkmark over the lower-right corner. The icon should communicate completed store paperwork and Excel-ready operational reports. Use simple geometric shapes, high contrast, thick edges, and no text. Avoid tiny OCR dots or photo thumbnails. Professional vector-like app icon, centered, readable at small sizes.

### Verification Checklist

- Reads as completed operational paperwork within one second.
- The sheet/grid and checkmark remain visible at 32px.
- At 16px, it still reads as a checklist/report tool.
- No tiny OCR dots, photo thumbnails, or spreadsheet micro-cells.
- Does not look like a generic task app only; it should feel business/report oriented.

### Must

- Must include a bold grid/checksheet.
- Must include one dominant completion checkmark.
- Must use business-blue plus green completion contrast.
- Must keep the composition simple and centered.

### Must Not

- Must not use text, letters, Excel logo, or Microsoft branding.
- Must not include tiny OCR/photo details.
- Must not resemble a chat app, generic calendar, or analytics dashboard.

---

## 2. AI Answer / AI Concierge

### Product Understanding

AI Answer automates customer inquiries for small businesses using a web widget, FAQ-based AI replies, escalation to a human, management UI, and LINE-adjacent delivery.

### Core Message

AI answers immediately, then connects to a person when needed.

### Visual Concept

A large chat bubble represents the inquiry. Inside it, a lightning/check mark signals instant answer. A thick connection line leads to a simple person icon in warm orange, showing human handoff.

### Prompt

Create a clean modern app icon for an AI customer support product. Use a deep blue rounded-square background. Place one large white chat bubble in the center. Inside the bubble, include a simple lightning-check symbol to show instant response. From the lower-right of the bubble, draw one thick connection line to a small warm-orange person icon, showing handoff to a human. Use bold geometric shapes, high contrast, and no text. Do not use robot faces, envelopes, AI letters, or tiny arrows. Professional vector-like app icon, readable at small sizes.

### Verification Checklist

- Reads as customer support/chat within one second.
- The instant-answer symbol is visible without becoming a tiny decoration.
- The human handoff reads as a connected person, not a random dot.
- At 32px, chat bubble, instant mark, and person connection are distinguishable.
- Does not look like a generic AI chat-only app.

### Must

- Must include one dominant chat bubble.
- Must show instant answer with a bold lightning/check symbol.
- Must show human connection with a simple person icon or handoff line.
- Must use deep blue, white, and one warm accent.

### Must Not

- Must not use robot faces, AI text, envelopes, or small mail icons.
- Must not add multiple chat bubbles if they make the icon crowded.
- Must not mimic LINE, OpenAI, or any other service logo.

---

## 3. Web Platformer

### Product Understanding

Web Platformer generates high-quality websites by combining page structure, design systems, section components, and industry-specific content. It moves from template production to customer-editable SaaS and AI editing.

### Core Message

Sellable websites are assembled from reusable design blocks.

### Visual Concept

A browser-like canvas with three stacked section blocks and one large generation spark. A subtle growth/conversion mark can be integrated as one upward corner/arrow shape, but the design must stay mostly about block assembly.

### Prompt

Create a clean modern app icon for a website generation platform. Use a light or near-white rounded-square background with dark ink outlines and cyan/lime accents. Center a simplified browser canvas containing three bold stacked website section blocks. Add one large generation spark at the upper-right where the blocks appear to assemble. Optionally shape the top block like a subtle upward growth corner, but keep it simple. No screenshots, no text, no code symbols. Professional vector-like app icon, geometric, high contrast, readable at small sizes.

### Verification Checklist

- Reads as website/page generation, not just a browser.
- The three section blocks are clear at 32px.
- The generation spark is large enough to remain visible.
- No screenshot-like UI details, tiny navigation items, or code.
- Does not look like a generic file manager or analytics chart.

### Must

- Must include a browser/page canvas.
- Must include stacked section blocks.
- Must include one generation spark.
- Must keep block count low and bold.

### Must Not

- Must not include full web page screenshots.
- Must not use text, code brackets, domain bars, or tiny menus.
- Must not overemphasize growth charts over website generation.

---

## 4. KoseSpark

### Product Understanding

Current KoseSpark is video auto-editing only. It receives long videos, transcribes them, selects useful segments with AI, resolves timestamps, optionally adds subtitles, and renders vertical or horizontal shorts locally with ffmpeg.

### Core Message

Long videos become highlight shorts automatically.

### Visual Concept

A dark charcoal icon with one bold long timeline/film strip. At the cut point, a yellow spark creates a white vertical short-video frame with a play triangle. Subtitle detail should be one line at most, or omitted for small-size clarity.

### Prompt

Create a clean modern app icon for a video auto-editing product called KoseSpark. The icon should communicate that a long video is automatically turned into a short highlight clip. Use a dark charcoal rounded-square background. Add one bold simplified horizontal timeline or film strip running from lower left to upper right. At the central cut point, place a bright yellow spark. From the spark, a white vertical short-video frame rises upward, containing a simple play triangle. If subtitles are included, use only one short line and keep it secondary. Use simple geometric shapes, bold edges, high contrast, and no text. Color palette: charcoal, white, warm yellow spark, very small cyan accent only if needed. Professional vector-like app icon, crisp, centered, readable at small sizes.

### Verification Checklist

- Reads as video editing or short-video generation within one second.
- Shows transformation from long video/timeline to short vertical video.
- Yellow spark is located at the cut/extraction point.
- Vertical video frame and play triangle remain visible at 32px.
- At 16px, it still reads as a video/shorts tool.
- Does not look like a generic AI hub, chat app, or SNS scheduler.

### Must

- Must represent video auto-editing / short-video generation.
- Must focus on long video to short clip transformation.
- Must include one bold timeline or film-strip element.
- Must include a yellow spark at the cut point.
- Must include one vertical video frame with a play triangle.

### Must Not

- Must not represent KoseSpark as a general AI integration hub.
- Must not include AI nodes, chat windows, tool clusters, or network diagrams.
- Must not include SNS posting, queue cards, calendars, or upload arrows.
- Must not use YMM4, TikTok, Instagram, YouTube, Apple, Google, or other platform UI/logo copies.
- Must not include detailed timelines or many subtitle lines.

---

## 5. Trimmer System

### Product Understanding

Trimmer System is a dog grooming chart system. It records dogs, owners, charts, photos, body/teeth/nail markings, customer viewing, and access separation.

### Core Message

Dog grooming records stay organized per dog.

### Visual Concept

A teal background with a white chart card, a bold paw mark, and one pen/marking stroke. A grooming scissor silhouette may be used only if it stays simple and does not crowd the card.

### Prompt

Create a clean modern app icon for a dog grooming record system. Use a teal rounded-square background. Center a white medical-style chart card, but make it friendly rather than hospital-like. Place a bold paw mark on the card and one simple pen or marking stroke crossing the lower area, showing grooming notes and body marking. Optionally include a very simple scissor silhouette only if it does not crowd the icon. Use thick shapes, soft professional contrast, and no text. Vector-like app icon, readable at small sizes.

### Verification Checklist

- Reads as dog/pet records within one second.
- Paw mark and chart card remain visible at 32px.
- Pen/marking stroke supports "recording" without clutter.
- Does not look too much like a veterinary emergency app.
- Scissors, if present, are simple and not a tiny decoration.

### Must

- Must include a paw mark.
- Must include a chart/card shape.
- Must include a record/marking cue.
- Must feel grooming-friendly, not purely medical.

### Must Not

- Must not include realistic dog photos.
- Must not use detailed anatomy diagrams or tiny medical icons.
- Must not overuse scissors, combs, or many grooming tools.
- Must not include text or customer data visuals.

---

## 6. Video Auto Editing / ymm-shorts

### Product Understanding

ymm-shorts semi-automates YMM4 short-video production while preserving precise templates. It rewrites scripts/voice items, assists GUI operations, and prepares output without damaging manually tuned timeline placement.

### Core Message

Short-video editing steps are automated without breaking the template.

### Visual Concept

A vertical video frame, a simple timeline strip, and one automation lightning mark. Remove cursor details unless the icon needs more automation emphasis.

### Prompt

Create a clean modern app icon for a semi-automated short-video editing tool. Use a dark neutral rounded-square background. Center a vertical video frame with a play triangle. Under it, place a simple three-segment timeline strip with stable alignment, suggesting a preserved editing template. Add one bold yellow lightning mark near the timeline to show automation. Use simple vector-like shapes, thick edges, and high contrast. No text, no YMM4 UI, no screenshots, no cursor unless absolutely necessary. Readable at small sizes.

### Verification Checklist

- Reads as short-video editing within one second.
- Timeline strip suggests editing/template without tiny controls.
- Automation lightning remains visible at 32px.
- At 16px, video frame and play triangle still read clearly.
- Does not look like a generic media player only.

### Must

- Must include a vertical video frame.
- Must include a simplified timeline/template cue.
- Must include one automation cue such as lightning.
- Must avoid platform-specific UI.

### Must Not

- Must not copy YMM4 UI or include Japanese UI labels.
- Must not include detailed timelines, tiny tracks, or many control buttons.
- Must not include a large cursor if it crowds the composition.
- Must not suggest full SNS posting; this icon is editing, not publishing.

---

## 7. foodee

### Product Understanding

foodee is a restaurant-industry news tool. Users choose RSS feeds themselves and safely read relevant food-business news via list/card views and a temporary delivery buffer.

### Core Message

Choose and read restaurant-industry news feeds safely.

### Visual Concept

A white plate on a deep green background with a single red RSS wave rising from it. Add one small mint check on the plate rim to show user-selected/safe feed reading.

### Prompt

Create a clean modern app icon for a restaurant-industry news feed app called foodee. Use a deep green rounded-square background. Center a simple white plate. From the plate, show one bold tomato-red RSS wave symbol, simplified and readable. Add a small mint checkmark on the plate rim to suggest selected and safe feeds. Use only large geometric shapes and high contrast. No text, no newspaper, no fork, no article cards, no tiny feed items. Professional vector-like app icon, crisp and readable at small sizes.

### Verification Checklist

- Reads as food plus feed/news within one second.
- Plate and RSS wave remain clear at 32px.
- Checkmark supports selected/safe feed reading without becoming the main symbol.
- At 16px, food/feed still reads even if check detail disappears.
- Does not look like a recipe app or restaurant reservation app.

### Must

- Must include food-domain cue: plate.
- Must include feed/news cue: RSS wave.
- Must include at most one simple selection/safety cue.
- Must use a restrained palette with strong contrast.

### Must Not

- Must not include newspaper, fork, multiple article cards, or text.
- Must not use AI-summary imagery; AI summaries are not the product promise.
- Must not look like a delivery app or restaurant search app.

---

## 8. SNS Auto Posting / instagram-auto-ops

### Product Understanding

instagram-auto-ops is an Instagram operations automation package. It manages generated posts through a queue and publishes image, carousel, reel, and story content automatically with monitoring and reporting.

### Core Message

Queued posts are automatically published on schedule.

### Visual Concept

A large single post card, a small clock badge, and one thick send arrow. The design should communicate scheduled auto-posting without copying Instagram or using platform gradients.

### Prompt

Create a clean modern app icon for a social media auto-posting operations tool. Use a charcoal rounded-square background. Place one large white post card in the center. Add a small pale-blue clock badge at the card's upper-right corner. From the card, draw one thick coral send arrow moving upward/right, showing scheduled automatic publishing. Use simple bold geometric forms, high contrast, and no text. Do not use Instagram logos, camera glyphs, platform gradients, multiple cards, calendar grids, circular arrows, or tiny time labels. Professional vector-like app icon, readable at small sizes.

### Verification Checklist

- Reads as post scheduling/auto-posting within one second.
- Post card, clock badge, and send arrow are distinguishable at 32px.
- At 16px, it still reads as scheduled sending/publishing.
- Does not look like a generic calendar or task manager.
- Does not copy Instagram, X, TikTok, Meta, or other platform marks.

### Must

- Must include one dominant post card.
- Must include one schedule cue: clock badge.
- Must include one publishing cue: send arrow.
- Must avoid platform-specific branding.

### Must Not

- Must not use Instagram-like camera icons or gradients.
- Must not include multiple cards, circular arrows, calendars, or analytics charts.
- Must not include text, handles, hashtags, or social platform logos.
- Must not confuse publishing with content creation or analytics.
