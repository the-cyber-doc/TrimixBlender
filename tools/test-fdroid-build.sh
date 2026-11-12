#!/bin/bash
# Builds the Android app as F-Droid will, with F-Droid's own tools, from the recipe to submit to
# fdroiddata (fdroid/com.dolphinslabs.trimixblender.yml). In F-Droid's build server image, the
# steps of fdroiddata's "fdroid build" CI job (gitlab.com/fdroid/fdroiddata, .gitlab-ci.yml):
#   1. fdroid lint and fdroid rewritemeta on the recipe as it is (what a merge request runs);
#   2. fdroid checkupdates: F-Droid's update checker finds this version in the tag of the commit;
#   3. fdroid build --on-server: the recipe's commands (sudo, then the source scanner, then the
#      build) on a clean clone, as the "vagrant" user, the APK checked against the recipe;
#   4. tools/check-android-apk.sh on the APK: no permission, no tracker.
# The recipe is built for the current commit, with the version of android/app/build.gradle; with
# uncommitted changes, for a commit of the working tree as it is (files not ignored by git), made
# in a scratch clone only (your branch, index and stash are not changed). For 2, a tag v<version>
# is put on that commit in the scratch clone.
#   tools/test-fdroid-build.sh [output folder]   # default fdroid-build/: the APK (unsigned) and logs
# Needs Docker (it calls "sudo docker" if your user cannot reach Docker), the network (Node.js,
# npm, Gradle), about 15 GB (the image) and 10 to 20 minutes.
set -euo pipefail

IMAGE=registry.gitlab.com/fdroid/fdroidserver:buildserver-trixie
APPID=com.dolphinslabs.trimixblender

if [ "${1:-}" = --inside ]; then
	# In the container, as root. /work: this script, the recipe, src.git (a clone of the repository).
	set -x
	source /etc/profile.d/bsenv.sh # ANDROID_HOME, home_vagrant, fdroidserver
	export PATH="$fdroidserver:$PATH" PYTHONPATH="$fdroidserver:$fdroidserver/examples" PYTHONUNBUFFERED=true
	cleanup() { chown -R "$HOST_UID:$HOST_GID" /work; }
	trap cleanup EXIT

	# As in fdroiddata's job: the buildserver's packages, fdroidserver from git (the commit it
	# pins, then master's latest, fast-forward only, every object checked), gradlew-fdroid up to date.
	apt-get update -q
	apt-get install -qy sudo openjdk-21-jdk-headless
	update-alternatives --set java /usr/lib/jvm/java-21-openjdk-amd64/bin/java
	sdkmanager "platform-tools" "build-tools;31.0.0" >/dev/null
	rm -rf "$fdroidserver"
	git clone -q --shallow-since=2026-07-13 https://gitlab.com/fdroid/fdroidserver.git "$fdroidserver"
	git -C "$fdroidserver" config transfer.fsckObjects true
	git -C "$fdroidserver" checkout -q -B master a35fdfddd9c66823987a410566a6101186e39c84
	git -C "$fdroidserver" pull -q origin master --ff-only
	git -C "$home_vagrant/gradlew-fdroid" pull -q
	fdroid="sudo --preserve-env --user vagrant env PATH=$PATH PYTHONPATH=$PYTHONPATH HOME=$home_vagrant fdroid"

	# 1. Lint and format, in fdroiddata (its config: categories, anti-features).
	data=/work/fdroiddata
	git clone -q --depth 1 --filter=blob:none --sparse https://gitlab.com/fdroid/fdroiddata.git "$data"
	git -C "$data" sparse-checkout set --no-cone /config.yml /config
	chmod 0600 "$data/config.yml"
	mkdir "$data/metadata"
	cp "/work/$APPID.yml" "$data/metadata/"
	chown -R vagrant /work
	(cd "$data" && export serverwebroot=/tmp && $fdroid lint "$APPID" && $fdroid rewritemeta "$APPID")
	diff -u "/work/$APPID.yml" "$data/metadata/$APPID.yml" ||
		{ echo "fdroid rewritemeta would format the recipe as above: change it so" >&2; exit 1; }

	# The recipe for HEAD: the scratch clone instead of GitHub, a single build: this version and commit.
	sudo -u vagrant git -C /work/src.git tag -f "v$VERSION" "$COMMIT"
	python3 - "$data/metadata/$APPID.yml" <<-'PY'
		import os, sys
		from ruamel.yaml import YAML
		yaml = YAML()
		path = sys.argv[1]
		with open(path) as f:
		    app = yaml.load(f)
		app['Repo'] = '/work/src.git'
		build = app['Builds'][-1]
		build['versionName'], build['versionCode'], build['commit'] = os.environ['VERSION'], int(os.environ['VERCODE']), os.environ['COMMIT']
		app['Builds'] = [build]
		app['CurrentVersion'], app['CurrentVersionCode'] = '0', 0
		with open(path, 'w') as f:
		    yaml.dump(app, f)
	PY
	chown -R vagrant /work

	# 2. The update checker finds this version in the tag (android/app/build.gradle).
	(cd "$data" && $fdroid checkupdates --allow-dirty "$APPID")
	grep -x "CurrentVersion: '\?$VERSION'\?" "$data/metadata/$APPID.yml"
	grep -x "CurrentVersionCode: $VERCODE" "$data/metadata/$APPID.yml"

	# 3. The build, from $home_vagrant as on the build server (which also removes sudo after the
	# recipe's "sudo" commands).
	mkdir -p "$home_vagrant/metadata" /work/out/tmp /work/out/logs
	cp "$data/metadata/$APPID.yml" "$home_vagrant/metadata/"
	ln -s /work/out/tmp "$home_vagrant/tmp"
	ln -s /work/out/logs "$home_vagrant/logs"
	chown -R vagrant "$home_vagrant" /work
	(cd "$home_vagrant" && unset CI && $fdroid build --verbose --test --refresh-scanner --on-server --no-tarball "$APPID:$VERCODE")

	# 4. No permission, no tracker.
	apk="/work/out/tmp/${APPID}_$VERCODE.apk"
	ANDROID_HOME=/opt/android-sdk bash /work/check-android-apk.sh "$apk"
	cp "$apk" /work/out/
	exit 0
fi

cd "$(dirname "$0")/.."
out=${1:-fdroid-build}
docker=(docker)
docker info >/dev/null 2>&1 || docker=(sudo docker)

gradle=android/app/build.gradle
version=$(sed -nE 's/^ +versionName "([^"]*)"$/\1/p' "$gradle")
vercode=$(sed -nE 's/^ +versionCode ([0-9]+)$/\1/p' "$gradle")
[ -n "$version" ] && [ -n "$vercode" ] || { echo "$gradle: no versionName / versionCode" >&2; exit 1; }
work=$(mktemp -d)
rm -rf "$out"
mkdir -p "$out"
# Whatever happens, the logs (and the APK) are kept in $out.
trap 'cp -r "$work"/out/logs "$work"/out/*.apk "$out"/ 2>/dev/null; rm -rf "$work"' EXIT
git clone -q --bare --no-local . "$work/src.git"
commit=$(git rev-parse HEAD)
if [ -n "$(git status --porcelain)" ]; then
	# The working tree as a commit on HEAD, through a scratch index; pushed to the scratch clone only (below).
	cp "$(git rev-parse --git-path index)" "$work/index"
	GIT_INDEX_FILE="$work/index" git add -A
	tree=$(GIT_INDEX_FILE="$work/index" git write-tree)
	commit=$(GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=test@localhost GIT_COMMITTER_NAME=test \
		GIT_COMMITTER_EMAIL=test@localhost git commit-tree -p HEAD -m "Working tree" "$tree")
	echo "Uncommitted changes: building the working tree as it is (scratch commit $commit)."
fi
# The scratch clone's default branch: the commit built. F-Droid's tools start from origin/HEAD,
# which a clone of a detached HEAD without any branch (CI's checkout of a tag) does not have.
git push -q "$work/src.git" "$commit:refs/heads/fdroid-test"
git -C "$work/src.git" symbolic-ref HEAD refs/heads/fdroid-test
cp "$0" "$work/test-fdroid-build.sh"
cp "fdroid/$APPID.yml" tools/check-android-apk.sh "$work/"

echo "F-Droid build of $APPID $version ($vercode), commit $commit"
"${docker[@]}" run --rm -v "$work:/work" -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
	-e VERSION="$version" -e VERCODE="$vercode" -e COMMIT="$commit" \
	"$IMAGE" bash /work/test-fdroid-build.sh --inside

echo "OK: $out/${APPID}_$vercode.apk (unsigned, as F-Droid builds it before signing)"
