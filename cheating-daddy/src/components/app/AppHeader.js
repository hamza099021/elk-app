import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { glassStyles } from '../../utils/glassMixin.js';

export class AppHeader extends LitElement {
    static styles = [glassStyles, css`
        :host {
            display: block;
            pointer-events: auto;
        }

        * {
            font-family: 'Inter', sans-serif;
            cursor: default;
            user-select: none;
        }

        .header {
            position: relative;
            -webkit-app-region: drag;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 135px 0 14px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: var(--border-radius);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            transition: all 1s ease;
            height: 60px;
            min-height: 60px;
            z-index: 1000;
        }

        /* Remove bottom border and shadow in assistant view (header-only) */
        :host([currentview="assistant"]) .header {
            border-bottom: none;
            box-shadow: none;
        }

        .header-actions {
            position: absolute;
            right: 14px;
            top: 0;
            bottom: 0;
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
            -webkit-app-region: no-drag;
            flex-shrink: 0;
            z-index: 10;
        }

        .header-actions span {
            font-size: var(--header-font-size-small);
            color: var(--header-actions-color);
        }

        .button {
            background: rgba(0, 0, 0, 0.3);
            color: var(--text-color);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: var(--header-button-padding);
            border-radius: 25px;
            font-size: var(--header-font-size-small);
            font-weight: 500;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
            letter-spacing: 2px;
        }

        .icon-button {
            background: rgba(0, 0, 0, 0.3);
            color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px;
            border-radius: 50%;
            font-size: var(--header-font-size-small);
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
            cursor: pointer;
            width: 36px;
            height: 36px;
            flex-shrink: 0;
        }

        .icon-button svg {
            width: 18px;
            height: 18px;
            display: block;
            flex-shrink: 0;
        }

        .icon-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
            color: white;
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 
                        0 0 10px rgba(255, 255, 255, 0.1);
        }

        .icon-button:active {
            transform: scale(0.95);
            background: rgba(255, 255, 255, 0.25);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .icon-button.window-close:hover {
            background: rgba(220, 80, 80, 0.6);
            border-color: rgba(255, 120, 120, 0.6);
            box-shadow: 0 6px 20px rgba(220, 80, 80, 0.4), 
                        0 0 15px rgba(220, 80, 80, 0.3);
        }

        .button:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
            letter-spacing: 3px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 
                        0 0 15px rgba(135, 206, 250, 0.2);
        }

        :host([isclickthrough]) .button:hover,
        :host([isclickthrough]) .icon-button:hover {
            background: transparent;
        }

        .key {
            background: var(--key-background);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            margin: 0px;
        }

        /* Main features section - inline buttons */
        .main-features {
            display: flex;
            gap: 16px;
            align-items: center;
            justify-content: center;
            -webkit-app-region: no-drag;
            flex-wrap: nowrap;
        }

        /* Compact mode adjustments */
        :host([compact]) .main-features {
            gap: 10px;
        }

        :host([compact]) .feature-button {
            padding: 10px 18px !important;
            font-size: 0.85rem !important;
            letter-spacing: 2px !important;
        }

        .feature-button {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            padding: 12px 24px;
            color: rgba(255, 255, 255, 0.6);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
            font-size: 0.95rem;
            font-weight: 400;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            opacity: 0.6;
            white-space: nowrap;
        }

        .feature-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
            color: white;
            opacity: 1;
            letter-spacing: 4px;
            transform: scale(1.02);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                        0 0 20px rgba(135, 206, 250, 0.2);
        }

        .feature-button:active {
            transform: scale(0.98);
            background: rgba(255, 255, 255, 0.15);
        }

        .feature-button.active {
            opacity: 1;
            background: rgba(135, 206, 250, 0.2);
            border-color: rgba(135, 206, 250, 0.4);
            color: white;
            letter-spacing: 4px;
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(135, 206, 250, 0.3), 
                        0 0 40px rgba(135, 206, 250, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .feature-button.active:hover {
            background: rgba(135, 206, 250, 0.25);
            border-color: rgba(135, 206, 250, 0.5);
            transform: scale(1.08);
            letter-spacing: 5px;
            box-shadow: 0 8px 40px rgba(135, 206, 250, 0.4), 
                        0 0 60px rgba(135, 206, 250, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .feature-button svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            display: block;
            margin: auto;
        }

        .feature-button.pro-feature {
            position: relative;
        }

        .feature-button.pro-feature.locked {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }

        .pro-badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            font-size: 8px;
            font-weight: 700;
            padding: 2px 4px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Perplexity search container */
        .perplexity-search {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            padding: 8px 12px 8px 14px;
            min-width: 200px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: all 0.8s ease;
        }

        .perplexity-search .world-icon {
            width: 16px;
            height: 16px;
            color: rgba(255, 255, 255, 0.6);
            flex-shrink: 0;
        }

        .perplexity-search:focus-within {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(135, 206, 250, 0.4);
            transform: scale(1.02);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 
                        0 0 20px rgba(135, 206, 250, 0.3);
        }

        .perplexity-input {
            background: transparent;
            border: none;
            outline: none;
            color: rgba(255, 255, 255, 0.9);
            font-size: 13px;
            flex: 1;
            padding: 6px 0;
            min-width: 140px;
            -webkit-app-region: no-drag;
        }

        .perplexity-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .search-icon-button {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 50%;
            padding: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.8s ease;
            -webkit-app-region: no-drag;
        }

        .search-icon-button:hover {
            background: rgba(135, 206, 250, 0.3);
            transform: scale(1.1);
            box-shadow: 0 0 10px rgba(135, 206, 250, 0.4);
        }

        .search-icon-button svg {
            width: 16px;
            height: 16px;
            color: rgba(255, 255, 255, 0.8);
        }
    `];

    static properties = {
        currentView: { type: String, reflect: true },
        statusText: { type: String },
        startTime: { type: Number },
        onCustomizeClick: { type: Function },
        onHelpClick: { type: Function },
        onHistoryClick: { type: Function },
        onCloseClick: { type: Function },
        onBackClick: { type: Function },
        onHideToggleClick: { type: Function },
        isClickThrough: { type: Boolean, reflect: true },
        advancedMode: { type: Boolean },
        onAdvancedClick: { type: Function },
        // New properties for main features
        isListening: { type: Boolean },
        isScreenCapturing: { type: Boolean },
        onToggleListen: { type: Function },
        onToggleScreenCapture: { type: Function },
        onWorldClick: { type: Function },
        userPlan: { type: String },
    };

    constructor() {
        super();
        this.currentView = 'main';
        this.statusText = '';
        this.startTime = null;
        this.onCustomizeClick = () => {};
        this.onHelpClick = () => {};
        this.onHistoryClick = () => {};
        this.onCloseClick = () => {};
        this.onBackClick = () => {};
        this.onHideToggleClick = () => {};
        this.isClickThrough = false;
        this.advancedMode = false;
        this.onAdvancedClick = () => {};
        this._timerInterval = null;
        // New properties
        this.isListening = false;
        this.isScreenCapturing = false;
        this.onToggleListen = () => {};
        this.onToggleScreenCapture = () => {};
        this.onWorldClick = () => {};
        this.userPlan = 'FREE';
    }

    connectedCallback() {
        super.connectedCallback();
        this._startTimer();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopTimer();
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        // Start/stop timer based on view change
        if (changedProperties.has('currentView')) {
            if (this.currentView === 'assistant' && this.startTime) {
                this._startTimer();
            } else {
                this._stopTimer();
            }
        }

        // Start timer when startTime is set
        if (changedProperties.has('startTime')) {
            if (this.startTime && this.currentView === 'assistant') {
                this._startTimer();
            } else if (!this.startTime) {
                this._stopTimer();
            }
        }
    }

    _startTimer() {
        // Clear any existing timer
        this._stopTimer();

        // Only start timer if we're in assistant view and have a start time
        if (this.currentView === 'assistant' && this.startTime) {
            this._timerInterval = setInterval(() => {
                // Trigger a re-render by requesting an update
                this.requestUpdate();
            }, 1000); // Update every second
        }
    }

    _stopTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    }

    getViewTitle() {
        const titles = {
            onboarding: 'Welcome to Cheating Daddy',
            main: 'Cheating Daddy',
            customize: 'Customize',
            help: 'Help & Shortcuts',
            history: 'Conversation History',
            advanced: 'Advanced Tools',
            assistant: 'Cheating Daddy',
        };
        return titles[this.currentView] || 'Cheating Daddy';
    }

    getElapsedTime() {
        if (this.currentView === 'assistant' && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            return `${elapsed}s`;
        }
        return '';
    }

    isNavigationView() {
        const navigationViews = ['customize', 'help', 'history', 'advanced'];
        return navigationViews.includes(this.currentView);
    }

    render() {
        const elapsedTime = this.getElapsedTime();

        return html`
            <div class="header">
                ${this.currentView === 'assistant'
                    ? html`
                          <div class="main-features">
                              <!-- Microphone Toggle (Left) -->
                              <button
                                  class="feature-button ${this.isListening ? 'active' : ''}"
                                  @click=${this.onToggleListen}
                                  title="Toggle Interview Listening"
                              >
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path
                                          d="M12 4C10.3431 4 9 5.34315 9 7V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V7C15 5.34315 13.6569 4 12 4Z"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      />
                                      <path d="M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M12 22H9M12 22H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                              </button>

                              <!-- World Search (Center) - Pro Feature -->
                              <button
                                  class="feature-button pro-feature ${this.userPlan === 'FREE' ? 'locked' : ''}"
                                  @click=${this.userPlan === 'FREE' ? null : this.onWorldClick}
                                  ?disabled=${this.userPlan === 'FREE'}
                                  title="${this.userPlan === 'FREE' ? 'Web Search (Pro Feature - Upgrade to unlock)' : 'Web Search'}"
                              >
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                      <path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                      <path d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                      <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                  </svg>
                                  ${this.userPlan === 'FREE' ? html`<span class="pro-badge">PRO</span>` : ''}
                              </button>

                              <!-- Screen Capture Toggle (Right) -->
                              <button
                                  class="feature-button ${this.isScreenCapturing ? 'active' : ''}"
                                  @click=${this.onToggleScreenCapture}
                                  title="Toggle Screen Capture"
                              >
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path
                                          d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V6Z"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      />
                                      <path d="M7 20H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                      <path d="M10 16V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                      <path d="M14 16V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                  </svg>
                              </button>
                          </div>
                      `
                    : ''}

                <div class="header-actions">
                    ${this.currentView === 'assistant'
                        ? html`
                              <button class="icon-button" @click=${this.onCustomizeClick} title="Settings">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                              <button class="icon-button" @click=${this.onHelpClick} title="Help">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M9 9C9 5.49997 14.5 5.5 14.5 9C14.5 11.5 12 10.9999 12 13.9999"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                      <path
                                          d="M12 18.01L12.01 17.9989"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                              <button @click=${this.onCloseClick} class="icon-button window-close" title="Close">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                          `
                        : html`
                              <button @click=${this.isNavigationView() ? this.onBackClick : this.onCloseClick} class="icon-button window-close">
                                  <?xml version="1.0" encoding="UTF-8"?><svg
                                      width="24px"
                                      height="24px"
                                      stroke-width="1.7"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      color="currentColor"
                                  >
                                      <path
                                          d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                                          stroke="currentColor"
                                          stroke-width="1.7"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                              </button>
                          `}
                </div>
            </div>
        `;
    }
}

customElements.define('app-header', AppHeader);