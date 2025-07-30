
import React, { useState } from 'react';

// 错误示范：在父组件的渲染函数中定义子组件
export default function BadExample() {
  // 这个 state 仅用于触发父组件的重新渲染
  const [_, setForceUpdate] = useState(0);

  // 错误：Counter 组件在 BadExample 每次渲染时都会被重新定义
  const Counter = () => {
    const [count, setCount] = useState(0);
    return (
      <button onClick={() => setCount(c => c + 1)}>
        子组件点击次数: {count}
      </button>
    );
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
      <button onClick={() => setForceUpdate(x => x + 1)}>
        点击我，强制更新父组件
      </button>
      <hr style={{ margin: '1rem 0' }} />
      <Counter />
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        操作：先点击几次子组件按钮，然后点击父组件按钮，观察子组件状态是否被重置。
      </p>
    </div>
  );
}
