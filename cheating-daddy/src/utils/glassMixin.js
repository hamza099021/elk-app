import { css } from '../assets/lit-core-2.7.4.min.js';

/**
 * Reusable glass effect styles (dark frosted glassmorphism)
 * Apply to Lit components via: static styles = [glassStyles, css`...`];
 */
export const glassStyles = css`
  .glass-panel {
    backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%) brightness(1.1);
    -webkit-backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%) brightness(1.1);
    background: var(--glass-bg-dark, rgba(30, 30, 35, 0.65));
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
    border-top-color: var(--glass-border-top, rgba(255, 255, 255, 0.18));
    box-shadow: var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.35)),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-panel-light {
    backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%) brightness(1.1);
    -webkit-backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%) brightness(1.1);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-panel-strong {
    backdrop-filter: var(--glass-blur-strong, blur(40px)) saturate(200%) brightness(1.15);
    -webkit-backdrop-filter: var(--glass-blur-strong, blur(40px)) saturate(200%) brightness(1.15);
    background: linear-gradient(
      135deg,
      rgba(40, 40, 45, 0.7) 0%,
      rgba(25, 25, 30, 0.6) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-top-color: rgba(255, 255, 255, 0.22);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .glass-button {
    backdrop-filter: var(--glass-blur-subtle, blur(10px)) saturate(180%);
    -webkit-backdrop-filter: var(--glass-blur-subtle, blur(10px)) saturate(180%);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-button:hover {
    backdrop-filter: blur(15px) saturate(200%);
    -webkit-backdrop-filter: blur(15px) saturate(200%);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .glass-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .glass-input {
    backdrop-filter: var(--glass-blur-subtle, blur(10px)) saturate(170%);
    -webkit-backdrop-filter: var(--glass-blur-subtle, blur(10px)) saturate(170%);
    background: rgba(30, 30, 35, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-input:focus {
    backdrop-filter: blur(15px) saturate(200%);
    -webkit-backdrop-filter: blur(15px) saturate(200%);
    background: rgba(40, 40, 45, 0.6);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08),
                0 4px 16px rgba(0, 0, 0, 0.25),
                0 0 20px rgba(255, 255, 255, 0.03);
  }

  .glass-card {
    backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%);
    -webkit-backdrop-filter: var(--glass-blur, blur(20px)) saturate(180%);
    background: rgba(35, 35, 40, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-card:hover {
    backdrop-filter: var(--glass-blur, blur(25px)) saturate(200%);
    -webkit-backdrop-filter: var(--glass-blur, blur(25px)) saturate(200%);
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                0 0 30px rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.18);
  }

  .glass-text {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5),
                 0 0 10px rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.95);
  }

  @keyframes glassReveal {
    0% {
      opacity: 0;
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
      transform: scale(0.95);
    }
    50% {
      backdrop-filter: var(--glass-blur-strong, blur(30px));
      -webkit-backdrop-filter: var(--glass-blur-strong, blur(30px));
    }
    100% {
      opacity: 1;
      backdrop-filter: var(--glass-blur, blur(20px));
      -webkit-backdrop-filter: var(--glass-blur, blur(20px));
      transform: scale(1);
    }
  }

  .glass-reveal {
    animation: glassReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
