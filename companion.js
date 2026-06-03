(function () {
    console.log("AI Story Companion: AI Story Companion script loaded.");

    // =========================================================================
    // 1. ADVANCED INTERFACE STYLESHEET INJECTION
    // =========================================================================
    if (!document.querySelector('#aiCompanionStyle')) {
        const style = document.createElement('style');
        style.id = 'aiCompanionStyle';
        style.innerHTML = `
            .ai-chat-box { position: fixed; right: 30px; top: 12%; width: 420px; height: 78%; min-width: 300px; min-height: 300px; background: rgba(12, 12, 12, 0.98); border-radius: 14px; border: 1px solid #444; z-index: 99999999 !important; display: flex; flex-direction: column; padding: 15px; font-family: sans-serif; box-shadow: 0 12px 40px rgba(0,0,0,0.85); backdrop-filter: blur(12px); color: #fff; resize: both; overflow: hidden; }
            .ai-chat-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 8px; font-size: 16px; font-weight: bold; cursor: grab; user-select: none; }
            .ai-chat-header:active { cursor: grabbing; }
            .ai-chat-header-actions { display: flex; gap: 12px; align-items: center; }
            .ai-settings-deck { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; border: 1px solid #222; font-size: 13px; }
            .ai-settings-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
            .ai-settings-deck select, .ai-settings-deck input { background: #222; border: 1px solid #555; color: #fff; padding: 6px; border-radius: 4px; font-size: 13px; }
            .ai-chat-log { flex-grow: 1; overflow-y: auto; font-size: 14.5px; color: #f0f0f0; margin: 12px 0; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth; }
            .ai-msg { line-height: 1.5; padding: 9px 13px; border-radius: 6px; background: rgba(255,255,255,0.04); white-space: pre-wrap; }
            .ai-user-text { background: rgba(82, 163, 255, 0.15) !important; border: 1px solid rgba(82, 163, 255, 0.2); }
            .ai-user-text b { color: #52a3ff; font-weight: bold; }
            .ai-bot-text { background: rgba(60, 208, 112, 0.15) !important; border: 1px solid rgba(60, 208, 112, 0.2); }
            .ai-bot-text b { color: #3cd070; font-weight: bold; }
            .ai-system-status { font-style: italic; color: #aaa; text-align: center; font-size: 12px; margin: 4px 0; }
            .ai-chat-input-row { display: flex; gap: 8px; }
            .ai-chat-input-row input { flex-grow: 1; background: #222; border: 1px solid #555; color: #fff; padding: 10px; border-radius: 6px; font-size: 14px; }
            .ai-chat-input-row button { background: #00a4dc; border: none; color: #fff; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
            .hidden-chat { display: none !important; }
            .btnAiCompanionPlayer { background: transparent; border: none; color: inherit; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 24px !important; padding: 0 10px; vertical-align: middle; height: 100%; }
            @keyframes aiBlink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
            .ai-typing-indicator span { animation: aiBlink 1.4s infinite both; font-size: 18px; line-height: 10px; display: inline-block; }
            .ai-typing-indicator span:nth-child(2) { animation-delay: .2s; }
            .ai-typing-indicator span:nth-child(3) { animation-delay: .4s; }
        `;
        document.head.appendChild(style);
    }

    let automatedWelcomeSentForItem = null;
    let chatHistory = JSON.parse(localStorage.getItem('aiCompanionChatHistory') || '[]');

    // =========================================================================
    // Prompt construction helpers
    // =========================================================================

    function escapeForPrompt(val) {
        if (val === null || val === undefined) return "";
        return String(val).replace(/\r/g, " ").replace(/\n/g, " ");
    }

    // =========================================================================
    // 2. ADAPTIVE GRAPHICAL CONFIGURATION PANEL
    // =========================================================================
    function createChatOverlayWindow() {
        if (document.querySelector('#aiChatOverlayWindow')) return;

        const savedEngine = localStorage.getItem('aiCompanionEngine') || 'local';
        const savedKey = localStorage.getItem('aiCompanionKey') || '';
        const savedUrl = localStorage.getItem('aiCompanionUrl') || 'http://localhost:11434';
        const savedModel = localStorage.getItem('aiCompanionModel') || '';

        const chatBox = document.createElement('div');
        chatBox.id = 'aiChatOverlayWindow';
        chatBox.className = 'ai-chat-box hidden-chat';
        chatBox.innerHTML = `
            <div class="ai-chat-header">
                <span>🧠 AI Story Companion</span>
                <div class="ai-chat-header-actions">
                    <b id="clearAiChat" style="cursor:pointer; font-size: 12px; color: #888; border: 1px solid #444; padding: 2px 6px; border-radius: 4px;">🗑️ Clear</b>
                    <b id="closeAiChat" style="cursor:pointer; font-size: 16px; color: #aaa;">✕</b>
                </div>
            </div>
            
            <div class="ai-settings-deck">
                <div class="ai-settings-row">
                    <label>Local Server Link:</label>
                    <input type="text" id="aiLocalUrlInput" placeholder="http://localhost:11434" value="${savedUrl}" style="width: 60%;"/>
                </div>

                <div class="ai-settings-row">
                    <label>Model Target Identifier:</label>
                    <select id="aiModelSelect" style="width: 60%;">
                        ${savedModel ? `<option value="${savedModel}" selected>${savedModel}</option>` : `<option value="" disabled selected>Select a model...</option>`}
                    </select>
                </div>
            </div>

            <div class="ai-chat-log" id="aiLogBox"></div>
            
            <div class="ai-chat-input-row">
                <input type="text" id="aiInputTxt" placeholder="Spitballing a theory..." />
                <button id="sendAiQuery">Ask</button>
            </div>
        `;
        document.body.appendChild(chatBox);

        chatBox.querySelector('#closeAiChat').addEventListener('click', () => chatBox.classList.add('hidden-chat'));
        
        chatBox.querySelector('#clearAiChat').addEventListener('click', () => {
            if (confirm("Clear chat history and start fresh?")) {
                chatHistory = [];
                localStorage.removeItem('aiCompanionChatHistory');
                window.aiCompanionLastContext = null;
                const logBox = chatBox.querySelector('#aiLogBox');
                if (logBox) logBox.innerHTML = '';
            }
        });

        // Window Draggable Logic
        const header = chatBox.querySelector('.ai-chat-header');
        let isDragging = false, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.id === 'closeAiChat') return;
            const rect = chatBox.getBoundingClientRect();
            // Switch to left/top positioning for predictable dragging
            if (!chatBox.style.left || chatBox.style.right !== 'auto') {
                chatBox.style.left = rect.left + 'px';
                chatBox.style.top = rect.top + 'px';
                chatBox.style.right = 'auto';
                chatBox.style.bottom = 'auto';
            }
            initialX = e.clientX - rect.left;
            initialY = e.clientY - rect.top;
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            let newX = e.clientX - initialX;
            let newY = e.clientY - initialY;
            
            // Basic bounds checking
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + chatBox.offsetWidth > window.innerWidth) newX = window.innerWidth - chatBox.offsetWidth;
            if (newY + chatBox.offsetHeight > window.innerHeight) newY = window.innerHeight - chatBox.offsetHeight;

            chatBox.style.left = newX + 'px';
            chatBox.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        const stopLeaks = (e) => e.stopPropagation();
        const inputFieldElement = chatBox.querySelector('#aiInputTxt');
        inputFieldElement.addEventListener('keydown', (e) => {
            stopLeaks(e);
            if (e.key === 'Enter') {
                e.preventDefault();
                chatBox.querySelector('#sendAiQuery').click();
            }
        });
        chatBox.querySelector('#aiLocalUrlInput').addEventListener('keydown', stopLeaks);
        chatBox.querySelector('#aiModelSelect').addEventListener('keydown', stopLeaks);

        const urlInput = chatBox.querySelector('#aiLocalUrlInput');
        const modelSelect = chatBox.querySelector('#aiModelSelect');

        function savePreferences() {
            localStorage.setItem('aiCompanionEngine', 'local');
            localStorage.removeItem('aiCompanionKey');
            localStorage.setItem('aiCompanionUrl', urlInput.value.trim());
            localStorage.setItem('aiCompanionModel', modelSelect.value.trim());
        }

        urlInput.addEventListener('input', () => {
            savePreferences();
            fetchModels(); // Refresh models if URL changes
        });
        
        modelSelect.addEventListener('change', savePreferences);

        // Fetch models from Ollama API or OpenAI compatible endpoints (LM Studio)
        async function fetchModels() {
            let baseUrl = urlInput.value.trim().replace(/\/+$/, "");
            
            // Helper to populate the dropdown
            const populateDropdown = (modelNames) => {
                if (!modelNames || !modelNames.length) return;
                const currentVal = modelSelect.value;
                modelSelect.innerHTML = '';
                let foundCurrent = false;
                
                modelNames.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    if (name === currentVal) {
                        opt.selected = true;
                        foundCurrent = true;
                    }
                    modelSelect.appendChild(opt);
                });

                if (!foundCurrent && currentVal) {
                    const opt = document.createElement('option');
                    opt.value = currentVal;
                    opt.textContent = currentVal + ' (Offline)';
                    opt.selected = true;
                    modelSelect.appendChild(opt);
                } else if (!currentVal && modelNames.length > 0) {
                    modelSelect.value = modelNames[0];
                    savePreferences();
                }
            };

            try {
                // Try OpenAI compatible first if /v1 is explicitly in the URL
                if (baseUrl.includes('/v1')) {
                    const res = await fetch(`${baseUrl}/models`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.data && Array.isArray(data.data)) {
                            return populateDropdown(data.data.map(m => m.id));
                        }
                    }
                }

                // Default assumption: Try Ollama
                let res = await fetch(`${baseUrl}/api/tags`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    if (data.models && Array.isArray(data.models)) {
                        return populateDropdown(data.models.map(m => m.name));
                    }
                }

                // Fallback: Try generic OpenAI/LM Studio endpoint if Ollama failed
                res = await fetch(`${baseUrl}/v1/models`).catch(() => null);
                if (res && res.ok) {
                    const data = await res.json();
                    if (data.data && Array.isArray(data.data)) {
                        return populateDropdown(data.data.map(m => m.id));
                    }
                }

            } catch (e) {
                console.warn('Could not fetch models, falling back to basic input.', e);
            }
        }

        // Try to load models when opening the UI
        fetchModels();

        chatBox.querySelector('#sendAiQuery').addEventListener('click', async () => {
            // If context sync hasn't completed yet, attempt a best-effort sync before sending.
            if (!window.aiCompanionLastContext) {
                try {
                    await triggerAutomatedMetadataWelcome();
                } catch (e) {}
            }

            const inputField = document.querySelector('#aiInputTxt');
            const query = inputField.value.trim();
            if (!query) return;

            // Combine Jellyfin metadata and user query for better grounding
            let metadataContext = "";
            if (window.aiCompanionLastContext) {
                const metadataMatch = window.aiCompanionLastContext.match(/\[MEDIA_CONTEXT\][\s\S]*?\[\/MEDIA_CONTEXT\]/);
                if (metadataMatch) {
                    metadataContext = `${metadataMatch[0]}\n`;
                }
            }
            const finalPrompt = `${metadataContext}[USER_QUERY]\n${escapeForPrompt(query)}\n[/USER_QUERY]`;

            executeLiveQuery(finalPrompt, false, query);
            inputField.value = '';
        });
    }

    // =========================================================================
    // 3. SECURE CONTINUOUS EXTRACTION TICK LOOP
    // =========================================================================
    setInterval(() => {
        const targetTray = document.querySelectorAll('button');
        let favoriteAnchor = null;

        for (let btn of targetTray) {
            const label = (btn.getAttribute('title') || btn.getAttribute('aria-label') || '').toLowerCase();
            const innerHtml = (btn.innerHTML || '').toLowerCase();

            if (label.includes('favorite') || innerHtml.includes('favorite') || (btn.className || '').includes('je-bookmark')) {
                if (btn.offsetWidth > 0 || btn.offsetHeight > 0) {
                    favoriteAnchor = btn;
                    break;
                }
            }
        }

        if (favoriteAnchor && favoriteAnchor.parentNode && !document.querySelector('#btnAiChatToggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'btnAiChatToggle';
            toggleBtn.className = 'btnAiCompanionPlayer';
            toggleBtn.type = 'button';
            toggleBtn.innerHTML = '🧠';

            favoriteAnchor.parentNode.insertBefore(toggleBtn, favoriteAnchor);

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                createChatOverlayWindow();
                const win = document.querySelector('#aiChatOverlayWindow');
                if (!win) return;
                win.classList.toggle('hidden-chat');

                if (!win.classList.contains('hidden-chat')) {
                    triggerAutomatedMetadataWelcome();
                }
            });
        }
    }, 1200);

    // =========================================================================
    // 4. METADATA SUMMARY PARSER AUTOMATOR
    // =========================================================================
    async function triggerAutomatedMetadataWelcome() {
        const logBox = document.querySelector('#aiLogBox');
        if (!logBox) return;

        let itemId = "";
        try {
            // First try URL regex match
            const match = window.location.href.match(/[?&](id|itemId)=([^&#]+)/i);
            if (match) {
                itemId = match[2];
            } else {
                // Try URLSearchParams as fallback
                const urlParams = new URLSearchParams(window.location.search);
                itemId = urlParams.get('id') || urlParams.get('itemId');
            }
        } catch (e) {}

        if (!itemId) {
            // Fallback: Check DOM for item ID
            const itemElement = document.querySelector('[data-itemid], [data-id]');
            if (itemElement) {
                itemId = itemElement.getAttribute('data-itemid') || itemElement.getAttribute('data-id');
            }
        }

        if (!itemId) {
            if (logBox.children.length === 0) {
                logBox.innerHTML = `<div class="ai-msg ai-bot-text"><b>AI:</b> Panel synced. Structural index context hidden. Fire a comment below to start speculating!</div>`;
            }
            return;
        }

        if (automatedWelcomeSentForItem === itemId) return;
        automatedWelcomeSentForItem = itemId;

        logBox.innerHTML = `<div class="ai-system-status" id="aiStatusTxt">Syncing context with Jellyfin server database files...</div>`;

        try {
            const apiClient = window.ApiClient;
            const currentUserId = apiClient.getCurrentUserId();
            const item = await apiClient.getItem(currentUserId, itemId);
            let structuredPromptPayload = "";

            // DEBUG: dump raw Jellyfin item so we can map the correct fields into [MEDIA_CONTEXT]
            try {
                console.log('[AI Companion DEBUG] raw item fields:', {
                    Type: item?.Type,
                    Id: item?.Id,
                    Name: item?.Name,
                    OriginalTitle: item?.OriginalTitle,
                    ProductionYear: item?.ProductionYear,
                    ProductionDate: item?.ProductionDate,
                    Overview: item?.Overview,
                    LongOverview: item?.LongOverview,
                    ExtendedOverview: item?.ExtendedOverview,
                    Summary: item?.Summary,
                    Plot: item?.Plot,
                    Tagline: item?.Tagline
                });
                console.log('[AI Companion DEBUG] raw item json preview:', JSON.stringify(item).slice(0, 4000));
            } catch (e) {}


            let castString = "";
            let directorString = "";
            if (Array.isArray(item.People)) {
                const actors = item.People.filter(p => p.Type === "Actor").slice(0, 5).map(p => p.Name).join(", ");
                const director = item.People.find(p => p.Type === "Director");
                if (actors) castString = `\n[TOP_CAST: "${escapeForPrompt(actors)}"]`;
                if (director) directorString = `\n[DIRECTOR: "${escapeForPrompt(director.Name)}"]`;
            }

            if (item.Type === "Episode") {
                let seriesInfo = { Overview: "Summary unavailable." };
                try { seriesInfo = await apiClient.getItem(currentUserId, item.SeriesId); } catch (e) {}

                const seasonNumber = item.ParentIndexNumber ?? 1;
                const episodeNumber = item.IndexNumber ?? 1;

                structuredPromptPayload = `[MEDIA_CONTEXT]
[CONTENT_TYPE: TV_EPISODE]
[SHOW_NAME: "${escapeForPrompt(item.SeriesName)}"]
[SEASON_NUMBER: ${seasonNumber}]
[EPISODE_NUMBER: ${episodeNumber}]
[EPISODE_TITLE: "${escapeForPrompt(item.Name)}"]
[SERIES_PLOT_OVERVIEW: "${escapeForPrompt(seriesInfo.Overview || 'Metadata summary missing.')}"]
[EPISODE_PLOT_SUMMARY: "${escapeForPrompt(item.Overview || 'Episode summary missing.')}"]${directorString}${castString}
[/MEDIA_CONTEXT]

[INSTRUCTION: Act as an expert media scholar. Write an opening welcome message acknowledging this specific show context. Summarize the narrative complications or thematic elements up to this exact episode point. Ask a thought-provoking, non-spoiler question regarding character motives or narrative designs to get the conversation started. REMEMBER: Under no circumstances reveal twists or plot events occurring after this specific episode. Maintain consistency, remember past chats, provide fresh responses, and if asked, recommend similar shows to watch next.]
`;
            } else if (item.Type === "Movie" || item.Type === "Series") {
                const isMovie = item.Type === "Movie";
                const title = item.Name || item.OriginalTitle || "Unknown";
                const plot = item.Overview || item.LongOverview || item.ExtendedOverview || item.Summary || item.Plot || item.Tagline || "Metadata summary missing.";

                structuredPromptPayload = `[MEDIA_CONTEXT]
[CONTENT_TYPE: ${isMovie ? 'MOVIE' : 'TV_SHOW'}]
[TITLE: "${escapeForPrompt(title)}"]
[PLOT_METADATA: "${escapeForPrompt(plot)}"]
[RELEASE_YEAR: ${item.ProductionYear || item.Year || 'Unknown'}]${directorString}${castString}
[/MEDIA_CONTEXT]

[INSTRUCTION: Act as an expert narrative analyst. Write an opening welcome message acknowledging this ${isMovie ? 'movie' : 'TV show'} context. Highlight a core thematic complexity or symbol evident in the plot metadata. Ask a thought-provoking, non-spoiler question to spark an interactive brainstorming discussion with the viewer. Maintain consistency, remember past chats, provide fresh responses, and if asked, recommend similar ${isMovie ? 'movies' : 'shows'} to watch next.]
`;
            } else {
                const title = item.Name || "Unknown";
                const itemType = item.Type ? item.Type.replace(/([A-Z])/g, ' $1').trim() : "Media";
                const plot = item.Overview || item.Summary || "No description available.";

                structuredPromptPayload = `[MEDIA_CONTEXT]
[CONTENT_TYPE: ${item.Type ? item.Type.toUpperCase() : 'UNKNOWN'}]
[NAME: "${escapeForPrompt(title)}"]
[DESCRIPTION: "${escapeForPrompt(plot)}"]${directorString}${castString}
[/MEDIA_CONTEXT]

[INSTRUCTION: Act as a helpful media librarian and AI companion. Write a brief opening welcome message acknowledging that the user is currently looking at the "${title}" ${itemType.toLowerCase()}. Ask what they are in the mood for or if they would like recommendations. Maintain consistency, remember past chats, and provide fresh responses.]
`;
            }

            // Store the current playing context so user messages include it every time.
            let mediaContextTitle = item.Name || item.OriginalTitle || "Unknown";
            if (item.Type === "Episode" && item.SeriesName) {
                mediaContextTitle = `${item.SeriesName} ${item.Name}`;
            }
            const mediaYear = item.ProductionYear || item.Year;
            if (mediaYear) {
                mediaContextTitle = `${mediaContextTitle} ${mediaYear}`;
            }
            window.aiCompanionMediaTitle = mediaContextTitle;
            window.aiCompanionLastContext = structuredPromptPayload;
            executeLiveQuery(structuredPromptPayload, true);

        } catch (err) {
            console.error(err);
            const statusLabel = document.querySelector('#aiStatusTxt');
            if (statusLabel) statusLabel.remove();
            logBox.innerHTML += `<div class="ai-msg ai-bot-text"><b>AI:</b> Sync successful, but local profile plot charts remain encrypted. Drop your thoughts manually!</div>`;
        }
    }

    // =========================================================================
    // 5. LIVE ROUTING INFERENCE EXECUTION PIPELINE
    // =========================================================================

    // --- Public enrichment helpers (no cloud model calls) ---
    async function duckduckgoSearch(query) {
        const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1&no_redirect=1`;
        const res = await fetch(url);
        const data = await res.json();
        const related = data?.RelatedTopics || [];
        const items = [];

        const pushTopic = (t) => {
            const text = t?.Text;
            const href = t?.FirstURL || t?.FirstUrl;
            if (typeof text === 'string' && text.trim()) {
                items.push({ text: text.trim(), url: href || '' });
            }
        };

        for (const t of related) {
            if (t?.Text) {
                pushTopic(t);
            } else if (Array.isArray(t?.Topics)) {
                for (const tt of t.Topics) pushTopic(tt);
            }
            if (items.length >= 5) break;
        }

        return items.slice(0, 5);
    }

    async function wikipediaSummary(query) {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const extract = data?.extract;
        if (typeof extract !== 'string' || !extract.trim()) return null;
        return {
            title: data?.title || query,
            url: data?.content_urls?.desktop || '',
            extract: extract.trim()
        };
    }

    async function enrichWithLocalPublicInfo(payloadText) {
        let textToSearch = payloadText || '';
        
        // Extract only the user's input to avoid searching system prompts
        const match = textToSearch.match(/\[USER_QUERY\]([\s\S]*?)\[\/USER_QUERY\]/);
        if (match) {
            textToSearch = match[1];
        } else if (textToSearch.includes('[MEDIA_CONTEXT]')) {
            // It's a system request without user query; don't enrich the whole context
            return null;
        }

        const text = textToSearch.replace(/\[.*?\]/g, '').trim();
        if (!text) return null;
        
        const mediaTitle = window.aiCompanionMediaTitle ? window.aiCompanionMediaTitle.trim() : "";
        const topic = mediaTitle ? `${mediaTitle} ${text}`.split(/\s+/).slice(0, 8).join(' ') : text.split(/\s+/).slice(0, 8).join(' ');
        
        // ONLY query Wikipedia if we have a strict media title. Conversational text will cause 404s.
        const wikiTopic = mediaTitle;

        try {
            const [wiki, ddg] = await Promise.all([
                wikiTopic ? wikipediaSummary(wikiTopic) : Promise.resolve(null),
                duckduckgoSearch(topic)
            ]);

            const snippets = [];
            if (wiki?.extract) snippets.push(`Wikipedia (${wiki.title}): ${wiki.extract}`);
            if (Array.isArray(ddg) && ddg.length) {
                snippets.push(`DuckDuckGo related snippets:`);
                for (const item of ddg.slice(0, 3)) {
                    snippets.push(`- ${item.text}${item.url ? ` (${item.url})` : ''}`);
                }
            }

            if (!snippets.length) return null;
            return snippets.join('\n').slice(0, 1200);
        } catch (e) {
            console.warn('Enrichment failed', e);
            return null;
        }
    }

    async function executeLiveQuery(targetPayload, isSystemAutomationRequest, displayQuery) {

        const logBox = document.querySelector('#aiLogBox');
        if (!logBox) return;

        const statusLabel = document.querySelector('#aiStatusTxt');
        if (statusLabel) statusLabel.remove();

        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = "ai-system-status ai-typing-indicator";
        loadingIndicator.id = "aiLoadingBubble";
        loadingIndicator.innerHTML = isSystemAutomationRequest ? "AI is reviewing file plot charts<span>.</span><span>.</span><span>.</span>" : "AI is analyzing your plot theory<span>.</span><span>.</span><span>.</span>";
        logBox.appendChild(loadingIndicator);
        logBox.scrollTop = logBox.scrollHeight;

        const customUrl = localStorage.getItem('aiCompanionUrl') || 'http://localhost:11434';
        const modelName = localStorage.getItem('aiCompanionModel') || 'deepseek/deepseek-r1-0528-qwen3-8b';

        let baseCleanUrl = customUrl.replace(/\/+$/, "");
        const targetUrl = baseCleanUrl.includes('/v1') ? baseCleanUrl + '/chat/completions' : baseCleanUrl + '/v1/chat/completions';

        const headers = { 'Content-Type': 'application/json' };

        try {
            let enrichment = null;
            try {
                enrichment = await enrichWithLocalPublicInfo(targetPayload);
            } catch (e) {
                enrichment = null;
            }

            const finalPayload = enrichment
                ? `${targetPayload}\n\n[Local enrichment snippets for context (non-spoiler)]:\n${enrichment}`
                : targetPayload;

            // Always use the 'user' role. Interleaving multiple 'system' messages 
            // breaks standard chat templates (like Llama 3) and causes generation hangs.
            chatHistory.push({ role: 'user', content: finalPayload });

            if (chatHistory.length > 20) chatHistory = chatHistory.slice(chatHistory.length - 20);
            localStorage.setItem('aiCompanionChatHistory', JSON.stringify(chatHistory));

            // DEBUG: Log the final transmission size rather than spamming the console with duplicate raw text.
            try {
                console.log('[AI Companion DEBUG] Sending prompt to local model. Payload length:', finalPayload?.length);
            } catch (e) {}

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    ...headers,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: chatHistory,
                    temperature: 0.75
                })
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`Local model request failed: HTTP ${response.status}. ${errText}`);
            }

            const data = await response.json();

            const reply =
                data?.choices?.[0]?.message?.content ||
                data?.choices?.[0]?.text ||
                data?.output_text ||
                data?.response ||
                data?.message ||
                data?.generated_text ||
                data?.result ||
                "Unexpected data formatting return structural setup error.";

            chatHistory.push({ role: 'assistant', content: reply });
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(chatHistory.length - 20);
            localStorage.setItem('aiCompanionChatHistory', JSON.stringify(chatHistory));

            loadingIndicator.remove();
            
            if (!isSystemAutomationRequest) {
                let msgToDisplay = displayQuery || targetPayload;
                if (!displayQuery) {
                    const match = targetPayload.match(/\[USER_QUERY\]([\s\S]*?)\[\/USER_QUERY\]/);
                    if (match) msgToDisplay = match[1].trim();
                }
                
                // Simple escape for UI to prevent layout breaking
                const safeDisplay = escapeForPrompt(msgToDisplay);
                logBox.innerHTML += `<div class="ai-msg ai-user-text"><b>You:</b> ${safeDisplay}</div>`;
            }
            
            logBox.innerHTML += `<div class="ai-msg ai-bot-text"><b>AI:</b> ${reply}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        } catch (error) {
            console.error(error);
            loadingIndicator.remove();
            logBox.innerHTML += `<div class="ai-msg" style="color:#ff6b6b;"><b>Connection Failure:</b> Local server at link "${customUrl}" unreachable. Verify endpoint server status or clear local CORS blocks.</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        }
    }
})();


