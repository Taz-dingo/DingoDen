<script setup>
import { ref, reactive, nextTick } from 'vue';

// 使用 ref 创建一个响应式的数字
const count = ref(0);

// 使用 reactive 创建一个包含用户信息的响应式对象
const user = reactive({
  name: 'Alex',
  hobbies: ['coding', 'reading'],
});

function increment() {
  count.value++;
}

async function addHobby() {
  user.hobbies.push('gaming');
  // DOM 不会立即更新，Vue 会在“下一个 tick”批量处理
  await nextTick();
  console.log("DOM has been updated");
}
</script>

<template>
  <div style="border: 1px solid #ccc; padding: 1rem; border-radius: 4px;">
    <h3>计数器 (ref)</h3>
    <p>当前计数值: {{ count }}</p>
    <button @click="increment">增加</button>

    <hr style="margin: 1.5rem 0;" />

    <h3>用户信息 (reactive)</h3>
    <p>{{ user.name }} 的爱好:</p>
    <ul>
      <li v-for="hobby in user.hobbies" :key="hobby">{{ hobby }}</li>
    </ul>
    <button @click="addHobby">添加爱好</button>
  </div>
</template>
