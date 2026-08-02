import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme/tokens';

export type CanvasView = 'all' | 'theirs' | 'mine';

interface Props {
  view: CanvasView;
  partnerName: string;
  onChange: (v: CanvasView) => void;
}

/** Together / From them / My ink — a lens on the same canvas, not three canvases. */
export function ViewTabs({ view, partnerName, onChange }: Props) {
  const tabs: { key: CanvasView; label: string }[] = [
    { key: 'all', label: 'Together' },
    { key: 'theirs', label: `From ${partnerName}` },
    { key: 'mine', label: 'My ink' },
  ];
  return (
    <View style={styles.row}>
      {tabs.map((t) => {
        const on = t.key === view;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tab, on && styles.tabOn]}
          >
            <Text numberOfLines={1} style={[styles.text, on && styles.textOn]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    borderRadius: radius.tool,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tabOn: { borderColor: colors.ink, backgroundColor: colors.inkSoft },
  text: { color: colors.muted, fontSize: 12.5, fontWeight: '500' },
  textOn: { color: '#ffb9c2' },
});
