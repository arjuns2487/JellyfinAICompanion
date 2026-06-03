# Jellyfin AI Companion 🧠

Enhance your Jellyfin media server with a context-aware AI assistant. This companion script integrates directly into the Jellyfin web interface, allowing you to ask questions, get recommendations, and learn more about the movies and shows you're currently viewing.

It connects to your local LLM (Large Language Model) running on **Ollama** or **LM Studio** and automatically fetches additional context from Wikipedia and DuckDuckGo to provide rich, accurate responses.

## Features

*   **Context-Aware Chat:** Automatically detects the movie or show you are viewing and uses its metadata as context.
*   **Web Search Integration:** Fetches additional information from Wikipedia (using the title and year for accuracy) and DuckDuckGo to augment the AI's knowledge base.
*   **Local LLM Support:** Fully compatible with local inference servers like Ollama and LM Studio (completely private, running on your own hardware).
*   **Dynamic Model Selection:** Automatically fetches and lets you select available models from your LLM endpoint.
*   **Integrated UI:** A comfortable, resizable chat interface with adjustable font sizes that floats over your Jellyfin web app.

## Installation

To install the companion, you need to add the `companion.js` script to your Jellyfin web directory and link it in the `index.html` file.

### 1. Locate your Jellyfin Web Directory
*   **Windows:** Usually `C:\Program Files\Jellyfin\Server\jellyfin-web`
*   **Linux (Debian/Ubuntu):** Usually `/usr/share/jellyfin/web`
*   **Docker:** You will need to mount or copy the file into the `/usr/share/jellyfin/web` directory inside the container.
*   **macOS:** Usually `/Applications/Jellyfin.app/Contents/Resources/jellyfin-web` (varies by installation method).

### 2. Copy the Script
Copy the `companion.js` file from this repository into the `jellyfin-web` directory you located in step 1.

### 3. Edit `index.html`
Open the `index.html` file located in the `jellyfin-web` directory using a text editor (you may need Administrator/Root privileges).
Scroll to the very bottom of the file, and insert the following script tag **just before** the closing `</body>` tag:

```html
<script src="companion.js"></script>
```

*Note: Ensure it is typed exactly as `<script src="companion.js"></script>` and not `<script>companion.js</script>`.*

Save the file and refresh your Jellyfin web page in the browser. (Note: You may need to clear your browser cache).

## Setup and Usage

1.  **Start your LLM:** Launch either **LM Studio** or **Ollama** on your machine and start the local server. Make sure you have downloaded at least one model.
    *   *Tip for Ollama:* You may need to set the `OLLAMA_ORIGINS` environment variable to `*` to allow CORS requests from Jellyfin.
2.  **Open Jellyfin:** Navigate to your Jellyfin web interface and open a movie or TV show details page.
3.  **Open the Companion:** Click the 🧠 located on the page to open the chat interface.
4.  **Configure the Endpoint:** 
    *   In the settings/input area, enter your local LLM endpoint URL. 
    *   For **LM Studio**, this is typically `http://localhost:1234/v1`
    *   For **Ollama**, this is typically `http://localhost:11434/v1`
5.  **Select a Model:** Once the endpoint is entered, the companion will fetch the available models from your local server. Choose your preferred model from the dropdown list.
6.  **Chat!** Ask the assistant anything about the current media. 

## What You Can Ask

Because the AI is injected with context from Jellyfin's metadata, Wikipedia summaries, and DuckDuckGo search results, it has a rich understanding of what you are watching. You can ask a wide variety of questions, such as:

*   **Plot & Lore:** "Can you explain the ending of this movie?" or "What is the lore behind the main character's abilities?"
*   **Behind the Scenes:** "Who directed this and what else have they worked on?" or "Are there any interesting production facts?"
*   **Recommendations:** "I really loved the themes explored in this series. Can you recommend 3 other shows that are similar and explain why?"
*   **Reviews & Reception:** "How did critics respond to this film when it first came out?"

## How It Works under the Hood

1.  **Metadata Extraction:** Every time you open a media page, the script reads the Jellyfin page contents to extract the title, release year, description, and genres of the current item.
2.  **Knowledge Augmentation:** To ensure the AI doesn't hallucinate and has the most accurate information, the script queries external sources:
    *   **Wikipedia API:** It searches specifically for `"Media Title + Year"` (e.g., "The Matrix 1999") to pull the exact summary and background info, ensuring Wikipedia isn't overwhelmed with full conversational queries.
    *   **DuckDuckGo:** Gathers extra contextual data, reviews, or recent news.
3.  **Prompt Construction:** The extracted Jellyfin metadata and web search results are combined into a rich, hidden system prompt.
4.  **Inference:** Your question, along with the system prompt, is sent to your local LLM, which streams back a contextually aware, intelligent response right in your browser.
