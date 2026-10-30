import { describe, expect, it } from 'vitest';
import { detectPlatform } from './platform';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1',
  ipadAsMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 15; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0',
  macChrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  windowsEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0',
  windowsFirefox:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0',
};

describe('detectPlatform', () => {
  it.each([
    ['Safari on iPhone', UA.iphoneSafari, 0, 'ios'],
    ['Chrome on iPhone', UA.iphoneChrome, 5, 'ios'],
    ['an iPad that reports a Mac', UA.ipadAsMac, 5, 'ios'],
    ['Chrome on Android', UA.android, 5, 'android'],
    ['Firefox on Android', UA.androidFirefox, 5, 'android'],
    ['Safari on a Mac', UA.ipadAsMac, 0, 'desktop-safari'],
    ['Chrome on a Mac', UA.macChrome, 0, 'desktop'],
    ['Edge on Windows', UA.windowsEdge, 0, 'desktop'],
    ['Firefox on a computer', UA.windowsFirefox, 0, 'unsupported'],
  ])('%s', (_name, userAgent, maxTouchPoints, expected) => {
    expect(detectPlatform({ userAgent, maxTouchPoints })).toBe(expected);
  });
});
