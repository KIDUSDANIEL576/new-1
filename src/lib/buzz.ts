// What a buzz feels like on the receiving phone when the app is already open.
//
// The push path (buzz-partner → expo push → OS) handles a backgrounded app.
// This is the foreground path: no notification banner would fire, so we make
// the ring ourselves over the realtime channel — which is also the fast one,
// arriving in the same sub-300ms window as strokes.

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const SOUND = require('../../assets/buzz.wav');

// Matches the sound: two strikes, pause, two strikes.
const HAPTIC_PATTERN_MS = [0, 700, 950, 1650];

let sound: Audio.Sound | null = null;
let loading: Promise<Audio.Sound | null> | null = null;

async function getSound(): Promise<Audio.Sound | null> {
  if (sound) return sound;
  if (loading) return loading;
  loading = (async () => {
    try {
      // playsInSilentModeIOS: a buzz the user asked for should still be heard
      // when the app is open, even on a phone that's been flipped to silent.
      // (Doing this from the background would need a Critical Alert
      // entitlement Apple won't grant a couples app — see buzz-partner.)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const { sound: s } = await Audio.Sound.createAsync(SOUND, { volume: 1.0 });
      sound = s;
      return s;
    } catch {
      return null; // audio is a bonus; the haptics still land
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Preload so the first buzz doesn't arrive late. */
export function primeBuzz(): void {
  void getSound();
}

/** Ring this phone: sound + a vibration pattern timed to the chimes. */
export async function playBuzz(): Promise<void> {
  for (const at of HAPTIC_PATTERN_MS) {
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, at);
  }
  try {
    const s = await getSound();
    if (!s) return;
    await s.setPositionAsync(0);
    await s.playAsync();
  } catch {
    // silent failure is fine — they still felt it
  }
}

export async function releaseBuzz(): Promise<void> {
  try {
    await sound?.unloadAsync();
  } catch {
    /* nothing to do */
  }
  sound = null;
}
