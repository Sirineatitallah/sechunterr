<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');

    async function login() {
      errorMessage.value = '';
      try {
        const response = await fetch('http://localhost:8080/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value })
        });
        if (!response.ok) {
          throw new Error('Invalid credentials');
        }
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        emit('login-success', data.token);
      } catch (error) {
        errorMessage.value = error.message;
      }
    }

    return {
      username,
      password,
      errorMessage,
      login
    };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 20px auto;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.login-container form div {
  margin-bottom: 10px;
}
.login-container label {
  display: block;
  margin-bottom: 5px;
}
.login-container input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}
.login-container button {
  width: 100%;
  padding: 8px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
