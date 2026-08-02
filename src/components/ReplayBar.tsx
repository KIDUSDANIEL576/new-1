import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, fonts, radius } from '@/theme/tokens';

interface Props {
  /** 0..total points replayed so far */
  position: number;
  total: number;
  playing: boolean;
  onScrub: (position: number) => void;
  onTogglePlay: () => void;
  onClose: () => void;
}

/**
 * The replay scrubber. Hand-rolled rather than pulling in a slider dependency:
 * the project already has react-native-gesture-handler for drawing, and a track
 * plus a thumb is less code than a new native module is risk.
 */
export function ReplayBar({ position, total, playing, onScrub, onTogglePlay, onClose }: Props) {
  const [width, setWidth] = useState(0);

  const seek = useCallback(
    (x: number) => {
      if (width <= 0 || total <= 0) return;
      const ratio = Math.min(1, Math.max(0, x / width));
      onScrub(Math.round(ratio * total));
    },
    [width, total, onScrub]
  );

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => seek(e.x))
    .onUpdate((e) => seek(e.x));

  const pct = total > 0 ? Math.min(1, position / total) : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.tag}>your story, replayed</Text>
      <View style={styles.row}>
        <Pressable onPress={onTogglePlay} style={styles.btn} hitSlop={8}>
          <Text style={styles.btnText}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>

        <GestureDetector gesture={pan}>
          <View
            style={styles.trackHit}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct * 100}%` }]} />
            </View>
            <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
          </View>
        </GestureDetector>

        <Pressable onPress={onClose} style={styles.btn} hitSlop={8}>
          <Text style={styles.btnText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tag: {
    fontFamily: fonts.handwriting,
    fontSize: 18,
    color: colors.gold,
    marginBottom: 4,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.tool,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.text, fontSize: 13 },
  // generous vertical padding so the thin track is still an easy target
  trackHit: { flex: 1, height: 34, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.ink },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginLeft: -7,
  },
});
