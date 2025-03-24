Step-by-Step Explanation of the User Experience (UX) for the Unusual Clone App
This explanation details the UX for a clone of Unusual, a tool that personalizes website content based on visitor sources, designed with a server-side system, client-side script, and user interface (dashboard). The app serves two primary user types: website owners (who set up and manage personalization) and visitors (who experience the personalized content on the website). Below, I’ll break down the UX step-by-step for both perspectives, focusing on usability, flow, and interaction with the system, with Webflow as an integration use case.
UX for Website Owners
Website owners interact with the app primarily through the dashboard to set up personalization and integrate it into their sites. The UX is designed to be intuitive, efficient, and aligned with Unusual’s promise of a “two-line code integration” and seamless personalization setup.
Step 1: Onboarding (Sign-Up and Initial Setup)
Action: The user visits the app’s landing page (e.g., yourapp.com) and clicks “Get Started” or “Sign Up.”
Experience:
A clean, minimal form appears asking for email and password. A tagline like “Personalize your website in minutes” reinforces the value proposition.
After submission, a confirmation email with a verification link is sent. Clicking the link logs the user in automatically for a frictionless start.
Feedback: Success message: “Account created! Check your email to verify.” Post-verification: “Welcome aboard! Let’s set up your first personalization.”
UX Goal: Quick, low-barrier entry with clear next steps.
Step 2: Dashboard Overview
Action: User lands on the dashboard after login.
Experience:
A sidebar includes navigation: Dashboard, Sources, Script, Account.
The main view shows a welcome card: “Add your first personalization source” with a prominent “Create Source” button. If sources exist, a table lists them (Name, Rule, Last Edited, Status).
A top-right profile icon allows logout or settings access.
Feedback: Tooltips or a guided tour (e.g., “Here’s where you manage your personalization rules”) for first-time users.
UX Goal: Immediate orientation; encourage action without overwhelming.
Step 3: Creating a Personalization Source
Action: User clicks “Create Source” to define a personalization rule.
Experience:
A modal or full-screen form opens with:
Name: Text input (e.g., “Facebook Traffic”).
Rule Type: Dropdown (e.g., “Referrer Contains”, “URL Parameter Equals”).
Rule Details: Conditional fields based on rule type (e.g., “facebook.com” for referrer; “source” and “blog1” for URL param).
Replacements: Addable sections for pairs of Selector (e.g., #header) and Content (rich text editor for HTML like “Welcome from Facebook!”).
Priority: Number input (default 1, higher runs first).
A “Test Rule” button lets users input a sample referrer/URL to preview matches.
Feedback: Real-time validation (e.g., “Selector must start with # or .”); success message: “Source saved!” with option to add another.
UX Goal: Intuitive rule setup with flexibility and instant feedback.
Step 4: Generating and Adding the Script
Action: User navigates to the “Script” tab to get the integration code.
Experience:
A card displays: <script src="https://yourserver.com/unusual.js?user_id=USER_ID"></script> with a “Copy” button. The USER_ID is auto-generated and unique to the user.
Instructions below explain: “Paste this in your site’s HTML before the </body> tag. For Webflow, add it in Site Settings > Custom Code > Before </body>.”
A “How to Integrate” link opens a modal with a video or step-by-step guide (e.g., screenshots for Webflow).
Feedback: “Code copied!” toast notification after clicking Copy.
UX Goal: Seamless script retrieval; clear, platform-specific guidance (e.g., Webflow).
Step 5: Managing Sources
Action: User returns to “Sources” to edit or delete existing rules.
Experience:
Table view: Each row shows source details with Edit and Delete buttons.
Edit reopens the creation form pre-filled; Delete prompts confirmation (“Are you sure?”).
A toggle per source enables/disables it without deletion.
Feedback: “Source updated!” or “Source deleted!” messages; table refreshes instantly.
UX Goal: Easy management with minimal clicks; safety nets like confirmation dialogs.
Step 6: Testing Integration
Action: User adds the script to their site (e.g., Webflow) and tests it.
Experience:
In Webflow, they paste the script in Site Settings > Custom Code, publish the site, and visit it with a URL like ?source=blog1 or from a referrer (e.g., facebook.com).
The dashboard offers a “Preview” tool: Enter a URL/referrer combo to simulate what visitors see.
Feedback: On the site, targeted elements update (e.g., #header changes to “Welcome from Facebook!”). Preview shows a mock page with applied changes.
UX Goal: Confidence in setup; ability to verify before going live.
Step 7: Advanced Features (Post-MVP)
Action: User explores API or prompt-based creation.
Experience:
“API” tab provides endpoint docs (e.g., POST /sources) and an API key.
“Create with Prompt” (optional) lets users type “Make a landing page for email leads” and generates content (if AI-integrated).
Feedback: API key copied; generated content previewed before saving as a source.
UX Goal: Power-user functionality with minimal complexity.
UX for Website Visitors
Visitors experience the personalization seamlessly on the website owner’s site (e.g., a Webflow site) without interacting with the app directly.
Step 1: Arriving at the Site
Action: Visitor clicks a link (e.g., from a blog post with ?source=blog1 or a Facebook ad).
Experience:
Lands on the site (e.g., yoursite.com/?source=blog1). The page loads normally with default content.
Feedback: No visible delay; standard site experience initially.
UX Goal: Non-intrusive entry; feels like a typical website visit.
Step 2: Personalization Trigger
Action: The script (unusual.js) runs after page load.
Experience:
Script detects referrer (e.g., “facebook.com”) or URL parameter (e.g., source=blog1), sends data to the backend, and receives replacements.
Targeted elements update (e.g., a headline changes from “Welcome” to “Welcome from Facebook!”; a paragraph highlights a blog-featured product).
Feedback: Content shifts subtly within 1-2 seconds (depending on network speed). No jarring reloads; updates feel intentional.
UX Goal: Smooth, relevant personalization without disrupting flow.
Step 3: Fallback for Unknown Sources
Action: Visitor arrives without a defined source (e.g., direct traffic).
Experience:
Script returns no replacements; default content remains unchanged (e.g., generic “Welcome to our site”).
Feedback: Consistent experience; no errors or blank sections.
UX Goal: Graceful degradation; maintains professionalism.
Step 4: Multi-Element Personalization
Action: Visitor sees multiple updates based on source.
Experience:
If the source defines multiple replacements (e.g., header, footer, CTA), all update simultaneously (e.g., header: “Email Special Offer,” CTA: “Claim Your Discount”).
Feedback: Cohesive messaging tailored to the source (e.g., email campaign).
UX Goal: Enhanced engagement through context-aware content.
Design Principles and Considerations
Simplicity: Minimal steps for setup (e.g., two-line script integration); clear labels and tooltips in the dashboard.
Feedback: Immediate confirmation of actions (e.g., “Source saved!”); real-time previews for testing.
Flexibility: Supports multiple rule types and replacements; works with any site, including Webflow’s dynamic class names via custom attributes (e.g., data-unusual).
Performance: Script loads asynchronously to avoid blocking page render; backend caching ensures quick responses.
Accessibility: Dashboard uses high-contrast colors, keyboard navigation; script-injected content inherits site’s accessibility.
Sample Flow (Website Owner Perspective)
Sign Up: Enters email/password, verifies via email (2 mins).
Create Source: Adds “Blog Traffic” with rule “url_param_equals source=blog1,” sets #header to “Blog Readers Welcome!” (5 mins).
Get Script: Copies <script src="https://yourserver.com/unusual.js?user_id=123"></script>, pastes into Webflow (2 mins).
Test: Visits yoursite.com/?source=blog1, sees header update (1 min).
Manage: Edits source to add a footer replacement, re-tests (3 mins).
Sample Flow (Visitor Perspective)
Click Link: Clicks blog link yoursite.com/?source=blog1.
See Personalization: Page loads, header changes to “Blog Readers Welcome!” within 1-2 seconds.
Engage: Reads tailored content, clicks a CTA if relevant.
Unexpected Detail
An interesting UX twist is the “Test Rule” feature in the dashboard, letting owners simulate visitor experiences instantly. This builds trust and reduces trial-and-error on live sites, especially for Webflow users unfamiliar with coding.
Conclusion
The UX balances ease of use for website owners with seamless personalization for visitors. For owners, it’s about quick setup and clear control; for visitors, it’s about relevant, unobtrusive content changes. The dashboard’s intuitive design and the script’s lightweight integration ensure this clone mirrors Unusual’s promise of effortless personalization, tailored to platforms like Webflow.