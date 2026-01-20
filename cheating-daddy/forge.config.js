const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require('fs');
const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        // Temporarily disabled to test if SystemAudioDump is causing notarization hang
        // extraResource: ['./src/assets/SystemAudioDump'],
        name: 'Cheating Daddy',
        icon: 'src/assets/logo',
        appBundleId: 'com.cheatingdaddy.app', // Unique bundle ID for macOS permissions
        afterCopy: [
            (buildPath, electronVersion, platform, arch, callback) => {
                console.log('⚠️ SystemAudioDump processing DISABLED for testing - skipping all binary signing');
                callback();
            }
        ],
        // use `security find-identity -v -p codesigning` to find your identity
        // for macos signing
        osxSign: {
            identity: 'Developer ID Application: Arnav Ramakrishnan (9225CLJSN7)',
            entitlements: 'entitlements.plist',
            'entitlements-inherit': 'entitlements.plist',
            'gatekeeper-assess': false,
            hardenedRuntime: true,
        },
        // Notarization enabled - takes 30-60 min but removes "unidentified developer" warning
        osxNotarize: {
            appleId: process.env.APPLE_ID || 'devarnavramakrishnan@gmail.com',
            appleIdPassword: process.env.APPLE_ID_PASSWORD || '',
            teamId: process.env.APPLE_TEAM_ID || '9225CLJSN7',
        },
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
