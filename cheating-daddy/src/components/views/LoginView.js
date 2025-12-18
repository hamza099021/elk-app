import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import { glassStyles } from '../../utils/glassMixin.js';
import { authAPI } from '../../utils/api.js';

export class LoginView extends LitElement {
    static styles = [glassStyles, css`
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
        }

        .drag-region {
            -webkit-app-region: drag;
            height: 40px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .drag-handle {
            width: 40px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }

        .content-area {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: auto;
        }

        .login-container {
            width: 400px;
            padding: 40px;
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.08) 0%, 
                rgba(255, 255, 255, 0.03) 100%);
            backdrop-filter: blur(40px) saturate(180%) brightness(1.1);
            -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.1);
            border-radius: 16px;
            border: 1px solid var(--glass-border);
            border-top: 2px solid var(--glass-border-top);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .logo {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo h1 {
            font-size: 28px;
            font-weight: 600;
            color: #e5e5e7;
            margin-bottom: 8px;
        }

        .logo p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
        }

        input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            -webkit-backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            border: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-border-top);
            border-radius: 8px;
            color: white;
            font-size: 14px;
            box-shadow: var(--glass-shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus {
            outline: none;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(15px) saturate(160%);
            -webkit-backdrop-filter: blur(15px) saturate(160%);
            border-color: var(--focus-border-color);
            box-shadow: 0 0 0 3px var(--focus-box-shadow), 
                var(--glass-shadow-hover);
        }

        input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .login-button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.12) 0%, 
                rgba(255, 255, 255, 0.08) 100%);
            backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            -webkit-backdrop-filter: var(--glass-blur-subtle) saturate(150%);
            border: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-border-top);
            border-radius: 8px;
            color: white;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: var(--glass-shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 10px;
        }

        .login-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.18) 0%, 
                rgba(255, 255, 255, 0.12) 100%);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: var(--glass-shadow-hover), 
                0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .login-button:active {
            transform: translateY(0);
        }

        .error-message {
            margin-top: 15px;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #fca5a5;
            font-size: 13px;
            text-align: center;
        }

        .signup-section {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
        }

        .signup-link {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .signup-link:hover {
            color: white;
            text-decoration: underline;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }
    `];

    static properties = {
        errorMessage: { type: String }
    };

    constructor() {
        super();
        this.errorMessage = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const email = this.shadowRoot.querySelector('#email').value.trim();
        const password = this.shadowRoot.querySelector('#password').value.trim();

        // Basic validation
        if (!email || !password) {
            this.errorMessage = 'Please enter both email and password';
            return;
        }

        if (!email.includes('@')) {
            this.errorMessage = 'Please enter a valid email address';
            return;
        }

        if (password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters';
            return;
        }

        try {
            // Call backend login API using centralized authAPI
            const data = await authAPI.login(email, password);

            if (!data.success) {
                this.errorMessage = data.error || 'Login failed. Please check your credentials.';
                return;
            }

            // Dispatch event to parent to switch views
            // Note: authAPI.login already stores tokens in localStorage
            this.dispatchEvent(new CustomEvent('login-success', {
                bubbles: true,
                composed: true,
                detail: { user: data.data.user }
            }));
        } catch (error) {
            console.error('Login error:', error);
            this.errorMessage = 'Failed to connect to server. Please try again.';
        }
    }

    handleSignUpClick(e) {
        e.preventDefault();
        
        // Open pricing page in default browser
        if (window.require) {
            const { shell } = window.require('electron');
            shell.openExternal('https://pluely.com/pricing');
        } else {
            window.open('https://pluely.com/pricing', '_blank');
        }
    }

    render() {
        return html`
            <div class="drag-region">
                <div class="drag-handle"></div>
            </div>
            <div class="content-area">
                <div class="login-container">
                    <div class="logo">
                        <h1>Elk AI</h1>
                        <p>Sign in to continue</p>
                    </div>

                    <form @submit=${this.handleSubmit}>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="your@email.com"
                                autocomplete="email"
                            />
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Enter your password"
                                autocomplete="current-password"
                            />
                        </div>

                        ${this.errorMessage ? html`
                            <div class="error-message">${this.errorMessage}</div>
                        ` : ''}

                        <button type="submit" class="login-button">
                            Sign In
                        </button>
                    </form>

                    <div class="signup-section">
                        Don't have an account? 
                        <a href="#" class="signup-link" @click=${this.handleSignUpClick}>
                            Sign Up
                        </a>
                    </div>

                    <div class="footer">
                        © 2025 Elk AI. All rights reserved.
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('login-view', LoginView);
