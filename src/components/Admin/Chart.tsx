interface ChartPoint {
  date: string;
  cumulative: number;
}

/** Hand-rolled cumulative-responses line chart. No chart library. */
export function Chart({ points }: { points: ChartPoint[] }) {
  if (points.length < 3) {
    const total = points.length ? points[points.length - 1].cumulative : 0;
    return <p className="admin__chart-fallback">{total}</p>;
  }

  const width = 640;
  const height = 200;
  const pad = { top: 12, right: 16, bottom: 28, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = points[points.length - 1].cumulative;

  const x = (i: number) => pad.left + (i / (points.length - 1)) * innerW;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.cumulative).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${pad.top + innerH} L${pad.left} ${pad.top + innerH} Z`;

  const yTicks = [0, Math.round(max / 2), max];
  const shortDate = (iso: string) => iso.slice(5).replace('-', '.');

  return (
    <div className="admin__chart-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Cumulative responses by day">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--line)"
              strokeWidth="0.75"
            />
            <text x={pad.left - 8} y={y(tick) + 3.5} textAnchor="end" className="admin__chart-tick">
              {tick}
            </text>
          </g>
        ))}
        <path d={area} fill="var(--olive-glow)" />
        <path d={line} fill="none" stroke="var(--olive-light)" strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.cumulative)} r="2.5" fill="var(--olive-light)" />
        ))}
        <text x={pad.left} y={height - 8} className="admin__chart-tick">
          {shortDate(points[0].date)}
        </text>
        <text x={width - pad.right} y={height - 8} textAnchor="end" className="admin__chart-tick">
          {shortDate(points[points.length - 1].date)}
        </text>
      </svg>
    </div>
  );
}
