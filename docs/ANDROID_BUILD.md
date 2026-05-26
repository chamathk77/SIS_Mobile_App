# Android release APK (Eschola SIS)

Build a **release** APK (optimized, not debug). Gradle needs **JDK 17** and **Android SDK** — see troubleshooting if `java` fails.

> Do not paste lines starting with `#` into Terminal.

---

## Quick: release APK (local)

### 1. Install JDK 17

Download and install the **`.pkg`** (no Homebrew needed):

- Apple Silicon: https://adoptium.net/temurin/releases/?version=17&os=mac&arch=aarch64&package=jdk  
- Intel Mac: use **arch=x64** on the same site.

Verify:

```bash
java -version
```

### 2. Install Android Studio

https://developer.android.com/studio — install SDK Platform, Build-Tools, and Platform-Tools.

### 3. Create a release keystore (one time)

```bash
cd /Users/staff/Documents/GitHub/SIS_Mobile_App
npm run keystore:generate
```

Follow the prompts. This creates:

- `android/app/eschola-release.keystore`
- `android/keystore.properties` (gitignored)

**Keep the password safe.** You need the same keystore for all future app updates.

> If you skip this step, Gradle still builds a release APK signed with the debug key (installable for testing only).

### 4. Build the release APK

```bash
npm run build:apk
```

**Output file:**

`android/app/build/outputs/apk/release/app-release.apk`

Copy this file to phones or share it for installation (enable “Install unknown apps” on Android).

### 5. Install on a device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Cloud release APK (no local Java)

```bash
npm install -g eas-cli
eas login
cd /Users/staff/Documents/GitHub/SIS_Mobile_App
npm run build:apk:eas
```

Download the `.apk` from https://expo.dev when finished. EAS manages signing in the cloud.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `keystore:generate` | Create release keystore + `keystore.properties` |
| **`build:apk`** | **Release APK** (`assembleRelease`) |
| `build:apk:debug` | Debug APK only (testing) |
| `build:apk:eas` | Cloud release APK |
| `prebuild:android` | Regenerate `android/` folder |

---

## After `npm run prebuild:android`

Prebuild may reset `android/app/build.gradle`. If release signing stops working, re-apply signing from this repo or run `keystore:generate` again and rebuild.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Unable to locate a Java Runtime` | Install Temurin JDK 17 `.pkg`, then `java -version`. |
| `command not found: brew` | Use the `.pkg` installer; Homebrew is optional. |
| `keystore.properties` missing | Run `npm run keystore:generate`. |
| Build fails on signing | Check passwords in `android/keystore.properties`. |
