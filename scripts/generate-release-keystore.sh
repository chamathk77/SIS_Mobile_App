#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="$ROOT/android/app/eschola-release.keystore"
PROPS="$ROOT/android/keystore.properties"

if [ -f "$KEYSTORE" ]; then
  echo "Keystore already exists: $KEYSTORE"
  exit 1
fi

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found. Install JDK 17 first (see docs/ANDROID_BUILD.md)."
  exit 1
fi

read -rsp "Keystore password (min 6 chars): " STORE_PASS
echo
read -rsp "Confirm password: " STORE_PASS2
echo
if [ "$STORE_PASS" != "$STORE_PASS2" ]; then
  echo "Passwords do not match."
  exit 1
fi

read -rsp "Key password (Enter = same as keystore): " KEY_PASS
echo
if [ -z "$KEY_PASS" ]; then
  KEY_PASS="$STORE_PASS"
fi

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE" \
  -alias eschola-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Eschola SIS, OU=Mobile, O=Eschola, L=Colombo, ST=Western, C=LK"

cat > "$PROPS" <<EOF
storeFile=app/eschola-release.keystore
storePassword=$STORE_PASS
keyAlias=eschola-release
keyPassword=$KEY_PASS
EOF

echo ""
echo "Created:"
echo "  $KEYSTORE"
echo "  $PROPS"
echo ""
echo "Build release APK: npm run build:apk"
