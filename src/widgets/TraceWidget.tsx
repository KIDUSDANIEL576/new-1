import React from 'react';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

/**
 * Android home-screen widget: the couple's latest canvas snapshot.
 * Tapping it opens the app.
 */
export function TraceWidget({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#100f16',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 24,
        }}
      >
        <TextWidget text="leave me a trace" style={{ color: '#9a93a5', fontSize: 14 }} />
      </FlexWidget>
    );
  }
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#100f16',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ImageWidget
        image={`${imageUrl}&t=${Date.now()}` as `https://${string}`}
        imageWidth={320}
        imageHeight={352}
        radius={24}
      />
    </FlexWidget>
  );
}
