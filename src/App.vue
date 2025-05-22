<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="terminal-container">
    <div class="terminal-screen">
      <RouterView />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', monospace;
  background-color: #111;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.terminal-container {
  width: 95%;
  height: 90vh;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #000;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.terminal-screen {
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #00ff00;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

/* Efeito de scanlines CRT */
.terminal-screen::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.2) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 2;
}

/* Efeito de curvatura CRT */
.terminal-screen::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 80%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none;
  z-index: 1;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #000;
}

::-webkit-scrollbar-thumb {
  background: #00aa00;
  border-radius: 4px;
}
</style>
