# Cinematic Website Content Generator

## Overview
This skill enables an AI agent to create cinematic advertisements, product videos, and B-roll content end-to-end. The agent analyzes products, generates creative storyboard directions, creates detailed visual storyboards, and produces final cinematic videos.

## Workflow Steps

### Step 1: Product Analysis & Brief Extraction
When a user provides a product image or description:

1. **Extract Product Details:**
   - Brand name
   - Product name
   - Product category
   - Key visual characteristics (color, texture, form factor)
   - Target use case / context

2. **Identify Marketing Angles:**
   - What makes this product unique?
   - What emotions should the content evoke?
   - What are the key product benefits to highlight?

3. **Present findings to user for approval** before proceeding to step 2.

**Quality Gate:** User confirms the product analysis is accurate.

---

### Step 2: Storyboard Direction Generation
Generate 3 distinct creative storyboard directions that highlight the product effectively.

For each direction, provide:
- **Concept Name:** (e.g., "Liquid Ground," "First Light Sprint")
- **Core Vibe:** The emotional tone and aesthetic (e.g., dynamic, serene, explosive)
- **Hero Moment:** The key moment that showcases the product
- **Visual Keywords:** 3-5 descriptive terms for the visual style
- **Why This Works:** Brief explanation of how this direction serves the product and brand

**Format Example:**
```
Concept: Liquid Ground
Vibe: Explosive dynamism with liquid transitions
Hero Moment: Shoe strikes into glassy mint pool with explosive spray
Keywords: crystalline explosion, slow-motion water, metallic reflections
Why This Works: Creates visual drama while highlighting product's speed and agility
```

**Quality Gate:** User selects their preferred direction or requests modifications.

---

### Step 3: Detailed Storyboard Generation
Once direction is approved, create a comprehensive storyboard with:

1. **Scene Breakdown:** 6-8 panels with:
   - Time code (e.g., 0-2 sec, 2-4 sec)
   - Scene description
   - Camera technique (tracking shot, macro, wide angle, etc.)
   - Key product placement
   - Color palette notes

2. **Technical Specifications:**
   - Duration: 15 seconds (default, can vary)
   - Aspect ratio: 16:9 (default for cinematic)
   - Resolution: 1080p or 4K
   - Frame rate: 24fps (cinematic standard)

3. **Image Generation via Codex CLI:**
   - Agent calls Codex to analyze product and approved direction
   - Codex CLI writes optimized storyboard prompt
   - Codex orchestrates DALL-E 3 to generate multi-panel storyboard
   - Codex ensures product fidelity across all panels

**Codex CLI automatically handles:**
```
codex create:storyboard-prompt \
  --product-image product.jpg \
  --product-name "On Running Shoe" \
  --direction "liquid-ground" \
  --panels 6 \
  --duration 15 \
  --style "cinematic-sports" \
  --output storyboard-prompt.txt

# Generates optimized prompt, then:
codex generate:storyboard \
  --prompt-file storyboard-prompt.txt \
  --product-reference product.jpg \
  --model dalle-3 \
  --resolution 1920x1080 \
  --panels 6 \
  --output storyboard.png
```

**Prompt structure Codex creates:**
- "6-panel cinematic storyboard"
- Exact camera movements and angles for each panel
- Timecode overlays (0-2s, 2-4s, etc.)
- "Maintain product fidelity to reference image"
- Professional storyboard format with text
- Consistent styling matching the approved direction vibe

**Quality Gate:** User reviews storyboard and approves or requests changes.

---

### Step 4: Final Video Generation via Sora
Once storyboard is approved, Codex CLI orchestrates the Sora workflow.

1. **Sora Video Generation via Codex:**
   ```
   codex create:video-prompt \
     --storyboard storyboard.png \
     --product-name "On Running Shoe" \
     --direction "liquid-ground" \
     --duration 15 \
     --output video-prompt.txt

   codex generate:sora-video \
     --prompt-file video-prompt.txt \
     --storyboard-reference storyboard.png \
     --product-reference product.jpg \
     --duration 15 \
     --resolution 1920x1080 \
     --aspect-ratio 16:9 \
     --output raw-video.mp4
   ```

2. **Video Generation Workflow:**
   - Codex analyzes storyboard structure and timing
   - Writes Sora-compatible prompt referencing each panel
   - Example: "Turn this 6-panel storyboard into a cinematic 15-second product advertisement. Match the timing: 0-2s takeoff scene, 2-4s shockwave, 4-6s macro shot, etc. Ensure product is clearly featured in the hero moment with explosive spray transitions."
   - Orchestrates Sora to generate video from storyboard reference
   - Maintains product fidelity from reference image

3. **FFmpeg Post-Processing via Codex:**
   ```
   codex postprocess:video \
     --input raw-video.mp4 \
     --effects color-grade \
     --audio-track background-music.mp3 \
     --audio-mix dialogue,ambient \
     --output final-video.mp4 \
     --quality high
   ```
   - Color grading for cinematic look
   - Audio/music sync
   - Motion blur effects (optional)
   - Watermark/branding (optional)
   - Creates broadcast-quality deliverable

4. **Deliverable:**
   ```
   codex export:video \
     --input final-video.mp4 \
     --formats mp4,webm,mov \
     --output-dir ./exports/
   ```
   - Final video file ready for web/social
   - Multiple format exports
   - Provide download link or embed option
   - Allow user to request revisions or regenerate with different specs

**Quality Gate:** User reviews final video and approves or requests changes.

---

## Key Instructions for the Agent

### How to Use Codex CLI
The agent should invoke Codex CLI commands on the terminal to:
1. **Generate optimal prompts** for each stage
2. **Orchestrate image generation** with DALL-E 3
3. **Create Sora workflows** for video generation
4. **Automate post-processing** with FFmpeg
5. **Manage the entire cinematic pipeline**

The agent should call Codex like this:
```bash
# Step 3: Generate storyboard
codex generate:storyboard --product-image ./product.jpg --direction "liquid-ground" --panels 6 --output ./storyboard.png

# Step 4: Generate video
codex generate:sora-video --storyboard storyboard.png --product-reference product.jpg --duration 15 --output raw-video.mp4

# Post-process
codex postprocess:video --input raw-video.mp4 --effects color-grade --audio background-music.mp3 --output final-video.mp4
```

Codex CLI handles all the complexity—the agent just needs to call the right commands at each step.

### Tone & Approach
- Always explain what you're doing at each step
- Ask for user approval before moving forward (quality gates)
- Offer to refine or adjust at any stage
- Be creative but aligned with the approved direction
- Use Codex CLI to handle all technical heavy lifting

### Technical Details
- Reference images should be clean, well-lit product shots
- Keep storyboards detailed but readable
- Ensure text on images is legible and properly spelled
- Match color palettes and lighting across all panels

### Special Cases
- **Human Faces in Content:** If storyboard includes people, blur faces to avoid detection policies. Let the video model fill in the faces naturally.
- **B-Roll vs Ads:** The same workflow works for product videography and B-roll—just adjust the prompt language in Step 4.
- **Alternative Projects:** This workflow extends to any creative project (anime shorts, music videos, etc.)—adapt Step 2 direction language accordingly.

### Cost & Resource Management
- Inform user of estimated costs for video generation before proceeding to Step 4
- Offer preview of the exact model/resolution/duration specifications before rendering

---

## Integration Points: Codex CLI

### Codex CLI as Orchestration Layer
Codex CLI handles the entire cinematic pipeline:

1. **Prompt Generation & Optimization**
   - Codex writes cinematic prompts for each step
   - Optimizes prompts for DALL-E image generation
   - Creates detailed Sora-compatible video prompts

2. **Image Generation Pipeline**
   ```
   codex generate:storyboard \
     --product-image ./product.jpg \
     --direction "liquid-ground" \
     --panels 6 \
     --output ./storyboard.png
   ```
   - Calls DALL-E 3 for storyboard generation
   - Maintains product fidelity across panels
   - Embeds timecodes and scene descriptions

3. **Video Generation with Sora**
   ```
   codex generate:cinematic-video \
     --storyboard ./storyboard.png \
     --product-image ./product.jpg \
     --duration 15 \
     --format 16:9 \
     --output ./video.mp4
   ```
   - Orchestrates Sora workflow
   - Syncs video timing to storyboard
   - Handles Sora-specific parameters

4. **FFmpeg Automation**
   ```
   codex postprocess:video \
     --input ./video.mp4 \
     --effects color-grade,motion-blur \
     --audio background-music.mp3 \
     --output ./final-video.mp4
   ```
   - Applies color grading
   - Adds motion effects
   - Syncs audio/music
   - Creates final deliverable

5. **Automation Agents**
   - Codex creates agent scripts that manage the full pipeline
   - Handles retries, error handling, asset management
   - Logs all processes for transparency

### Models & Services Used
- **Product Analysis:** Claude's vision capabilities
- **Image Generation:** DALL-E 3 (orchestrated by Codex)
- **Video Generation:** OpenAI Sora (orchestrated by Codex)
- **Video Post-Processing:** FFmpeg (automated by Codex)
- **Prompt Engineering:** Codex CLI
- **Workflow Orchestration:** Codex CLI

### Workflow Customization
- Users can skip quality gates if they want end-to-end generation (at own risk)
- Storyboard style can be adapted (realistic, animated, sketch-based, etc.)
- Video length and resolution are configurable
- Can chain multiple products in batch
- Codex CLI handles all technical complexity transparently

---

## Example Conversation Flow

**User:** "Create a cinematic ad for this on running shoe. Emphasize speed and dynamism."

**Agent:** 
1. Analyzes the shoe image
2. Generates 3 storyboard directions
3. Waits for user selection
4. Creates detailed storyboard once direction approved
5. Shows video generation specs and waits for confirmation
6. Renders final 15-second video
7. Delivers video and asks for feedback

---

## Terminal Implementation Guide

### Complete Workflow via Codex CLI

**Full automation from product to final video:**

```bash
#!/bin/bash
# Cinematic Website Content Pipeline

# Step 1: Analyze Product & Generate Directions
codex analyze:product \
  --product-image ./input/product.jpg \
  --output ./analysis/product-analysis.json

# Step 2: Generate Storyboard Directions (handled by agent approval)
# (Agent presents 3 directions to user, user selects one)

# Step 3: Generate Storyboard
codex create:storyboard-prompt \
  --product-name "On Running Shoe" \
  --direction "liquid-ground" \
  --panels 6 \
  --output ./prompts/storyboard-prompt.txt

codex generate:storyboard \
  --prompt-file ./prompts/storyboard-prompt.txt \
  --product-reference ./input/product.jpg \
  --output ./assets/storyboard.png

# Step 4: Generate Sora Video
codex create:video-prompt \
  --storyboard ./assets/storyboard.png \
  --output ./prompts/video-prompt.txt

codex generate:sora-video \
  --prompt-file ./prompts/video-prompt.txt \
  --storyboard-reference ./assets/storyboard.png \
  --product-reference ./input/product.jpg \
  --duration 15 \
  --output ./assets/raw-video.mp4

# Step 5: Post-Process & Export
codex postprocess:video \
  --input ./assets/raw-video.mp4 \
  --effects color-grade,motion-blur \
  --audio ./audio/background-music.mp3 \
  --output ./assets/final-video.mp4

codex export:video \
  --input ./assets/final-video.mp4 \
  --formats mp4,webm \
  --output-dir ./exports/
```

### Agent Integration with Codex CLI

The agent should:
1. Receive product image and user brief
2. Run Codex analysis → present findings
3. Wait for user approval → proceed to Step 3
4. Run Codex storyboard generation → show storyboard
5. Wait for user approval → proceed to Step 4
6. Run Codex video generation → show video
7. Offer refinements or export options

### Subscription & Authentication
- Codex CLI uses your existing subscription
- All models (DALL-E 3, Sora, FFmpeg) accessed via Codex
- No additional API keys needed if configured locally

### File Structure
```
project/
├── input/
│   └── product.jpg
├── prompts/
│   ├── storyboard-prompt.txt
│   └── video-prompt.txt
├── assets/
│   ├── storyboard.png
│   ├── raw-video.mp4
│   └── final-video.mp4
├── audio/
│   └── background-music.mp3
└── exports/
    ├── final-video.mp4
    └── final-video.webm
```

## Success Metrics
- Storyboard accurately reflects product and approved direction
- Final video is cinematic and engaging
- Product is clearly visible and highlighted
- Timing matches storyboard specifications
- User is satisfied with the creative output
- Codex CLI executes all commands without errors
- Final video is exported in desired formats
