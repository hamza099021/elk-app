# GitHub Actions - Mac DMG Build Guide

## ✅ Setup Complete!

Your GitHub Actions workflow is now configured to automatically build Mac DMG files.

## 📋 Next Steps

### 1. Create a GitHub Repository

```bash
# On GitHub.com, create a new repository
# Then connect it to your local repo:

cd "f:\downloads\Elk AI\Elk AI"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Push Your Code

```bash
git push origin main
```

## 🚀 How It Works

The workflow automatically triggers when:
- ✅ You push to `main` or `master` branch
- ✅ You create a pull request
- ✅ You manually trigger it from GitHub Actions tab
- ✅ You create a version tag (e.g., `v1.0.0`)

## 📥 Download Your DMG

After the workflow completes (~10 minutes):

1. Go to your GitHub repo → **Actions** tab
2. Click on the latest workflow run
3. Scroll to **Artifacts** section
4. Download `cheating-daddy-mac-universal`

## 🏷️ Creating a Release

To automatically attach DMG to a GitHub release:

```bash
# Tag a version
git tag v0.4.0
git push origin v0.4.0
```

The workflow will:
1. Build the DMG
2. Create a GitHub Release
3. Automatically attach the DMG file

## 📊 Build Status

You can monitor builds at:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions
```

## 🔧 Configuration

The workflow is located at:
```
.github/workflows/build-mac.yml
```

### Build Settings:
- **Platform**: macOS (latest)
- **Architecture**: Universal (Intel + Apple Silicon)
- **Output**: `cheating-daddy/out/make/*.dmg`

## 💰 Free Tier Usage

- **Free builds**: ~20 per month
- **Build time**: ~10 minutes each
- **Cost per build**: ~100 minutes from quota

## 🛠️ Troubleshooting

### Build Fails?
Check the Actions log for errors. Common issues:
- Missing dependencies in package.json
- Icon file paths incorrect
- Entitlements configuration

### Need More Builds?
- Make repo public for unlimited builds
- Or upgrade GitHub plan for more minutes

## 📝 Making Changes

To modify the build:
1. Edit `.github/workflows/build-mac.yml`
2. Commit and push
3. Workflow runs automatically

---

**Ready to publish!** Just push your code to GitHub and your first DMG will start building automatically. 🎉
