import { useEffect, useState } from 'react';

const EDGE_DEFAULTS = {
  stroke: '#000000',
  strokeWidth: 2,
  strokeDasharray: undefined,
};

export default function EdgeInspector({ edge, updateEdge }) {
  if (!edge) return null;

  const [style, setStyle] = useState(edge.style ?? EDGE_DEFAULTS);

  useEffect(() => {
    setStyle(edge.style ?? EDGE_DEFAULTS);
  }, [edge.id, edge.style]);

  const commitStyle = (newStyle) => {
    updateEdge({ style: newStyle });
  };

  return (
    <div style={{
        position: 'absolute',
        right: 310,
        bottom: 20,
        background: '#fff',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000, 
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: "'Quicksand', sans-serif",
        border: '1px solid #e2e8f0'
      }}>
      <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#2d3748' }}>Connector Settings</h4>

      <label style={{ fontSize: '12px', fontWeight: 600, color: '#718096' }}>Line Shape</label>
      <select
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0', cursor: 'pointer' }}
        value={edge.type || 'smoothstep'}
        onChange={(e) => updateEdge({ type: e.target.value })}
      >
        <option value="straight">Straight</option>
        <option value="step">90° Sharp</option>
        <option value="smoothstep">90° Rounded</option>
        <option value="default">Smooth Curve</option>
      </select>

      <label style={{ fontSize: '12px', fontWeight: 600, color: '#718096' }}>Color</label>
      <input
        type="color"
        style={{ width: '100%', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
        value={style.stroke ?? EDGE_DEFAULTS.stroke}
        onChange={(e) => {
          const next = { ...style, stroke: e.target.value };
          setStyle(next);
          commitStyle(next);
        }}
      />

      <label style={{ fontSize: '12px', fontWeight: 600, color: '#718096' }}>Thickness</label>
      <input
        type="number"
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
        min={1}
        max={10}
        value={style.strokeWidth ?? EDGE_DEFAULTS.strokeWidth}
        onChange={(e) => {
           const val = Number(e.target.value);
           setStyle({ ...style, strokeWidth: val });
           commitStyle({ ...style, strokeWidth: val });
        }}
      />

      <label style={{ fontSize: '12px', fontWeight: 600, color: '#718096' }}>Pattern</label>
      <select
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0', cursor: 'pointer' }}
        value={style.strokeDasharray === '5 5' ? 'dotted' : 'solid'}
        onChange={(e) => {
          const next = {
            ...style,
            strokeDasharray: e.target.value === 'dotted' ? '5 5' : undefined,
          };
          setStyle(next);
          commitStyle(next);
        }}
      >
        <option value="solid">Solid Line</option>
        <option value="dotted">Dotted Line</option>
      </select>
    </div>
  );
}