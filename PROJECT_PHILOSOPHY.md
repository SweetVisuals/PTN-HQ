# Project Philosophy & Architecture

## Aim & Goals
The core aim of this application is to automate high-volume TikTok organic content management. It serves as a unified command center capable of scraping references, automatically assigning contextual metadata, and seamlessly scheduling thousands of TikTok short-form posts across a fleet of faceless/themed accounts. 

## Intention
To provide an **Execute-First, Automator-First** experience. The user should not be bogged down by manual drafting, drag-and-drop mechanics, or tedious post-by-post scheduling. The system must act as a strategic delegator:
- Input raw, bulk assets (TikTok URLs).
- Define account aesthetics, themes, and goals.
- Let the AI (DeepSeek Composer Engine) automatically structure, compose, and slot the content across optimal times.

## Idea
A sleek, dark, cyberpunk/luxury aesthetic dashboard that feels more like a terminal command center for a content empire than a traditional SaaS tool. It is split into two primary paradigms:
1. **Home/Workspace:** Where assets are imported, accounts are configured with strategic constraints (theme, goal, aesthetic), and the live agent is monitored. It features a realistic mobile preview (iPhone frame) for context.
2. **Calendar/Engine:** A purely visual schedule of automated slots.

## Core Philosophy & Objectives
- **Dark Neon / Minimalist Luxury Aesthetic:** Use deep blacks (`#050505`, `#09090b`), slate grays, and accented purples/emeralds. Never use generic white backgrounds for main areas.
- **Set It and Forget It Automation:** 
  - Posts are strictly auto-scheduled by the system.
  - Timeslots are predefined high-traffic windows: 9:00 AM, 1:00 PM, 5:00 PM, and 9:00 PM.
  - Strict spacing: No duplicate posts, strictly 1 post per timeslot per account, maintaining at least a 2.5-hour gap between posts (enforced naturally by the 4-hour slot spacing).
- **No Drag & Drop Pipeline:** The user does not manually place posts into the calendar. The calendar is a **read-only reflection** of the AI's orchestration.
- **Realistic Mobile Preview:** Immediate visual feedback of how the TikTok short will look, complete with engagement UI and "For You" page overlays.
- **Bulk First:** Capabilities like the Asset Scraper explicitly support bulk URLs, understanding that scale is the primary metric of success.
- **Focused Execution:** We only care about TikTok for now. Do not clutter the UI with Instagram or YouTube specifics. Keep the interface razor-sharp and tailored to short-form vertical mastery.
