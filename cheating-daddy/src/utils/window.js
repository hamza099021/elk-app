const { BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('os');
const { applyStealthMeasures, startTitleRandomization } = require('./stealthFeatures');

let mouseEventsIgnored = false;
let windowResizing = false;
let resizeAnimation = null;
let worldWindow = null;
let listenWindow = null;
let captureWindow = null;

// Smooth glide animation settings
const isMac = process.platform === 'darwin';
const RESIZE_ANIMATION_DURATION = isMac ? 400 : 280; // Longer on macOS for buttery smooth NSWindow animation
const RESIZE_FRAME_RATE = 60;
const SKIP_ANIMATION_THRESHOLD = 50;

function ensureDataDirectories() {
    const homeDir = os.homedir();
    const cheddarDir = path.join(homeDir, 'cheddar');
    const dataDir = path.join(cheddarDir, 'data');
    const imageDir = path.join(dataDir, 'image');
    const audioDir = path.join(dataDir, 'audio');

    [cheddarDir, dataDir, imageDir, audioDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return { imageDir, audioDir };
}

function createWindow(sendToRenderer, geminiSessionRef, randomNames = null) {
    // Get layout preference (default to 'normal')
    let windowWidth = 900;
    let windowHeight = 800;

    const mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        frame: false,
        transparent: true,
        hasShadow: true, // Enable shadow for glass depth
        alwaysOnTop: true,
        skipTaskbar: true,
        hiddenInMissionControl: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // TODO: change to true
            backgroundThrottling: false,
            enableBlinkFeatures: 'GetDisplayMedia,BackdropFilter', // Enable backdrop-filter for glass effect
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        backgroundColor: '#00000000',
    });

    const { session, desktopCapturer } = require('electron');
    session.defaultSession.setDisplayMediaRequestHandler(
        (request, callback) => {
            desktopCapturer.getSources({ types: ['screen'] }).then(sources => {
                callback({ video: sources[0], audio: 'loopback' });
            });
        },
        { useSystemPicker: true }
    );

    mainWindow.setResizable(false);
    mainWindow.setContentProtection(true);
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Center window at the top of the screen
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = 0;
    mainWindow.setPosition(x, y);

    if (process.platform === 'win32') {
        mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    }

    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    // Set window title to random name if provided
    if (randomNames && randomNames.windowTitle) {
        mainWindow.setTitle(randomNames.windowTitle);
        console.log(`Set window title to: ${randomNames.windowTitle}`);
    }

    // Apply stealth measures
    applyStealthMeasures(mainWindow);

    // Start periodic title randomization for additional stealth
    startTitleRandomization(mainWindow);

    // After window is created, check for layout preference and resize if needed
    mainWindow.webContents.once('dom-ready', () => {
        setTimeout(() => {
            const defaultKeybinds = getDefaultKeybinds();
            let keybinds = defaultKeybinds;

            mainWindow.webContents
                .executeJavaScript(
                    `
                try {
                    const savedKeybinds = localStorage.getItem('customKeybinds');
                    
                    return {
                        keybinds: savedKeybinds ? JSON.parse(savedKeybinds) : null
                    };
                } catch (e) {
                    return { keybinds: null };
                }
            `
                )
                .then(async savedSettings => {
                    if (savedSettings.keybinds) {
                        keybinds = { ...defaultKeybinds, ...savedSettings.keybinds };
                    }

                    // Apply content protection setting via IPC handler
                    try {
                        const contentProtection = await mainWindow.webContents.executeJavaScript('cheddar.getContentProtection()');
                        mainWindow.setContentProtection(contentProtection);
                        console.log('Content protection loaded from settings:', contentProtection);
                    } catch (error) {
                        console.error('Error loading content protection:', error);
                        mainWindow.setContentProtection(true);
                    }

                    updateGlobalShortcuts(keybinds, mainWindow, sendToRenderer, geminiSessionRef);
                })
                .catch(() => {
                    // Default to content protection enabled
                    mainWindow.setContentProtection(true);
                    updateGlobalShortcuts(keybinds, mainWindow, sendToRenderer, geminiSessionRef);
                });
        }, 150);
    });

    setupWindowIpcHandlers(mainWindow, sendToRenderer, geminiSessionRef);

    return mainWindow;
}

function getDefaultKeybinds() {
    const isMac = process.platform === 'darwin';
    return {
        moveUp: isMac ? 'Alt+Up' : 'Ctrl+Up',
        moveDown: isMac ? 'Alt+Down' : 'Ctrl+Down',
        moveLeft: isMac ? 'Alt+Left' : 'Ctrl+Left',
        moveRight: isMac ? 'Alt+Right' : 'Ctrl+Right',
        toggleVisibility: isMac ? 'Cmd+\\' : 'Ctrl+\\',
        toggleClickThrough: isMac ? 'Cmd+M' : 'Ctrl+M',
        nextStep: isMac ? 'Cmd+Enter' : 'Ctrl+Enter',
        previousResponse: isMac ? 'Cmd+[' : 'Ctrl+[',
        nextResponse: isMac ? 'Cmd+]' : 'Ctrl+]',
        scrollUp: isMac ? 'Cmd+Shift+Up' : 'Ctrl+Shift+Up',
        scrollDown: isMac ? 'Cmd+Shift+Down' : 'Ctrl+Shift+Down',
        emergencyErase: isMac ? 'Cmd+Shift+E' : 'Ctrl+Shift+E',
    };
}

function updateGlobalShortcuts(keybinds, mainWindow, sendToRenderer, geminiSessionRef) {
    console.log('Updating global shortcuts with:', keybinds);

    // Unregister all existing shortcuts
    globalShortcut.unregisterAll();

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const moveIncrement = Math.floor(Math.min(width, height) * 0.1);

    // Register window movement shortcuts
    const movementActions = {
        moveUp: () => {
            if (!mainWindow.isVisible()) return;
            const [currentX, currentY] = mainWindow.getPosition();
            mainWindow.setPosition(currentX, currentY - moveIncrement);
        },
        moveDown: () => {
            if (!mainWindow.isVisible()) return;
            const [currentX, currentY] = mainWindow.getPosition();
            mainWindow.setPosition(currentX, currentY + moveIncrement);
        },
        moveLeft: () => {
            if (!mainWindow.isVisible()) return;
            const [currentX, currentY] = mainWindow.getPosition();
            mainWindow.setPosition(currentX - moveIncrement, currentY);
        },
        moveRight: () => {
            if (!mainWindow.isVisible()) return;
            const [currentX, currentY] = mainWindow.getPosition();
            mainWindow.setPosition(currentX + moveIncrement, currentY);
        },
    };

    // Register each movement shortcut
    Object.keys(movementActions).forEach(action => {
        const keybind = keybinds[action];
        if (keybind) {
            try {
                globalShortcut.register(keybind, movementActions[action]);
                console.log(`Registered ${action}: ${keybind}`);
            } catch (error) {
                console.error(`Failed to register ${action} (${keybind}):`, error);
            }
        }
    });

    // Register toggle visibility shortcut
    if (keybinds.toggleVisibility) {
        try {
            globalShortcut.register(keybinds.toggleVisibility, () => {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.showInactive();
                }
            });
            console.log(`Registered toggleVisibility: ${keybinds.toggleVisibility}`);
        } catch (error) {
            console.error(`Failed to register toggleVisibility (${keybinds.toggleVisibility}):`, error);
        }
    }

    // Register toggle click-through shortcut
    if (keybinds.toggleClickThrough) {
        try {
            globalShortcut.register(keybinds.toggleClickThrough, () => {
                mouseEventsIgnored = !mouseEventsIgnored;
                if (mouseEventsIgnored) {
                    mainWindow.setIgnoreMouseEvents(true, { forward: true });
                    console.log('Mouse events ignored');
                } else {
                    mainWindow.setIgnoreMouseEvents(false);
                    console.log('Mouse events enabled');
                }
                mainWindow.webContents.send('click-through-toggled', mouseEventsIgnored);
            });
            console.log(`Registered toggleClickThrough: ${keybinds.toggleClickThrough}`);
        } catch (error) {
            console.error(`Failed to register toggleClickThrough (${keybinds.toggleClickThrough}):`, error);
        }
    }

    // Register next step shortcut (either starts session or takes screenshot based on view)
    if (keybinds.nextStep) {
        try {
            globalShortcut.register(keybinds.nextStep, async () => {
                console.log('Next step shortcut triggered');
                try {
                    // Determine the shortcut key format
                    const isMac = process.platform === 'darwin';
                    const shortcutKey = isMac ? 'cmd+enter' : 'ctrl+enter';

                    // Use the new handleShortcut function
                    mainWindow.webContents.executeJavaScript(`
                        cheddar.handleShortcut('${shortcutKey}');
                    `);
                } catch (error) {
                    console.error('Error handling next step shortcut:', error);
                }
            });
            console.log(`Registered nextStep: ${keybinds.nextStep}`);
        } catch (error) {
            console.error(`Failed to register nextStep (${keybinds.nextStep}):`, error);
        }
    }

    // Register previous response shortcut
    if (keybinds.previousResponse) {
        try {
            globalShortcut.register(keybinds.previousResponse, () => {
                console.log('Previous response shortcut triggered');
                sendToRenderer('navigate-previous-response');
            });
            console.log(`Registered previousResponse: ${keybinds.previousResponse}`);
        } catch (error) {
            console.error(`Failed to register previousResponse (${keybinds.previousResponse}):`, error);
        }
    }

    // Register next response shortcut
    if (keybinds.nextResponse) {
        try {
            globalShortcut.register(keybinds.nextResponse, () => {
                console.log('Next response shortcut triggered');
                sendToRenderer('navigate-next-response');
            });
            console.log(`Registered nextResponse: ${keybinds.nextResponse}`);
        } catch (error) {
            console.error(`Failed to register nextResponse (${keybinds.nextResponse}):`, error);
        }
    }

    // Register scroll up shortcut
    if (keybinds.scrollUp) {
        try {
            globalShortcut.register(keybinds.scrollUp, () => {
                console.log('Scroll up shortcut triggered');
                sendToRenderer('scroll-response-up');
            });
            console.log(`Registered scrollUp: ${keybinds.scrollUp}`);
        } catch (error) {
            console.error(`Failed to register scrollUp (${keybinds.scrollUp}):`, error);
        }
    }

    // Register scroll down shortcut
    if (keybinds.scrollDown) {
        try {
            globalShortcut.register(keybinds.scrollDown, () => {
                console.log('Scroll down shortcut triggered');
                sendToRenderer('scroll-response-down');
            });
            console.log(`Registered scrollDown: ${keybinds.scrollDown}`);
        } catch (error) {
            console.error(`Failed to register scrollDown (${keybinds.scrollDown}):`, error);
        }
    }

    // Register emergency erase shortcut
    if (keybinds.emergencyErase) {
        try {
            globalShortcut.register(keybinds.emergencyErase, () => {
                console.log('Emergency Erase triggered!');
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.hide();

                    if (geminiSessionRef.current) {
                        geminiSessionRef.current.close();
                        geminiSessionRef.current = null;
                    }

                    sendToRenderer('clear-sensitive-data');

                    setTimeout(() => {
                        const { app } = require('electron');
                        app.quit();
                    }, 300);
                }
            });
            console.log(`Registered emergencyErase: ${keybinds.emergencyErase}`);
        } catch (error) {
            console.error(`Failed to register emergencyErase (${keybinds.emergencyErase}):`, error);
        }
    }

    // Register DevTools shortcut (Ctrl+Shift+I)
    try {
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.toggleDevTools();
            }
        });
        console.log('Registered DevTools shortcut: Ctrl+Shift+I');
    } catch (error) {
        console.error('Failed to register DevTools shortcut:', error);
    }
}

function setupWindowIpcHandlers(mainWindow, sendToRenderer, geminiSessionRef) {
    ipcMain.on('view-changed', (event, view) => {
        if (!mainWindow.isDestroyed()) {
            if (view === 'assistant') {
                // Disable shadow in header-only mode
                mainWindow.setHasShadow(false);
            } else {
                mainWindow.setIgnoreMouseEvents(false);
                // Re-enable shadow in other views
                mainWindow.setHasShadow(true);
            }
        }
    });

    ipcMain.handle('window-minimize', () => {
        if (!mainWindow.isDestroyed()) {
            mainWindow.minimize();
        }
    });

    ipcMain.on('update-keybinds', (event, newKeybinds) => {
        if (!mainWindow.isDestroyed()) {
            updateGlobalShortcuts(newKeybinds, mainWindow, sendToRenderer, geminiSessionRef);
        }
    });

    ipcMain.handle('toggle-window-visibility', async event => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.showInactive();
            }
            return { success: true };
        } catch (error) {
            console.error('Error toggling window visibility:', error);
            return { success: false, error: error.message };
        }
    });

    function animateWindowResize(mainWindow, targetWidth, targetHeight, layoutMode) {
        return new Promise(resolve => {
            // Check if window is destroyed before starting animation
            if (mainWindow.isDestroyed()) {
                console.log('Cannot animate resize: window has been destroyed');
                resolve();
                return;
            }

            // Clear any existing animation
            if (resizeAnimation) {
                clearInterval(resizeAnimation);
                resizeAnimation = null;
            }

            const [startWidth, startHeight] = mainWindow.getSize();

            // If already at target size, no need to animate
            if (startWidth === targetWidth && startHeight === targetHeight) {
                console.log(`Window already at target size for ${layoutMode} mode`);
                resolve();
                return;
            }

            const widthDiff = targetWidth - startWidth;
            const heightDiff = targetHeight - startHeight;

            console.log(`Starting animated resize from ${startWidth}x${startHeight} to ${targetWidth}x${targetHeight}`);

            windowResizing = true;
            mainWindow.setResizable(true);

            // Calculate position
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: screenWidth } = primaryDisplay.workAreaSize;
            const targetX = Math.floor((screenWidth - targetWidth) / 2);

            // On macOS, do instant resize and rely on CSS for smooth content animation
            if (isMac) {
                console.log('Using instant resize on macOS with CSS content animation');
                
                // Instant resize - macOS compositor handles this smoothly
                mainWindow.setBounds({
                    x: targetX,
                    y: 0,
                    width: targetWidth,
                    height: targetHeight
                });
                
                mainWindow.setResizable(false);
                windowResizing = false;
                console.log(`Instant resize complete: ${targetWidth}x${targetHeight}`);
                resolve();
                return;
            }

            // Windows: use custom JavaScript animation
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / RESIZE_ANIMATION_DURATION, 1);

                // Use ease-out cubic for smooth glide feel
                const easedProgress = 1 - Math.pow(1 - progress, 3);

                const currentWidth = Math.round(startWidth + widthDiff * easedProgress);
                const currentHeight = Math.round(startHeight + heightDiff * easedProgress);

                if (mainWindow && !mainWindow.isDestroyed()) {
                    const x = Math.floor((screenWidth - currentWidth) / 2);
                    
                    mainWindow.setBounds({ 
                        x, 
                        y: 0, 
                        width: currentWidth, 
                        height: currentHeight 
                    }, false);
                }

                if (progress < 1 && mainWindow && !mainWindow.isDestroyed()) {
                    resizeAnimation = setTimeout(animate, 16); // 60fps
                } else {
                    resizeAnimation = null;
                    windowResizing = false;

                    if (!mainWindow.isDestroyed()) {
                        mainWindow.setResizable(false);
                        mainWindow.setBounds({ 
                            x: targetX, 
                            y: 0, 
                            width: targetWidth, 
                            height: targetHeight 
                        }, false);
                    }

                    console.log(`Animation complete: ${targetWidth}x${targetHeight}`);
                    resolve();
                }
            };

            animate();
        });
    }

    ipcMain.handle('update-sizes', async event => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            // Get current view and layout mode from renderer
            let viewName, layoutMode;
            try {
                viewName = await event.sender.executeJavaScript('cheddar.getCurrentView()');
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
            } catch (error) {
                console.warn('Failed to get view/layout from renderer, using defaults:', error);
                viewName = 'main';
                layoutMode = 'normal';
            }

            console.log('Size update requested for view:', viewName, 'layout:', layoutMode);

            // Skip resize for assistant view - keep header-only size stable
            if (viewName === 'assistant') {
                console.log('Skipping resize for assistant view - keeping current size');
                return { success: true };
            }

            let targetWidth, targetHeight;

            // Determine base size from layout mode
            const baseWidth = layoutMode === 'compact' ? 700 : 900;
            const baseHeight = layoutMode === 'compact' ? 500 : 600;

            // Adjust height based on view
            switch (viewName) {
                case 'customize':
                case 'settings':
                    targetWidth = baseWidth;
                    targetHeight = layoutMode === 'compact' ? 700 : 800;
                    break;
                case 'help':
                    targetWidth = baseWidth;
                    targetHeight = layoutMode === 'compact' ? 650 : 750;
                    break;
                case 'history':
                    targetWidth = baseWidth;
                    targetHeight = layoutMode === 'compact' ? 650 : 750;
                    break;
                case 'advanced':
                    targetWidth = baseWidth;
                    targetHeight = layoutMode === 'compact' ? 600 : 700;
                    break;
                case 'main':
                case 'onboarding':
                default:
                    targetWidth = baseWidth;
                    targetHeight = baseHeight;
                    break;
                case 'assistant':
                    // Header-only mode - minimal height
                    targetWidth = layoutMode === 'compact' ? 500 : 600;
                    targetHeight = layoutMode === 'compact' ? 60 : 70;
                    break;
            }

            const [currentWidth, currentHeight] = mainWindow.getSize();
            console.log('Current window size:', currentWidth, 'x', currentHeight);

            // If currently resizing, the animation will start from current position
            if (windowResizing) {
                console.log('Interrupting current resize animation');
            }

            await animateWindowResize(mainWindow, targetWidth, targetHeight, `${viewName} view (${layoutMode})`);

            return { success: true };
        } catch (error) {
            console.error('Error updating sizes:', error);
            return { success: false, error: error.message };
        }
    });

    // Animated resize with smooth glide effect
    ipcMain.handle('animate-resize', async (event) => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            let layoutMode, viewName;
            try {
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
                viewName = await event.sender.executeJavaScript('cheddar.getCurrentView()');
            } catch (error) {
                layoutMode = 'compact';
                viewName = 'customize';
            }

            const baseWidth = layoutMode === 'compact' ? 700 : 900;
            const baseHeight = layoutMode === 'compact' ? 650 : 800;
            
            console.log('Animate resize to:', baseWidth, 'x', baseHeight);
            await animateWindowResize(mainWindow, baseWidth, baseHeight, 'expand');
            
            return { success: true };
        } catch (error) {
            console.error('Error animate resizing:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('animate-resize-to-header', async (event) => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            let layoutMode;
            try {
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
            } catch (error) {
                layoutMode = 'compact';
            }

            const targetWidth = layoutMode === 'compact' ? 500 : 600;
            const targetHeight = layoutMode === 'compact' ? 60 : 70;
            
            console.log('Animate resize to header:', targetWidth, 'x', targetHeight);
            await animateWindowResize(mainWindow, targetWidth, targetHeight, 'collapse');
            
            return { success: true };
        } catch (error) {
            console.error('Error animate resizing to header:', error);
            return { success: false, error: error.message };
        }
    });

    // Instant resize for smooth CSS-only transitions
    ipcMain.handle('instant-resize', async (event) => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            let layoutMode, viewName;
            try {
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
                viewName = await event.sender.executeJavaScript('cheddar.getCurrentView()');
            } catch (error) {
                layoutMode = 'compact';
                viewName = 'customize';
            }

            const baseWidth = layoutMode === 'compact' ? 700 : 900;
            const baseHeight = layoutMode === 'compact' ? 650 : 800;
            
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: screenWidth } = primaryDisplay.workAreaSize;
            const targetX = Math.floor((screenWidth - baseWidth) / 2);

            mainWindow.setResizable(true);
            mainWindow.setBounds({ x: targetX, y: 0, width: baseWidth, height: baseHeight }, false);
            mainWindow.setResizable(false);
            
            console.log('Instant resize to:', baseWidth, 'x', baseHeight);
            return { success: true };
        } catch (error) {
            console.error('Error instant resizing:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('instant-resize-to-header', async (event) => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            let layoutMode;
            try {
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
            } catch (error) {
                layoutMode = 'compact';
            }

            const targetWidth = layoutMode === 'compact' ? 500 : 600;
            const targetHeight = layoutMode === 'compact' ? 60 : 70;
            
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: screenWidth } = primaryDisplay.workAreaSize;
            const targetX = Math.floor((screenWidth - targetWidth) / 2);

            mainWindow.setResizable(true);
            mainWindow.setBounds({ x: targetX, y: 0, width: targetWidth, height: targetHeight }, false);
            mainWindow.setResizable(false);
            
            console.log('Instant resize to header:', targetWidth, 'x', targetHeight);
            return { success: true };
        } catch (error) {
            console.error('Error instant resizing to header:', error);
            return { success: false, error: error.message };
        }
    });

    // Resize back to header-only mode (used when closing settings/help views)
    ipcMain.handle('resize-to-header', async (event) => {
        try {
            if (mainWindow.isDestroyed()) {
                return { success: false, error: 'Window has been destroyed' };
            }

            // Get layout mode from renderer
            let layoutMode;
            try {
                layoutMode = await event.sender.executeJavaScript('cheddar.getLayoutMode()');
            } catch (error) {
                layoutMode = 'compact';
            }

            const targetWidth = layoutMode === 'compact' ? 500 : 600;
            const targetHeight = layoutMode === 'compact' ? 60 : 70;

            console.log('Resizing to header-only mode:', targetWidth, 'x', targetHeight);
            await animateWindowResize(mainWindow, targetWidth, targetHeight, 'header-only');

            return { success: true };
        } catch (error) {
            console.error('Error resizing to header:', error);
            return { success: false, error: error.message };
        }
    });

    // Open World window
    ipcMain.handle('open-world-window', async (event) => {
        try {
            // If world window already exists and not destroyed, focus it
            if (worldWindow && !worldWindow.isDestroyed()) {
                worldWindow.focus();
                return { success: true };
            }

            // Get main window position to place world window to the LEFT of it
            const mainBounds = mainWindow.getBounds();
            
            // Start small, will expand with content
            const worldWidth = 380;
            const worldHeight = 280;
            
            worldWindow = new BrowserWindow({
                width: worldWidth,
                height: worldHeight,
                minWidth: 320,
                minHeight: 200,
                maxHeight: 600, // Max height before scrolling
                x: mainBounds.x - worldWidth - 10,  // Position to the LEFT of main window
                y: mainBounds.y,
                frame: false,
                transparent: true,
                hasShadow: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                backgroundColor: '#00000000',
            });

            worldWindow.setResizable(true);
            worldWindow.setContentProtection(true);
            worldWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

            if (process.platform === 'win32') {
                worldWindow.setAlwaysOnTop(true, 'screen-saver', 1);
            }

            worldWindow.loadFile(path.join(__dirname, '../world.html'));

            worldWindow.on('closed', () => {
                worldWindow = null;
            });

            return { success: true };
        } catch (error) {
            console.error('Error opening world window:', error);
            return { success: false, error: error.message };
        }
    });

    // Close World window
    ipcMain.on('close-world-window', () => {
        if (worldWindow && !worldWindow.isDestroyed()) {
            worldWindow.close();
            worldWindow = null;
        }
    });

    // Open Listen window
    ipcMain.handle('open-listen-window', async (event) => {
        try {
            // Close other feature windows first (only one active at a time)
            if (captureWindow && !captureWindow.isDestroyed()) {
                captureWindow.close();
                captureWindow = null;
            }
            
            // If listen window already exists and not destroyed, focus it
            if (listenWindow && !listenWindow.isDestroyed()) {
                listenWindow.focus();
                return { success: true };
            }

            const mainBounds = mainWindow.getBounds();
            const listenWidth = 380;
            const listenHeight = 280; // Start small, will expand with content
            
            listenWindow = new BrowserWindow({
                width: listenWidth,
                height: listenHeight,
                minWidth: 320,
                minHeight: 200,
                maxHeight: 600, // Max height before scrolling
                x: mainBounds.x - listenWidth - 10,
                y: mainBounds.y,
                frame: false,
                transparent: true,
                hasShadow: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                backgroundColor: '#00000000',
            });

            listenWindow.setResizable(true);
            listenWindow.setContentProtection(true);
            listenWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

            if (process.platform === 'win32') {
                listenWindow.setAlwaysOnTop(true, 'screen-saver', 1);
            }

            listenWindow.loadFile(path.join(__dirname, '../listen.html'));

            listenWindow.on('closed', () => {
                listenWindow = null;
            });

            return { success: true };
        } catch (error) {
            console.error('Error opening listen window:', error);
            return { success: false, error: error.message };
        }
    });

    // Close Listen window
    ipcMain.on('close-listen-window', () => {
        if (listenWindow && !listenWindow.isDestroyed()) {
            listenWindow.close();
            listenWindow = null;
        }
    });

    // Open Capture window
    ipcMain.handle('open-capture-window', async (event) => {
        try {
            // Close other feature windows first (only one active at a time)
            if (listenWindow && !listenWindow.isDestroyed()) {
                listenWindow.close();
                listenWindow = null;
            }
            
            // If capture window already exists and not destroyed, focus it
            if (captureWindow && !captureWindow.isDestroyed()) {
                captureWindow.focus();
                return { success: true };
            }

            const mainBounds = mainWindow.getBounds();
            const captureWidth = 400;
            const captureHeight = 520;
            
            captureWindow = new BrowserWindow({
                width: captureWidth,
                height: captureHeight,
                minWidth: 340,
                minHeight: 420,
                x: mainBounds.x + mainBounds.width + 10,  // Position to the RIGHT of main window
                y: mainBounds.y,
                frame: false,
                transparent: true,
                hasShadow: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
                backgroundColor: '#00000000',
            });

            captureWindow.setResizable(true);
            captureWindow.setContentProtection(true);
            captureWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

            if (process.platform === 'win32') {
                captureWindow.setAlwaysOnTop(true, 'screen-saver', 1);
            }

            captureWindow.loadFile(path.join(__dirname, '../capture.html'));

            captureWindow.on('closed', () => {
                captureWindow = null;
            });

            return { success: true };
        } catch (error) {
            console.error('Error opening capture window:', error);
            return { success: false, error: error.message };
        }
    });

    // Close Capture window
    ipcMain.on('close-capture-window', () => {
        if (captureWindow && !captureWindow.isDestroyed()) {
            captureWindow.close();
            captureWindow = null;
        }
    });

    // Forward response updates to listen window
    ipcMain.on('listen-response-update', (event, response) => {
        if (listenWindow && !listenWindow.isDestroyed()) {
            listenWindow.webContents.send('listen-response-update', response);
        }
    });

    // Forward response updates to capture window
    ipcMain.on('capture-response-update', (event, response) => {
        console.log('[IPC] capture-response-update received, captureWindow exists:', !!captureWindow);
        if (captureWindow && !captureWindow.isDestroyed()) {
            console.log('[IPC] Forwarding response to capture window:', response?.substring(0, 50));
            captureWindow.webContents.send('capture-response-update', response);
        }
    });

    // Resize listen window based on content
    ipcMain.on('resize-listen-window', (event, height) => {
        if (listenWindow && !listenWindow.isDestroyed()) {
            const currentBounds = listenWindow.getBounds();
            const maxHeight = 600;
            const minHeight = 200;
            const newHeight = Math.min(Math.max(height, minHeight), maxHeight);
            listenWindow.setBounds({
                x: currentBounds.x,
                y: currentBounds.y,
                width: currentBounds.width,
                height: newHeight
            });
        }
    });

    // Resize world window based on content
    ipcMain.on('resize-world-window', (event, height) => {
        if (worldWindow && !worldWindow.isDestroyed()) {
            const currentBounds = worldWindow.getBounds();
            const maxHeight = 600;
            const minHeight = 200;
            const newHeight = Math.min(Math.max(height, minHeight), maxHeight);
            worldWindow.setBounds({
                x: currentBounds.x,
                y: currentBounds.y,
                width: currentBounds.width,
                height: newHeight
            });
        }
    });

    // Resize capture window based on content
    ipcMain.on('resize-capture-window', (event, height) => {
        if (captureWindow && !captureWindow.isDestroyed()) {
            const currentBounds = captureWindow.getBounds();
            const maxHeight = 520;
            const minHeight = 200;
            const newHeight = Math.min(Math.max(height, minHeight), maxHeight);
            captureWindow.setBounds({
                x: currentBounds.x,
                y: currentBounds.y,
                width: currentBounds.width,
                height: newHeight
            });
        }
    });

    // Send response to listen window
    ipcMain.on('send-listen-response', (event, response) => {
        if (listenWindow && !listenWindow.isDestroyed()) {
            listenWindow.webContents.send('listen-response', response);
        }
    });

    // Update listen status
    ipcMain.on('update-listen-status', (event, isListening) => {
        if (listenWindow && !listenWindow.isDestroyed()) {
            listenWindow.webContents.send('listen-status', isListening);
        }
    });

    // Send response to capture window
    ipcMain.on('send-capture-response', (event, response) => {
        if (captureWindow && !captureWindow.isDestroyed()) {
            captureWindow.webContents.send('capture-response', response);
        }
    });

    // Update capture status
    ipcMain.on('update-capture-status', (event, isCapturing) => {
        if (captureWindow && !captureWindow.isDestroyed()) {
            captureWindow.webContents.send('capture-status', isCapturing);
        }
    });

    // Handle message from capture window
    ipcMain.on('capture-send-message', (event, message) => {
        // Forward to main window for processing
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('capture-message-received', message);
        }
    });

    // Perplexity search handler - routes through backend with auth
    ipcMain.handle('perplexity-search', async (event, query) => {
        try {
            // Get auth token from main window
            let accessToken = null;
            if (mainWindow && !mainWindow.isDestroyed()) {
                accessToken = await mainWindow.webContents.executeJavaScript(
                    `localStorage.getItem('accessToken')`
                );
            }
            
            if (!accessToken) {
                throw new Error('Not authenticated. Please log in first.');
            }
            
            // Call backend Perplexity API - switch between local and production
            // const API_BASE_URL = 'http://localhost:3000/api';
            const API_BASE_URL = 'https://backend.elkai.cloud/api';
            const response = await fetch(`${API_BASE_URL}/ai/perplexity/search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    maxResults: 10,
                    includeImages: false,
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Search failed');
            }
            
            const answer = data.data?.answer || 'No response received';
            const citations = data.data?.citations || [];
            
            console.log('[window.js] Perplexity response citations:', citations);
            
            // Stream the response character by character to create flowing effect
            if (worldWindow && !worldWindow.isDestroyed()) {
                let displayedText = '';
                const words = answer.split(' ');
                
                for (let i = 0; i < words.length; i++) {
                    displayedText += (i > 0 ? ' ' : '') + words[i];
                    // Send content AND citations together
                    worldWindow.webContents.send('perplexity-chunk', { content: displayedText, citations });
                    // Delay between words for flowing effect
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            
            return answer;
        } catch (error) {
            console.error('Perplexity search error:', error);
            throw error;
        }
    });
}

function getWorldWindow() {
    return worldWindow;
}

function getListenWindow() {
    return listenWindow;
}

function getCaptureWindow() {
    return captureWindow;
}

module.exports = {
    ensureDataDirectories,
    createWindow,
    getDefaultKeybinds,
    updateGlobalShortcuts,
    setupWindowIpcHandlers,
    getWorldWindow,
    getListenWindow,
    getCaptureWindow,
};
