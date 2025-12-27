const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('fs');
const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        extraResource: ['./src/assets/SystemAudioDump'],
        name: 'Cheating Daddy',
        icon: 'src/assets/logo',
        afterCopy: [
            (buildPath, electronVersion, platform, arch, callback) => {
                // Set execute permissions for SystemAudioDump on macOS and Linux
                if (platform === 'darwin' || platform === 'linux') {
                    const binaryPath = path.join(buildPath, 'src', 'assets', 'SystemAudioDump');
                    try {
                        if (fs.existsSync(binaryPath)) {
                            fs.chmodSync(binaryPath, 0o755);
                            console.log('Set execute permissions for SystemAudioDump');
                            
                            // Ad-hoc sign the binary on macOS
                            if (platform === 'darwin') {
                                const { execSync } = require('child_process');
                                try {
                                    execSync(`codesign --force --deep --sign - "${binaryPath}"`);
                                    console.log('Ad-hoc signed SystemAudioDump');
                                } catch (err) {
                                    console.warn('Failed to sign SystemAudioDump:', err.message);
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Failed to set execute permissions:', err);
                    }
                }
                callback();
            }
        ],
        // use `security find-identity -v -p codesigning` to find your identity
        // for macos signing
        osxSign: {
            identity: '-', // Ad-hoc signing
            entitlements: 'entitlements.plist',
            'entitlements-inherit': 'entitlements.plist',
            'gatekeeper-assess': false,
            hardenedRuntime: true,
        },
        // notarize if off cuz i ran this for 6 hours and it still didnt finish
        // osxNotarize: {
        //    appleId: 'your apple id',
        //    appleIdPassword: 'app specific password',
        //    teamId: 'your team id',
        // },
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'cheating-daddy',
                productName: 'Cheating Daddy',
                shortcutName: 'Cheating Daddy',
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
        },
        {
            name: '@reforged/maker-appimage',
            platforms: ['linux'],
            config: {
                options: {
                    name: 'Cheating Daddy',
                    productName: 'Cheating Daddy',
                    genericName: 'AI Assistant',
                    description: 'AI assistant for interviews and learning',
                    categories: ['Development', 'Education'],
                    icon: 'src/assets/logo.png'
                }
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
