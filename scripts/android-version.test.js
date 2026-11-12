import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GRADLE, getVersion, setVersion, versionCode } from './android-version.js';

const gradle = `    defaultConfig {
        versionCode 4
        versionName "0.0.4"
    }`;

describe('Android version', () => {
	it('computes versionCode', () => {
		expect(versionCode('1.2.3')).toBe(10203);
		expect(versionCode('0.0.4')).toBe(4);
		expect(versionCode('0.0.0')).toBe(1);
		for (const bad of ['1.2', 'v1.2.3', '1.100.0', '1.0.100', '1.2.3-beta']) {
			expect(() => versionCode(bad)).toThrow('expected x.y.z');
		}
	});

	it('writes and reads the version in build.gradle', () => {
		const out = setVersion(gradle, '1.2.3');
		expect(out).toContain('        versionCode 10203\n        versionName "1.2.3"');
		expect(getVersion(out)).toBe('1.2.3');
		expect(() => setVersion('android {}', '1.2.3')).toThrow('no versionCode');
		expect(() => setVersion(gradle, '0.0.4')).toThrow('not higher');
		expect(() => setVersion(gradle, '0.0.3')).toThrow('not higher');
		expect(setVersion(gradle, '0.0.5')).toContain('versionCode 5');
		expect(() => getVersion(gradle.replace('versionCode 4', 'versionCode 5'))).toThrow('versionCode 5');
	});

	it('matches package.json in the repository', () => {
		const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
		expect(getVersion(readFileSync(GRADLE, 'utf8'))).toBe(version);
	});
});
