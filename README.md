

# Generative UI Chatbot

This project is a Next.js-based chatbot that leverages Large Language Models (LLMs) to generate dynamic UI templates based on user requests. The assistant can respond with structured UI configurations (such as dashboards, tables, cards, charts, and more) using a special `generateDynamicUI` function, which are then rendered interactively in the frontend.

---

## What is Generative UI Chat?

Generative UI Chat enables users to interact with a conversational AI that can not only answer questions, but also dynamically create and render complex user interfaces on demand. By describing what you want in natural language, the chatbot can generate dashboards, data tables, visualizations, forms, and other interactive components—instantly and without manual coding.

---

## Use Cases

Generative UI Chatbots can be applied across a wide range of industries and scenarios, including but not limited to:

- **Business Intelligence & Analytics**
  - Instantly generate custom dashboards, charts, and reports from conversational queries.
  - Example: "Show me a sales dashboard for Q1 with a bar chart and a summary table."

- **Customer Support**
  - Render troubleshooting guides, FAQs, or ticket status boards dynamically based on user input.
  - Example: "Create a step-by-step guide for resetting my password."

- **E-commerce**
  - Build product catalogs, pricing tables, or personalized recommendations in real time.
  - Example: "Show me a comparison table of the latest smartphones under $500."

- **Healthcare**
  - Visualize patient data, appointment schedules, or medication timelines interactively.
  - Example: "Display a calendar of my upcoming appointments and a chart of my recent lab results."

- **Education**
  - Generate interactive quizzes, progress dashboards, or learning timelines for students.
  - Example: "Create a quiz with 5 questions on world history and show my progress."

- **Project Management**
  - Create Kanban boards, timelines, or team status feeds on demand.
  - Example: "Build a Kanban board for my current sprint with columns for To Do, In Progress, and Done."

- **Finance**
  - Render portfolio summaries, transaction tables, or financial charts conversationally.
  - Example: "Show a pie chart of my monthly expenses and a table of recent transactions."

- **HR & Operations**
  - Generate employee directories, onboarding checklists, or event calendars.
  - Example: "Create a profile card for a new employee and add it to the team directory."

---
![image](https://github.com/user-attachments/assets/c17ec7aa-f345-442c-a4e1-2f9e8d439f8f)

![image](https://github.com/user-attachments/assets/48bd560a-efc1-4b3e-89c1-509ded0516b3)
![image](https://github.com/user-attachments/assets/3ed12e86-ebe1-4bd3-b0ec-f3cfcb2d6df2)
![image](https://github.com/user-attachments/assets/c6195744-3041-4e73-83d1-a9b8fbf1771c)

## What This Enables

With the rise of chatbots and conversational AI, Generative UI Chat unlocks new possibilities:

- **No-Code UI Creation:** Users can build and customize interfaces without technical skills, simply by describing their needs in chat.
- **Personalized Experiences:** Each user can receive tailored dashboards, reports, or workflows based on their unique requirements.
- **Rapid Prototyping:** Teams can quickly visualize ideas, iterate on designs, and share interactive prototypes—all within a chat interface.
- **Industry Agnostic:** The approach is flexible and can be adapted to any domain where dynamic data visualization or workflow automation is valuable.
- **Seamless Integration:** The system can be connected to various data sources or APIs, enabling real-time, data-driven UI generation.

---

## Features

- **Conversational UI:** Chat with an AI assistant that understands requests for dashboards, tables, charts, and more.
- **Dynamic UI Generation:** The assistant can return UI templates in a special `tool_code` block, which are parsed and rendered live.
- **LLM Integration:** Works with any Large Language Model capable of structured output for flexible, generative responses.
- **Customizable Templates:** Supports a variety of UI types (dashboard, dataTable, productCatalog, profileCard, timeline, gallery, pricing, stats, calendar, wizard, chart, map, kanban, feed).
- **Edge Runtime:** API routes run on the Vercel Edge Runtime for low latency.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Generative AI API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/generative-ui-chatbot.git
   cd generative-ui-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your Google API key:
   ```
   GOOGLE_API_KEY=your-google-api-key-here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
/app
  /api/chat/route.ts      # API route for chat, integrates with Gemini
  /page.tsx               # Main chat UI page
/components
  /dynamic-template.tsx   # Renders dynamic UI templates
  /ui/                    # Reusable UI components (Button, Input, Card, etc.)
/lib
  /gemini-tools.ts        # Helper functions for parsing Gemini responses
  /template-schemas.ts    # Template schema definitions and examples
```

---

## How It Works

1. **User sends a message** in the chat UI.
2. **API route** (`/api/chat/route.ts`) sends the conversation to Gemini, including a system prompt with template schemas and examples.
3. **Gemini responds** with either a plain answer or a `tool_code` block containing a `generateDynamicUI(...)` function call.
4. **Frontend parses** the `tool_code` block using `parseToolCode` and renders the corresponding UI using `DynamicTemplate`.

---

## Customization

- **Add new templates:**  
  Define new schemas and examples in `/lib/template-schemas.ts`.
- **Change system prompt:**  
  Edit the prompt in `/api/chat/route.ts` to guide the assistant's behavior.
- **UI tweaks:**  
  Modify components in `/components/ui/` or `/components/dynamic-template.tsx`.

---

## Troubleshooting

- **Parsing errors:**  
  Ensure all keys and string values in `tool_code` blocks use double quotes (`"`), not single quotes (`'`).
- **API errors:**  
  Check your `GOOGLE_API_KEY` and network connectivity.
- **Debugging:**  
  Use `console.log` or the Next.js debugger to trace issues in parsing or API calls.

---

## License

MIT

---

## Credits

- [Google Generative AI](https://ai.google.dev/)
- [Next.js](https://nextjs.org/)