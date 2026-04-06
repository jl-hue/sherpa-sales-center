import React from 'react';

export const Chips = ({
  options,
  selected,
  onChange,
  color = '#16A34A',
  single = false,
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
    {options.map((o) => {
      const on = single ? selected === o : (selected || []).includes(o);
      return (
        <button
          key={o}
          onClick={() =>
            single
              ? onChange(on ? '' : o)
              : onChange(
                  on
                    ? (selected || []).filter((x) => x !== o)
                    : [...(selected || []), o]
                )
          }
          style={{
            padding: '6px 14px',
            borderRadius: 99,
            border: `2px solid ${on ? color : '#E4E4E7'}`,
            background: on ? color + '12' : '#fff',
            color: on ? color : '#71717A',
            fontSize: 12,
            fontWeight: on ? 700 : 400,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {on ? '\u2713 ' : ''}
          {o}
        </button>
      );
    })}
  </div>
);
