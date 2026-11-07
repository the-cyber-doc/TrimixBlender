#!/bin/sh
# Checks an Android build of the app: no permission at all, and no tracker, analytics, ads or
# Google/Firebase service SDK in its code. Fails (exit 1) and lists what it found otherwise.
#   tools/check-android-apk.sh android/app/build/outputs/apk/release/app-release-unsigned.apk
# Needs the Android SDK's build tools ($ANDROID_HOME, or aapt2 and dexdump on the PATH).
# The tracker list: the code signatures of the most common SDKs, after Exodus Privacy
# (https://reports.exodus-privacy.eu.org/en/trackers/); Exodus itself can scan a published APK.
set -eu

apk=${1:?usage: $0 <file.apk>}
[ -f "$apk" ] || { echo "$apk: no such file" >&2; exit 2; }

tool() {
	if command -v "$1" >/dev/null 2>&1; then
		command -v "$1"
	else
		found=$(ls -d "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"/build-tools/*/"$1" 2>/dev/null | sort -V | tail -n 1)
		[ -n "$found" ] || { echo "$1 not found: set ANDROID_HOME" >&2; exit 2; }
		echo "$found"
	fi
}
aapt2=$(tool aapt2)
dexdump=$(tool dexdump)
status=0

# Permissions: the requested ones (uses-permission) and the declared ones (permission).
permissions=$("$aapt2" dump permissions "$apk" | grep -v '^package:' || true)
if [ -n "$permissions" ]; then
	echo "FAIL: the app has permissions:"
	echo "$permissions" | sed 's/^/  /'
	status=1
else
	echo "OK: no permission"
fi

# Trackers: class names (Lcom/google/firebase/…) in every dex file.
TRACKERS='com/google/firebase|com/google/android/gms|com/google/android/datatransport|com/google/ads|com/google/android/play/core|com/crashlytics|io/fabric|com/facebook|com/appsflyer|com/adjust/sdk|com/amplitude|com/mixpanel|com/segment|com/onesignal|com/flurry|com/bugsnag|io/sentry|com/microsoft/appcenter|com/instabug|com/newrelic|com/heapanalytics|com/braze|com/appboy|com/clevertap|com/batch/android|com/huawei/hms|com/yandex/metrica|io/branch|com/kochava|com/localytics|com/moengage|com/airbridge|com/singular|com/tenjin|com/unity3d/ads|com/applovin|com/ironsource|com/startapp|com/chartboost|com/vungle|com/inmobi|com/mopub|com/smaato|com/bytedance|com/datadog|com/dynatrace|com/posthog|com/matomo|org/matomo|com/countly|ly/count'
found=$("$dexdump" "$apk" 2>/dev/null | sed -n "s/^ *Class descriptor *: *'L\([^;]*\);'/\1/p" |
	grep -oE "^($TRACKERS)/" | sed 's#/$##; s#/#.#g' | sort -u || true)
if [ -n "$found" ]; then
	echo "FAIL: tracker or service SDK code in the app:"
	echo "$found" | sed 's/^/  /'
	status=1
else
	echo "OK: no tracker code"
fi

exit $status
