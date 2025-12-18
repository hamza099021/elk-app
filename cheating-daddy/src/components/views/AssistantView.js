import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { glassStyles } from '../../utils/glassMixin.js';

export class AssistantView extends LitElement {
    static styles = [glassStyles, css`
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
        }

        .response-container {
            height: calc(100% - 60px);
            overflow-y: auto;
            border-radius: 10px;
            font-size: var(--response-font-size, 18px);
            line-height: 1.6;
            background: linear-gradient(135deg, 
                rgba(0, 0, 0, 0.35) 0%, 
                rgba(0, 0, 0, 0.25) 100%);
            backdrop-filter: blur(25px) saturate(180%) brightness(1.02);
            -webkit-backdrop-filter: blur(25px) saturate(180%) brightness(1.02);
            border: 1px solid var(--glass-border);
            padding: 16px;
            scroll-behavior: smooth;
            user-select: text;
            cursor: text;
            box-shadow: var(--glass-shadow), 
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* Allow text selection for all content within the response container */
        .response-container * {
            user-select: text;
            cursor: text;
        }

        /* Restore default cursor for interactive elements */
        .response-container a {
            cursor: pointer;
        }

        /* Animated word-by-word reveal */
        .response-container [data-word] {
            opacity: 0;
            filter: blur(10px);
            display: inline-block;
            transition: opacity 0.5s, filter 0.5s;
        }
        .response-container [data-word].visible {
            opacity: 1;
            filter: blur(0px);
        }

        /* Markdown styling */
        .response-container h1,
        .response-container h2,
        .response-container h3,
        .response-container h4,
        .response-container h5,
        .response-container h6 {
            margin: 1.2em 0 0.6em 0;
            color: var(--text-color);
            font-weight: 600;
        }

        .response-container h1 {
            font-size: 1.8em;
        }
        .response-container h2 {
            font-size: 1.5em;
        }
        .response-container h3 {
            font-size: 1.3em;
        }
        .response-container h4 {
            font-size: 1.1em;
        }
        .response-container h5 {
            font-size: 1em;
        }
        .response-container h6 {
            font-size: 0.9em;
        }

        .response-container p {
            margin: 0.8em 0;
            color: var(--text-color);
        }

        .response-container ul,
        .response-container ol {
            margin: 0.8em 0;
            padding-left: 2em;
            color: var(--text-color);
        }

        .response-container li {
            margin: 0.4em 0;
        }

        .response-container blockquote {
            margin: 1em 0;
            padding: 0.5em 1em;
            border-left: 4px solid var(--focus-border-color);
            background: linear-gradient(90deg, 
                rgba(0, 122, 255, 0.15) 0%, 
                rgba(0, 122, 255, 0.08) 100%);
            backdrop-filter: blur(10px) saturate(150%);
            -webkit-backdrop-filter: blur(10px) saturate(150%);
            border-radius: 4px;
            font-style: italic;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .response-container code {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.85em;
        }

        .response-container pre {
            background: linear-gradient(135deg, 
                rgba(0, 0, 0, 0.5) 0%, 
                rgba(0, 0, 0, 0.4) 100%);
            backdrop-filter: blur(15px) saturate(130%);
            -webkit-backdrop-filter: blur(15px) saturate(130%);
            border: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-border-top);
            border-radius: 6px;
            padding: 1em;
            overflow-x: auto;
            margin: 1em 0;
            box-shadow: var(--glass-shadow), 
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .response-container pre code {
            background: none;
            padding: 0;
            border-radius: 0;
        }

        .response-container a {
            color: var(--link-color);
            text-decoration: none;
        }

        .response-container a:hover {
            text-decoration: underline;
        }

        .response-container strong,
        .response-container b {
            font-weight: 600;
            color: var(--text-color);
        }

        .response-container em,
        .response-container i {
            font-style: italic;
        }

        .response-container hr {
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2em 0;
        }

        .response-container table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }

        .response-container th,
        .response-container td {
            border: 1px solid var(--border-color);
            padding: 0.5em;
            text-align: left;
        }

        .response-container th {
            background: var(--input-background);
            font-weight: 600;
        }

        .response-container::-webkit-scrollbar {
            width: 8px;
        }

        .response-container::-webkit-scrollbar-track {
            background: var(--scrollbar-track);
            border-radius: 4px;
        }

        .response-container::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 4px;
        }

        .response-container::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }

        .text-input-container {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            align-items: center;
        }

        .text-input-container input {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            -webkit-backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            color: var(--text-color);
            border: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-border-top);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            box-shadow: var(--glass-shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .text-input-container input:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            background: rgba(255, 255, 255, 0.02);
        }

        .text-input-container input:disabled::placeholder {
            color: rgba(255, 255, 255, 0.2);
        }

        .text-input-container input:focus {
            outline: none;
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow), 
                var(--glass-shadow-hover);
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(15px) saturate(160%);
            -webkit-backdrop-filter: blur(15px) saturate(160%);
        }

        .text-input-container input::placeholder {
            color: var(--placeholder-color);
        }

        .text-input-container button {
            background: transparent;
            color: var(--start-button-background);
            border: none;
            padding: 0;
            border-radius: 100px;
        }

        .text-input-container button:hover {
            background: var(--text-input-button-hover);
        }

        .nav-button {
            background: rgba(0, 0, 0, 0.3);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 4px;
            border-radius: 50%;
            font-size: 12px;
            display: flex;
            align-items: center;
            width: 36px;
            height: 36px;
            justify-content: center;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
        }

        .nav-button:hover {
            background: rgba(135, 206, 250, 0.2);
            border-color: rgba(135, 206, 250, 0.3);
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 
                        0 0 15px rgba(135, 206, 250, 0.3);
        }

        .nav-button:disabled {
            opacity: 0.3;
        }

        .nav-button svg {
            stroke: white !important;
        }

        .response-counter {
            font-size: 12px;
            color: var(--description-color);
            white-space: nowrap;
            min-width: 60px;
            text-align: center;
        }

        .save-button {
            background: rgba(0, 0, 0, 0.3);
            color: var(--start-button-background);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 4px;
            border-radius: 50%;
            font-size: 12px;
            display: flex;
            align-items: center;
            width: 36px;
            height: 36px;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
        }

        .save-button:hover {
            background: rgba(135, 206, 250, 0.2);
            border-color: rgba(135, 206, 250, 0.3);
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 
                        0 0 15px rgba(135, 206, 250, 0.3);
        }

        .save-button.saved {
            color: #4caf50;
        }

        .save-button svg {
            stroke: currentColor !important;
        }

        .world-button {
            background: rgba(0, 0, 0, 0.3);
            color: rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 4px;
            border-radius: 50%;
            font-size: 12px;
            display: flex;
            align-items: center;
            width: 36px;
            height: 36px;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
        }

        .world-button:hover {
            background: rgba(135, 206, 250, 0.2);
            border-color: rgba(135, 206, 250, 0.3);
            color: white;
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 
                        0 0 15px rgba(135, 206, 250, 0.3);
        }

        .world-button svg {
            stroke: currentColor !important;
        }
    `];

    static properties = {
        responses: { type: Array },
        currentResponseIndex: { type: Number },
        selectedProfile: { type: String },
        onSendText: { type: Function },
        shouldAnimateResponse: { type: Boolean },
        savedResponses: { type: Array },
        onWorldClick: { type: Function },
        isCapturing: { type: Boolean },
    };

    constructor() {
        super();
        this.responses = [];
        this.currentResponseIndex = -1;
        this.selectedProfile = 'interview';
        this.onSendText = () => {};
        this.onWorldClick = () => {};
        this._lastAnimatedWordCount = 0;
        this.isCapturing = false;
        // Load saved responses from localStorage
        try {
            this.savedResponses = JSON.parse(localStorage.getItem('savedResponses') || '[]');
        } catch (e) {
            this.savedResponses = [];
        }
    }

    getProfileNames() {
        return {
            interview: 'Job Interview',
            sales: 'Sales Call',
            meeting: 'Business Meeting',
            presentation: 'Presentation',
            negotiation: 'Negotiation',
            exam: 'Exam Assistant',
        };
    }

    getCurrentResponse() {
        return this.responses.length > 0 && this.currentResponseIndex >= 0
            ? this.responses[this.currentResponseIndex]
            : 'Select Listen or Capture to start using features';
    }

    renderMarkdown(content) {
        // Check if marked is available
        if (typeof window !== 'undefined' && window.marked) {
            try {
                // Configure marked for better security and formatting
                window.marked.setOptions({
                    breaks: true,
                    gfm: true,
                    sanitize: false, // We trust the AI responses
                });
                let rendered = window.marked.parse(content);
                rendered = this.wrapWordsInSpans(rendered);
                return rendered;
            } catch (error) {
                console.warn('Error parsing markdown:', error);
                return content; // Fallback to plain text
            }
        }
        console.log('Marked not available, using plain text');
        return content; // Fallback if marked is not available
    }

    wrapWordsInSpans(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tagsToSkip = ['PRE'];

        function wrap(node) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() && !tagsToSkip.includes(node.parentNode.tagName)) {
                const words = node.textContent.split(/(\s+)/);
                const frag = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim()) {
                        const span = document.createElement('span');
                        span.setAttribute('data-word', '');
                        span.textContent = word;
                        frag.appendChild(span);
                    } else {
                        frag.appendChild(document.createTextNode(word));
                    }
                });
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === Node.ELEMENT_NODE && !tagsToSkip.includes(node.tagName)) {
                Array.from(node.childNodes).forEach(wrap);
            }
        }
        Array.from(doc.body.childNodes).forEach(wrap);
        return doc.body.innerHTML;
    }

    getResponseCounter() {
        return this.responses.length > 0 ? `${this.currentResponseIndex + 1}/${this.responses.length}` : '';
    }

    navigateToPreviousResponse() {
        if (this.currentResponseIndex > 0) {
            this.currentResponseIndex--;
            this.dispatchEvent(
                new CustomEvent('response-index-changed', {
                    detail: { index: this.currentResponseIndex },
                })
            );
            this.requestUpdate();
        }
    }

    navigateToNextResponse() {
        if (this.currentResponseIndex < this.responses.length - 1) {
            this.currentResponseIndex++;
            this.dispatchEvent(
                new CustomEvent('response-index-changed', {
                    detail: { index: this.currentResponseIndex },
                })
            );
            this.requestUpdate();
        }
    }

    scrollResponseUp() {
        const container = this.shadowRoot.querySelector('.response-container');
        if (container) {
            const scrollAmount = container.clientHeight * 0.3; // Scroll 30% of container height
            container.scrollTop = Math.max(0, container.scrollTop - scrollAmount);
        }
    }

    scrollResponseDown() {
        const container = this.shadowRoot.querySelector('.response-container');
        if (container) {
            const scrollAmount = container.clientHeight * 0.3; // Scroll 30% of container height
            container.scrollTop = Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + scrollAmount);
        }
    }

    loadFontSize() {
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize !== null) {
            const fontSizeValue = parseInt(fontSize, 10) || 20;
            const root = document.documentElement;
            root.style.setProperty('--response-font-size', `${fontSizeValue}px`);
        }
    }

    connectedCallback() {
        super.connectedCallback();

        // Load and apply font size
        this.loadFontSize();

        // Set up IPC listeners for keyboard shortcuts
        if (window.require) {
            const { ipcRenderer } = window.require('electron');

            this.handlePreviousResponse = () => {
                console.log('Received navigate-previous-response message');
                this.navigateToPreviousResponse();
            };

            this.handleNextResponse = () => {
                console.log('Received navigate-next-response message');
                this.navigateToNextResponse();
            };

            this.handleScrollUp = () => {
                console.log('Received scroll-response-up message');
                this.scrollResponseUp();
            };

            this.handleScrollDown = () => {
                console.log('Received scroll-response-down message');
                this.scrollResponseDown();
            };

            ipcRenderer.on('navigate-previous-response', this.handlePreviousResponse);
            ipcRenderer.on('navigate-next-response', this.handleNextResponse);
            ipcRenderer.on('scroll-response-up', this.handleScrollUp);
            ipcRenderer.on('scroll-response-down', this.handleScrollDown);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        // Clean up IPC listeners
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            if (this.handlePreviousResponse) {
                ipcRenderer.removeListener('navigate-previous-response', this.handlePreviousResponse);
            }
            if (this.handleNextResponse) {
                ipcRenderer.removeListener('navigate-next-response', this.handleNextResponse);
            }
            if (this.handleScrollUp) {
                ipcRenderer.removeListener('scroll-response-up', this.handleScrollUp);
            }
            if (this.handleScrollDown) {
                ipcRenderer.removeListener('scroll-response-down', this.handleScrollDown);
            }
        }
    }

    async handleSendText() {
        const textInput = this.shadowRoot.querySelector('#textInput');
        if (textInput && textInput.value.trim()) {
            const message = textInput.value.trim();
            textInput.value = ''; // Clear input
            await this.onSendText(message);
        }
    }

    handleTextKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendText();
        }
    }

    handleWorldClick() {
        this.onWorldClick();
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = this.shadowRoot.querySelector('.response-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 0);
    }

    saveCurrentResponse() {
        const currentResponse = this.getCurrentResponse();
        if (currentResponse && !this.isResponseSaved()) {
            this.savedResponses = [
                ...this.savedResponses,
                {
                    response: currentResponse,
                    timestamp: new Date().toISOString(),
                    profile: this.selectedProfile,
                },
            ];
            // Save to localStorage for persistence
            localStorage.setItem('savedResponses', JSON.stringify(this.savedResponses));
            this.requestUpdate();
        }
    }

    isResponseSaved() {
        const currentResponse = this.getCurrentResponse();
        return this.savedResponses.some(saved => saved.response === currentResponse);
    }

    firstUpdated() {
        super.firstUpdated();
        this.updateResponseContent();
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('responses') || changedProperties.has('currentResponseIndex')) {
            if (changedProperties.has('currentResponseIndex')) {
                this._lastAnimatedWordCount = 0;
            }
            this.updateResponseContent();
        }
    }

    updateResponseContent() {
        console.log('updateResponseContent called');
        const container = this.shadowRoot.querySelector('#responseContainer');
        if (container) {
            const currentResponse = this.getCurrentResponse();
            console.log('Current response:', currentResponse);
            const renderedResponse = this.renderMarkdown(currentResponse);
            console.log('Rendered response:', renderedResponse);
            container.innerHTML = renderedResponse;
            const words = container.querySelectorAll('[data-word]');
            if (this.shouldAnimateResponse) {
                for (let i = 0; i < this._lastAnimatedWordCount && i < words.length; i++) {
                    words[i].classList.add('visible');
                }
                for (let i = this._lastAnimatedWordCount; i < words.length; i++) {
                    words[i].classList.remove('visible');
                    setTimeout(() => {
                        words[i].classList.add('visible');
                        if (i === words.length - 1) {
                            this.dispatchEvent(new CustomEvent('response-animation-complete', { bubbles: true, composed: true }));
                        }
                    }, (i - this._lastAnimatedWordCount) * 100);
                }
                this._lastAnimatedWordCount = words.length;
            } else {
                words.forEach(word => word.classList.add('visible'));
                this._lastAnimatedWordCount = words.length;
            }
        } else {
            console.log('Response container not found');
        }
    }

    render() {
        const currentResponse = this.getCurrentResponse();
        const responseCounter = this.getResponseCounter();
        const isSaved = this.isResponseSaved();

        return html`
            <div class="response-container" id="responseContainer"></div>

            <div class="text-input-container">
                <button class="nav-button" @click=${this.navigateToPreviousResponse} ?disabled=${this.currentResponseIndex <= 0}>
                    <?xml version="1.0" encoding="UTF-8"?><svg
                        width="24px"
                        height="24px"
                        stroke-width="1.7"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                    >
                        <path d="M15 6L9 12L15 18" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>

                ${this.responses.length > 0 ? html` <span class="response-counter">${responseCounter}</span> ` : ''}

                <button
                    class="world-button"
                    @click=${this.handleWorldClick}
                    title="World"
                >
                    <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/>
                        <path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        <path d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        <path d="M3 12H21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                    </svg>
                </button>

                <button
                    class="save-button ${isSaved ? 'saved' : ''}"
                    @click=${this.saveCurrentResponse}
                    title="${isSaved ? 'Response saved' : 'Save this response'}"
                >
                    <?xml version="1.0" encoding="UTF-8"?><svg
                        width="24px"
                        height="24px"
                        stroke-width="1.7"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5 20V5C5 3.89543 5.89543 3 7 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L19.4142 5.41421C19.7893 5.78929 20 6.29799 20 6.82843V20C20 21.1046 19.1046 22 18 22H7C5.89543 22 5 21 5 20Z"
                            stroke="currentColor"
                            stroke-width="1.7"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></path>
                        <path d="M15 22V13H9V22" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M9 3V8H15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>

                <input type="text" id="textInput" placeholder="Type a message to the AI..." @keydown=${this.handleTextKeydown} ?disabled=${!this.isCapturing} />

                <button class="nav-button" @click=${this.navigateToNextResponse} ?disabled=${this.currentResponseIndex >= this.responses.length - 1}>
                    <?xml version="1.0" encoding="UTF-8"?><svg
                        width="24px"
                        height="24px"
                        stroke-width="1.7"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                    >
                        <path d="M9 6L15 12L9 18" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>
            </div>
        `;
    }
}

customElements.define('assistant-view', AssistantView);
