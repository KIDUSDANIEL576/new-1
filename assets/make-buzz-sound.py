#!/usr/bin/env python3
"""Generates assets/buzz.wav — the sound the other phone makes.

Ships as source rather than a binary blob so the ring can be tuned without
guessing at what's inside a .wav. Run: python3 assets/make-buzz-sound.py

A phone ring is usually a harsh square-wave warble. This is deliberately not
that: two soft sine partials a perfect fifth apart, struck three times with a
gentle attack and a long decay. It reads as "someone is reaching for you",
which is the whole point, rather than "an alarm is going off".
"""
import math
import struct
import wave

# 22.05 kHz is plenty: the highest partial is 1.3 kHz, far under Nyquist, and
# it halves what we ship in the app bundle.
RATE = 22050
CHANNELS = 1
SAMPLE_WIDTH = 2  # 16-bit

# E5 + B5 — a fifth. Warm, not shrill, and cuts through room noise.
PARTIALS = [(659.25, 1.0), (987.77, 0.55), (1318.5, 0.18)]

CHIME_S = 0.55       # one strike
GAP_S = 0.16         # inside a pair
PAIR_GAP_S = 0.42    # between pairs
PAIRS = 2             # ~3s total — long enough to notice, short enough to forgive


def chime(duration_s: float) -> list[float]:
    n = int(RATE * duration_s)
    out = []
    for i in range(n):
        t = i / RATE
        # fast attack, long exponential decay — a struck bell, not a beep
        attack = min(1.0, t / 0.012)
        decay = math.exp(-3.6 * t)
        env = attack * decay
        # slight tremolo keeps it alive instead of sterile
        env *= 1.0 + 0.06 * math.sin(2 * math.pi * 5.5 * t)
        s = sum(amp * math.sin(2 * math.pi * f * t) for f, amp in PARTIALS)
        out.append(env * s / sum(a for _, a in PARTIALS))
    return out


def silence(duration_s: float) -> list[float]:
    return [0.0] * int(RATE * duration_s)


samples: list[float] = []
for p in range(PAIRS):
    samples += chime(CHIME_S)
    samples += silence(GAP_S)
    samples += chime(CHIME_S)
    if p < PAIRS - 1:
        samples += silence(PAIR_GAP_S)
samples += silence(0.25)  # let the last strike ring out

# normalize with headroom so no player clips it
peak = max(abs(s) for s in samples) or 1.0
gain = 0.82 / peak

frames = b''.join(
    struct.pack('<h', max(-32768, min(32767, int(s * gain * 32767)))) for s in samples
)

with wave.open('assets/buzz.wav', 'wb') as w:
    w.setnchannels(CHANNELS)
    w.setsampwidth(SAMPLE_WIDTH)
    w.setframerate(RATE)
    w.writeframes(frames)

print(f'assets/buzz.wav — {len(samples) / RATE:.2f}s, {len(frames) / 1024:.0f} KB')
