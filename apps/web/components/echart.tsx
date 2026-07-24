'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export function EChart({ option, height = 360 }: { option: echarts.EChartsCoreOption; height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' });
    chart.setOption(option);

    const observer = new ResizeObserver(() => {
      chart.resize();
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={ref} style={{ width: '100%', height }} className="chart-surface" />;
}