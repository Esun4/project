import { useEffect, useState } from 'react';

export default function NodeInspector({ node, updateNode }) {
  if (!node) return null;

  const [local, setLocal] = useState(node.data);

  // sync when selecting a new node
  useEffect(() => {
    setLocal(node.data);
  }, [node.id]);

  const commit = (updates) => {
    updateNode(updates);
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        top: 10,
        background: '#fff',
        padding: 10,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <h4>Node Settings</h4>

      <label>Label</label>
      <input
        value={local.label ?? ''}
        onChange={(e) =>
          setLocal({ ...local, label: e.target.value })
        }
        onBlur={() => commit({ label: local.label })}
      />

      <label>Background</label>
      <input
        type="color"
        value={local.color ?? '#ffffff'}
        onChange={(e) => {
          setLocal({ ...local, color: e.target.value });
          commit({ color: e.target.value });
        }}
      />

      <label>Border</label>
      <input
        type="color"
        value={local.borderColor ?? '#555555'}
        onChange={(e) => {
          setLocal({ ...local, borderColor: e.target.value });
          commit({ borderColor: e.target.value });
        }}
      />

      <label>Border Width</label>
      <input
        type="number"
        min={1}
        max={10}
        value={node.data.borderWidth ?? 1}
        onChange={(e) => updateNode({ borderWidth: Number(e.target.value) })}
      />


      <label>Text Color</label>
      <input
        type="color"
        value={local.textColor ?? '#000000'}
        onChange={(e) => {
          setLocal({ ...local, textColor: e.target.value });
          commit({ textColor: e.target.value });
        }}
      />

      <label>Font Size</label>
      <input
        type="number"
        min={10}
        max={48}
        value={local.fontSize ?? 14}
        onChange={(e) =>
          setLocal({ ...local, fontSize: Number(e.target.value) })
        }
        onBlur={() => commit({ fontSize: local.fontSize })}
      />
    </div>
  );
}
