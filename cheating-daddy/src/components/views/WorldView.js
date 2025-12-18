import { html, css, LitElement, unsafeHTML } from '../../assets/lit-all-2.7.4.min.js';
import { glassStyles } from '../../utils/glassMixin.js';

/**
 * WorldView - Compact modern widget for Perplexity Search
 * Matches main app styling and transparency
 */
export class WorldView extends LitElement {
    static styles = [glassStyles, css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: transparent;
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .world-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            background: var(--app-background, rgba(0, 0, 0, 0.5));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 8px;
            margin-bottom: 8px;
            -webkit-app-region: drag;
            cursor: move;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            opacity: 0.9;
        }

        .header-title svg {
            width: 14px;
            height: 14px;
            opacity: 0.7;
        }

        .close-button {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--icon-button-color);
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
            -webkit-app-region: no-drag;
        }

        .close-button:hover {
            background: rgba(220, 80, 80, 0.6);
            border-color: rgba(255, 120, 120, 0.6);
            opacity: 1;
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(220, 80, 80, 0.4), 
                        0 0 15px rgba(220, 80, 80, 0.3);
        }

        .close-button svg {
            width: 14px;
            height: 14px;
        }

        .search-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 12px;
            min-height: 0;
            overflow: hidden;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .search-container {
            display: flex;
            gap: 6px;
            margin-bottom: 8px;
        }

        .search-input {
            flex: 1;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            padding: 10px 16px;
            color: var(--text-color);
            font-size: 12px;
            font-family: 'Inter', sans-serif;
            outline: none;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
        }

        .search-input:focus {
            border-color: rgba(135, 206, 250, 0.4);
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.02);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 
                        0 0 20px rgba(135, 206, 250, 0.3);
        }

        .search-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .search-button {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            padding: 10px;
            color: var(--text-color);
            cursor: pointer;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .search-button:hover {
            background: rgba(135, 206, 250, 0.3);
            border-color: rgba(135, 206, 250, 0.4);
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 
                        0 0 20px rgba(135, 206, 250, 0.4);
        }

        .search-button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .search-button svg {
            width: 14px;
            height: 14px;
        }

        .response-section {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            min-height: 0;
            padding: 8px 12px 16px 12px;
            margin-top: 4px;
        }

        .response-content {
            font-size: 12px;
            line-height: 1.55;
            color: rgba(255, 255, 255, 0.85);
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            opacity: 0.4;
        }

        .empty-state svg {
            width: 32px;
            height: 32px;
            margin-bottom: 8px;
            opacity: 0.5;
        }

        .empty-state span {
            font-size: 11px;
        }

        .response-section::-webkit-scrollbar {
            width: 4px;
        }

        .response-section::-webkit-scrollbar-track {
            background: transparent;
        }

        .response-section::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 2px;
        }

        .response-section::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }

        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 100%;
            color: rgba(255, 255, 255, 0.5);
            font-size: 11px;
        }

        .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top-color: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Compact markdown styling */
        .response-content h1,
        .response-content h2,
        .response-content h3 {
            margin: 0.6em 0 0.3em 0;
            font-weight: 600;
        }

        .response-content h1 { font-size: 1.1em; }
        .response-content h2 { font-size: 1.05em; }
        .response-content h3 { font-size: 1em; }

        .response-content p {
            margin: 0.4em 0;
        }

        .response-content ul, .response-content ol {
            margin: 0.4em 0;
            padding-left: 1em;
        }

        .response-content li {
            margin: 0.15em 0;
        }

        .response-content code {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.1em 0.25em;
            border-radius: 3px;
            font-size: 0.9em;
        }

        .response-content pre {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px) saturate(130%);
            -webkit-backdrop-filter: blur(10px) saturate(130%);
            border: 1px solid var(--glass-border);
            padding: 0.5em;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 11px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .response-content pre code {
            background: none;
            padding: 0;
        }

        .response-content a {
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
        }

        .response-content a:hover {
            text-decoration: underline;
            color: white;
        }

        /* Citation styling with hover tooltip */
        .citation-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
            padding: 0 4px;
            margin: 0 1px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .citation-link:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .citation-tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: rgba(25, 25, 30, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            white-space: nowrap;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.15s ease 0.1s, visibility 0.15s ease 0.1s;
            z-index: 1000;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        /* Invisible bridge to prevent flickering when moving to tooltip */
        .citation-tooltip::before {
            content: '';
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            height: 12px; /* Bridge the gap between tooltip and link */
        }

        .citation-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: rgba(255, 255, 255, 0.2);
        }

        .citation-link:hover .citation-tooltip {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transition-delay: 0s; /* Show immediately on hover */
        }

        .citation-tooltip-url {
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Monaco', 'Menlo', monospace;
        }

        .citation-tooltip-label {
            color: rgba(255, 255, 255, 0.6);
            margin-right: 4px;
        }

        /* Citation number without URL */
        .citation-number {
            display: inline;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.85em;
        }

        .response-content strong {
            font-weight: 600;
        }

        /* Animated word-by-word reveal */
        .response-content [data-word] {
            display: inline-block;
            opacity: 1;
        }
        .response-content.animating [data-word] {
            opacity: 0;
            filter: blur(8px);
        }
        .response-content.animating [data-word].visible {
            opacity: 1;
            filter: blur(0px);
            transition: opacity 0.4s, filter 0.4s;
        }
    `];

    static properties = {
        isSearching: { type: Boolean },
        searchResponse: { type: String },
        searchCitations: { type: Array },
        onClose: { type: Function },
        onPerplexitySearch: { type: Function },
    };

    constructor() {
        super();
        this.isSearching = false;
        this.searchResponse = '';
        this.searchCitations = [];
        this.onClose = () => {};
        this.onPerplexitySearch = () => {};
        this._lastAnimatedWordCount = 0;
        this._setupStreamListener();
    }

    _setupStreamListener() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('perplexity-chunk', (event, data) => {
                console.log('Received perplexity-chunk:', data);
                // Handle both old string format and new object format with citations
                if (typeof data === 'string') {
                    this.searchResponse = data;
                    this.searchCitations = [];
                } else {
                    this.searchResponse = data.content || '';
                    this.searchCitations = data.citations || [];
                    console.log('Parsed citations:', this.searchCitations);
                }
                this.isSearching = false; // Stop loading spinner when first chunk arrives
                this.requestUpdate();
                // Resize window after content updates
                requestAnimationFrame(() => this._resizeWindowToFit());
            });
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        // Debug: Inspect rendered DOM after update
        if (changedProperties.has('searchResponse') && this.searchResponse) {
            setTimeout(() => {
                const responseContent = this.shadowRoot.querySelector('.response-content');
                if (responseContent) {
                    const citations = responseContent.querySelectorAll('.citation-link');
                    const citationNumbers = responseContent.querySelectorAll('.citation-number');
                    console.log('🔍 DOM Inspection:');
                    console.log('  - .citation-link elements found:', citations.length);
                    console.log('  - .citation-number elements found:', citationNumbers.length);
                    if (citations.length > 0) {
                        console.log('  - First citation HTML:', citations[0].outerHTML);
                    }
                    // Check for [n] patterns in text
                    const textContent = responseContent.textContent;
                    const bracketMatches = textContent.match(/\[\d+\]/g);
                    console.log('  - [n] patterns in text:', bracketMatches);
                }
            }, 100);
        }
    }

    _resizeWindowToFit() {
        // Request window resize based on content height
        if (window.require) {
            const container = this.shadowRoot.querySelector('.world-container');
            if (container) {
                const contentHeight = container.scrollHeight + 20; // Add padding
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('resize-world-window', contentHeight);
            }
        }
    }

    async handleSearch() {
        const input = this.shadowRoot.querySelector('#searchInput');
        const query = input?.value?.trim();
        
        if (!query) return;
        
        this.isSearching = true;
        this.searchResponse = ''; // Clear previous response
        this.searchCitations = []; // Clear previous citations
        this._lastAnimatedWordCount = 0;
        this.requestUpdate();
        
        try {
            // Response will be streamed via IPC chunks
            // Don't wait for the full response, just trigger the search
            this.onPerplexitySearch(query).catch(error => {
                if (!this.searchResponse) {
                    this.searchResponse = `Error: ${error.message}`;
                    this.isSearching = false;
                    this.requestUpdate();
                }
            });
        } catch (error) {
            this.searchResponse = `Error: ${error.message}`;
            this.isSearching = false;
            this.requestUpdate();
        }
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSearch();
        }
    }

    handleClose() {
        this.onClose();
    }

    wrapWordsInSpans(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tagsToSkip = ['PRE', 'CODE'];
        const classesToSkip = ['citation-link', 'citation-tooltip', 'citation-tooltip-label', 'citation-tooltip-url', 'citation-number'];

        function shouldSkip(node) {
            if (tagsToSkip.includes(node.tagName)) return true;
            if (node.classList && classesToSkip.some(c => node.classList.contains(c))) return true;
            return false;
        }

        function wrap(node) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() && !shouldSkip(node.parentNode)) {
                const words = node.textContent.split(/(\s+)/);
                const frag = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim()) {
                        const span = document.createElement('span');
                        span.setAttribute('data-word', '');
                        span.textContent = word;
                        frag.appendChild(span);
                    } else if (word) {
                        frag.appendChild(document.createTextNode(word));
                    }
                });
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === Node.ELEMENT_NODE && !shouldSkip(node)) {
                Array.from(node.childNodes).forEach(wrap);
            }
        }

        Array.from(doc.body.childNodes).forEach(wrap);
        return doc.body.innerHTML;
    }

    animateWords() {
        const container = this.shadowRoot.querySelector('.response-content');
        if (!container) return;
        
        container.classList.add('animating');
        const words = container.querySelectorAll('[data-word]');
        words.forEach((word, i) => {
            setTimeout(() => {
                word.classList.add('visible');
                // Remove animating class after all words are visible
                if (i === words.length - 1) {
                    setTimeout(() => {
                        container.classList.remove('animating');
                    }, 500);
                }
            }, i * 50); // 50ms delay between words
        });
    }

    renderMarkdown(text, citations = []) {
        if (!text) return '';
        
        console.log('renderMarkdown called with citations:', citations);
        
        // Normalize citations - handle both string arrays and object arrays
        const citationUrls = citations.map(c => {
            if (typeof c === 'string') return c;
            if (typeof c === 'object' && c.url) return c.url;
            return '';
        });
        console.log('Normalized citation URLs:', citationUrls);
        
        // Basic markdown rendering FIRST
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^\- (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Convert citation references [n] to clickable links with tooltips AFTER markdown
        html = html.replace(/\[(\d+)\]/g, (match, num) => {
            const index = parseInt(num, 10) - 1;
            const url = citationUrls[index] || '';
            if (!url) {
                return `<span class="citation-number">[${num}]</span>`;
            }
            const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
            return `<a class="citation-link" href="${url}" target="_blank" rel="noopener">[${num}]<span class="citation-tooltip"><span class="citation-tooltip-label">Source:</span><span class="citation-tooltip-url">${displayUrl}</span></span></a>`;
        });
        
        const wrapped = `<p>${html}</p>`;
        return wrapped;  // Skip wrapWordsInSpans for now to test
    }

    // Handle citation clicks to open in external browser
    handleCitationClick(e) {
        console.log('Click detected on:', e.target);
        
        // Check if clicked on a citation link (anchor tag)
        const citationLink = e.target.closest('.citation-link');
        if (citationLink) {
            const url = citationLink.getAttribute('href');
            console.log('Citation URL:', url);
            if (url && url !== '#' && window.require) {
                e.preventDefault();
                e.stopPropagation();
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.invoke('open-external', url);
            }
        }
    }

    render() {
        return html`
            <div class="world-container">
                <div class="header">
                    <div class="header-title">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>
                            <path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                            <path d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                            <path d="M3 12H21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        </svg>
                        World
                    </div>
                    <button class="close-button" @click=${this.handleClose} title="Close">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="search-section">
                    <div class="search-container">
                        <input
                            type="text"
                            id="searchInput"
                            class="search-input"
                            placeholder="Search the web..."
                            @keydown=${this.handleKeydown}
                        />
                        <button 
                            class="search-button" 
                            @click=${this.handleSearch}
                            ?disabled=${this.isSearching}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
                                <path d="M20 20L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>

                    <div class="response-section" @click=${this.handleCitationClick}>
                        ${this.isSearching ? html`
                            <div class="loading">
                                <div class="spinner"></div>
                                <span>Searching...</span>
                            </div>
                        ` : this.searchResponse ? html`
                            <div class="response-content">${unsafeHTML(this.renderMarkdown(this.searchResponse, this.searchCitations))}</div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('world-view', WorldView);
