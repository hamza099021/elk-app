import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { glassStyles } from '../../utils/glassMixin.js';

/**
 * ListenView - Separate window for Interview Listening
 * Shows transcribed responses from audio (read-only, no input)
 */
export class ListenView extends LitElement {
    static styles = [glassStyles, css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background: transparent;
            color: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .listen-container {
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

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
        }

        .status-indicator.active {
            color: #4ade80;
        }

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
        }

        .status-dot.active {
            background: #4ade80;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
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

        .content-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 10px;
            min-height: 0;
            overflow: hidden;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .response-section {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            min-height: 0;
            padding: 8px;
        }

        .response-content {
            font-size: 13px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
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
            width: 40px;
            height: 40px;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        .empty-state span {
            font-size: 12px;
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

        /* Markdown styling */
        .response-content h1,
        .response-content h2,
        .response-content h3 {
            margin: 0.6em 0 0.3em 0;
            font-weight: 600;
        }

        .response-content p {
            margin: 0.4em 0;
        }

        .response-content ul, .response-content ol {
            margin: 0.4em 0;
            padding-left: 1.2em;
        }

        .response-content code {
            background: rgba(255, 255, 255, 0.08);
            padding: 0.1em 0.3em;
            border-radius: 3px;
            font-size: 0.9em;
        }

        .response-content pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.6em;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 12px;
        }

        /* Animated word-by-word reveal for streaming */
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
            transition: opacity 0.3s, filter 0.3s;
        }

        .nav-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 8px;
        }

        .nav-button {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            padding: 6px;
            border-radius: 50%;
            display: flex;
            align-items: center;
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
            cursor: not-allowed;
        }

        .nav-button svg {
            width: 16px;
            height: 16px;
        }

        .response-counter {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            min-width: 50px;
            text-align: center;
        }
    `];

    static properties = {
        responses: { type: Array },
        currentResponseIndex: { type: Number },
        isListening: { type: Boolean },
        onClose: { type: Function },
        response: { type: String }, // Single response for direct updates
    };

    constructor() {
        super();
        this.responses = [];
        this.currentResponseIndex = -1;
        this.isListening = false;
        this.onClose = () => {};
        this.response = '';
        this._setupResponseListener();
    }

    _setupResponseListener() {
        // Note: Response listeners are set up in listen.html to avoid duplicate handlers
        // This method is kept for compatibility but listeners are handled by the host HTML
        console.log('[ListenView] Component initialized, listeners set up in listen.html');
    }

    getCurrentResponse() {
        // Prefer direct response over responses array for streaming updates
        if (this.response) {
            return this.response;
        }
        return this.responses.length > 0 && this.currentResponseIndex >= 0
            ? this.responses[this.currentResponseIndex]
            : '';
    }

    navigateToPrevResponse() {
        if (this.currentResponseIndex > 0) {
            this.currentResponseIndex--;
            this.requestUpdate();
        }
    }

    navigateToNextResponse() {
        if (this.currentResponseIndex < this.responses.length - 1) {
            this.currentResponseIndex++;
            this.requestUpdate();
        }
    }

    handleClose() {
        this.onClose();
    }

    wrapWordsInSpans(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tagsToSkip = ['PRE', 'CODE'];

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
                    } else if (word) {
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

    animateNewWords() {
        const container = this.shadowRoot.querySelector('.response-content');
        if (!container) return;
        
        container.classList.add('animating');
        const words = container.querySelectorAll('[data-word]:not(.visible)');
        words.forEach((word, i) => {
            setTimeout(() => {
                word.classList.add('visible');
            }, i * 30); // 30ms delay between words for faster streaming feel
        });
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('response') && this.response) {
            requestAnimationFrame(() => {
                this.animateNewWords();
                this._resizeWindowToFit();
            });
        }
    }

    _resizeWindowToFit() {
        // Request window resize based on content height
        if (window.require) {
            const container = this.shadowRoot.querySelector('.listen-container');
            if (container) {
                const contentHeight = container.scrollHeight + 20; // Add padding
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('resize-listen-window', contentHeight);
            }
        }
    }

    renderMarkdown(text) {
        if (!text) return '';
        
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
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        const wrapped = `<p>${html}</p>`;
        return this.wrapWordsInSpans(wrapped);
    }

    render() {
        const currentResponse = this.getCurrentResponse();

        return html`
            <div class="listen-container">
                <div class="header">
                    <div class="header-title">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4C10.3431 4 9 5.34315 9 7V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V7C15 5.34315 13.6569 4 12 4Z" stroke="currentColor" stroke-width="1.7"/>
                            <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M12 22H9M12 22H15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        </svg>
                        Listen
                    </div>
                    <div class="status-indicator ${this.isListening ? 'active' : ''}">
                        <span class="status-dot ${this.isListening ? 'active' : ''}"></span>
                        ${this.isListening ? 'Listening...' : 'Stopped'}
                    </div>
                    <button class="close-button" @click=${this.handleClose} title="Close">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="content-section">
                    <div class="response-section">
                        ${currentResponse ? html`
                            <div class="response-content" .innerHTML=${this.renderMarkdown(currentResponse)}></div>
                        ` : html`
                            <div class="empty-state">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4C10.3431 4 9 5.34315 9 7V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V7C15 5.34315 13.6569 4 12 4Z" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M12 22H9M12 22H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                <span>Start listening to see transcribed responses</span>
                            </div>
                        `}
                    </div>

                    ${this.responses.length > 1 ? html`
                        <div class="nav-controls">
                            <button class="nav-button" @click=${this.navigateToPrevResponse} ?disabled=${this.currentResponseIndex <= 0}>
                                <svg viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            </button>
                            <span class="response-counter">${this.currentResponseIndex + 1} / ${this.responses.length}</span>
                            <button class="nav-button" @click=${this.navigateToNextResponse} ?disabled=${this.currentResponseIndex >= this.responses.length - 1}>
                                <svg viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('listen-view', ListenView);
