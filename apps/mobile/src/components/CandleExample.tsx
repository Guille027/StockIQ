import { View } from "react-native";
import Svg, { G, Line, Rect } from "react-native-svg";
import { useColorScheme } from "nativewind";
import type { OhlcPoint } from "@stockiq/shared-types";

const W = 300;
const H = 160;
const PAD = 10;

/**
 * Tiny hand-authored candle chart for lessons -- fictional, simplified data
 * designed to illustrate one idea. Not a market chart (that's PriceChart).
 */
export function CandleExample({ candles }: { candles: OhlcPoint[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const up = isDark ? "#6fae94" : "#3f7d64";
  const down = isDark ? "#c9846a" : "#a85a3f";

  if (candles.length === 0) return null;

  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const range = max - min || 1;
  const y = (v: number) => PAD + ((max - v) / range) * (H - PAD * 2);

  const slot = (W - PAD * 2) / candles.length;
  const bodyW = Math.min(26, slot * 0.55);

  return (
    <View className="items-center">
      <Svg width={W} height={H}>
        {candles.map((c, i) => {
          const cx = PAD + slot * i + slot / 2;
          const bullish = c.close >= c.open;
          const color = bullish ? up : down;
          const bodyTop = y(Math.max(c.open, c.close));
          const bodyBottom = y(Math.min(c.open, c.close));
          return (
            <G key={i}>
              <Line x1={cx} y1={y(c.high)} x2={cx} y2={y(c.low)} stroke={color} strokeWidth={1.5} />
              <Rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={Math.max(2, bodyBottom - bodyTop)}
                fill={color}
                opacity={bullish ? 1 : 0.85}
                rx={2}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

/** Simple line rendering for chartExample blocks that carry `line` data. */
export function LineExample({ values }: { values: number[] }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const stroke = isDark ? "#8b7cf6" : "#6a56e0";

  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / (values.length - 1);
  const y = (v: number) => PAD + ((max - v) / range) * (H - PAD * 2);

  return (
    <View className="items-center">
      <Svg width={W} height={H}>
        {values.slice(1).map((v, i) => (
          <Line
            key={i}
            x1={PAD + stepX * i}
            y1={y(values[i]!)}
            x2={PAD + stepX * (i + 1)}
            y2={y(v)}
            stroke={stroke}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </View>
  );
}
