Detailed Implementation Plan to Build a Clone of Unusual
This implementation plan outlines the steps to build a clone of Unusual, a tool that personalizes website content based on visitor sources, with Webflow as a use case for integration. The system will include a server-side backend, a client-side script, and a user interface, ensuring compatibility with platforms like Webflow via script injection. The plan is structured with phases, tasks, timelines, and resources, aiming for a functional product within a reasonable timeframe.
Project Overview
Objective: Build a system that dynamically personalizes website content based on visitor sources (e.g., ads, blog posts, emails) with a simple script integration, API support, and a user-friendly dashboard.
Key Features:
Two-line script integration for any website, including Webflow.
Rule-based personalization (e.g., referrer, URL parameters).
Dashboard for managing sources and content.
API for programmatic content creation.
Target Use Case: Integration with Webflow sites via custom code.
Team: Assumes a small team (1-2 developers, 1 designer) or a solo developer with full-stack skills.
Timeline: 8 weeks for an MVP (Minimum Viable Product), with additional time for polish and scaling.
Phase 1: Planning and Setup (Week 1)
Goal: Define requirements, set up the development environment, and establish the project structure.
Tasks:
Requirement Analysis
Review Unusual’s features: script integration, personalization from traffic sources, outbound sales support, one-off landing pages via prompt/API.
Define core MVP features: script-based personalization, basic rule types (referrer_contains, url_param_equals), dashboard for source management, API for content retrieval.
Document Webflow integration needs: script placement in "Before </body> tag," targeting elements via selectors or custom attributes.
Tech Stack Selection
Backend: Node.js with Express.js (fast setup, JavaScript ecosystem).
Database: MongoDB (flexible schema for sources and content).
Frontend (UI): React (rapid development, component-based).
Hosting: AWS (EC2 for server, S3 for static script file).
Tools: Git (version control), Postman (API testing), VS Code (IDE).
Project Setup
Initialize Git repository (e.g., GitHub).
Set up Node.js project with npm init.
Install dependencies: express, mongoose, jsonwebtoken, dotenv (for environment variables).
Create basic folder structure: /server, /client, /scripts.
Environment Configuration
Configure .env for database URI, JWT secret, and server port.
Set up MongoDB locally or via Atlas (cloud option).
Deliverables:
Requirements document.
Initialized project repository with basic structure.
Development environment ready.
Resources:
Developer time: 10-15 hours.
References: Node.js Documentation, MongoDB Atlas.
Phase 2: Backend Development (Weeks 2-3)
Goal: Build the server-side system to manage users, sources, and content delivery.
Tasks:
Database Schema Design
Users: { email: String, password: String (hashed), user_id: ObjectId }.
Sources: { user_id: ObjectId, name: String, rule_type: String, rule_value: String, param_name: String, param_value: String, replacements: [{ selector: String, content: String }], priority: Number }.
Use Mongoose for schema definition and validation.
Authentication
Implement /register and /login endpoints using JWT.
Hash passwords with bcrypt.
Example:
javascript
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
});
Source Management API
CRUD endpoints: /sources (GET, POST, PUT, DELETE), protected with JWT middleware.
Example POST:
javascript
app.post('/sources', authenticate, async (req, res) => {
    const source = new Source({ ...req.body, user_id: req.user._id });
    await source.save();
    res.status(201).json(source);
});
Content Delivery Endpoint
/get_content: Accept POST requests with { user_id, referrer, url }, match rules, return replacements.
Example:
javascript
app.post('/get_content', async (req, res) => {
    const { user_id, referrer, url } = req.body;
    const sources = await Source.find({ user_id }).sort({ priority: 1 });
    for (const source of sources) {
        if (await doesSourceMatch(source, referrer, url)) {
            return res.json({ replacements: source.replacements });
        }
    }
    res.json({ replacements: [] });
});
Security and Performance
Sanitize content fields with sanitize-html to prevent XSS.
Add basic caching with memory-cache for frequent user_id lookups.
Deliverables:
Functional backend with API endpoints.
Database with sample data (1 user, 2-3 sources).
Postman collection for testing endpoints.
Resources:
Developer time: 30-40 hours.
References: Express.js Guide, Mongoose Documentation.
Phase 3: Client-Side Script Development (Week 4)
Goal: Create a script that integrates with websites, including Webflow, to fetch and apply personalized content.
Tasks:
Script Design
Capture document.referrer, window.location.href, and user_id from script tag query parameter.
Send data to /get_content and update DOM with received content.
Implementation
Example:
javascript
(function() {
    var user_id = new URLSearchParams(window.location.search).get('user_id') || (function() {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src.includes('unusual.js')) {
                return new URLSearchParams(scripts[i].src.split('?')[1]).get('user_id');
            }
        }
    })();
    if (!user_id) return console.error('User ID missing');
    var referrer = document.referrer;
    var url = window.location.href;
    fetch('https://yourserver.com/get_content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, referrer, url })
    })
    .then(res => res.json())
    .then(data => {
        data.replacements.forEach(r => {
            var el = document.querySelector(r.selector);
            if (el) el.innerHTML = r.content;
        });
    })
    .catch(err => console.error('Error:', err));
})();
Minify with a tool like UglifyJS for production.
Webflow Compatibility
Test on a Webflow site by adding <script src="https://yourserver.com/unusual.js?user_id=123"></script> in "Custom Code" > "Before </body> tag."
Ensure selectors match Webflow’s structure (e.g., .w- classes or custom data-unusual attributes).
Fallbacks
Handle missing elements or failed fetches gracefully (e.g., log errors without breaking the site).
Deliverables:
Working unusual.js script.
Test integration on a sample Webflow site with 2-3 elements updated.
Resources:
Developer time: 15-20 hours.
References: Webflow Custom Code, Fetch API.
Phase 4: User Interface Development (Weeks 5-6)
Goal: Build a dashboard for users to manage sources and generate the script.
Tasks:
Setup React Project
Use create-react-app to bootstrap the frontend.
Install dependencies: axios (API calls), react-router-dom (routing).
Components
Login/Register: Forms to authenticate users, store JWT in localStorage.
Dashboard: List sources, with buttons to add/edit/delete.
Source Form: Inputs for name, rule_type, rule_value, replacements (multiple selector/content pairs), priority.
Script Generator: Display <script src="https://yourserver.com/unusual.js?user_id={user_id}"></script>.
API Integration
Connect to backend endpoints for CRUD operations and authentication.
Example fetch for sources:
javascript
const fetchSources = async () => {
    const res = await axios.get('/sources', { headers: { Authorization: `Bearer ${token}` } });
    setSources(res.data);
};
Design
Use a CSS framework like Tailwind CSS for quick, responsive styling.
Ensure mobile-friendly layout for Webflow users managing on the go.
Deliverables:
Functional dashboard hosted locally.
Basic styling and usability tested.
Resources:
Developer time: 30-40 hours.
Designer time (optional): 10 hours.
References: React Docs, Tailwind CSS.
Phase 5: Testing and Deployment (Weeks 7-8)
Goal: Test the system end-to-end and deploy it for public use.
Tasks:
Unit Testing
Test backend endpoints with Jest (e.g., rule matching logic).
Test script with different referrer/URL scenarios.
Integration Testing
Deploy backend locally, test with script and dashboard.
Simulate Webflow integration: export a Webflow site, add script, verify content updates.
Deployment
Backend: Deploy to AWS EC2, configure MongoDB Atlas, set up domain (e.g., yourserver.com).
Script: Host unusual.js on AWS S3 with CDN (CloudFront) for fast delivery.
Frontend: Build React app, deploy to Netlify or Vercel.
Documentation
Write a README with setup instructions for Webflow users (e.g., adding script, defining selectors).
Deliverables:
Deployed MVP accessible online.
Test report with bug fixes.
User guide for Webflow integration.
Resources:
Developer time: 20-25 hours.
References: AWS EC2, Netlify.
Timeline Summary
Phase
Duration
Key Deliverables
Planning & Setup
Week 1
Requirements, project structure
Backend
Weeks 2-3
API, database, content delivery
Script
Week 4
Client-side script, Webflow test
UI
Weeks 5-6
Dashboard, script generator
Testing & Deploy
Weeks 7-8
Deployed MVP, documentation
Additional Considerations
Budget: $20/month for AWS EC2 (t2.micro), MongoDB Atlas (free tier initially), domain ($10/year).
Scaling: Add Redis caching post-MVP for high traffic.
Enhancements: API for one-off pages, AI content generation (e.g., integrate with xAI’s API if available).
This plan provides a structured path to build a functional clone of Unusual, tested with Webflow, within 8 weeks for an MVP. Adjust timelines based on team size and expertise.