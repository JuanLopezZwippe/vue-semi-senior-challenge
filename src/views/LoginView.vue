<template>
  <v-container fluid fill-height class="h-screen d-flex">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="3" class="py-8 px-4">
          <v-card-title>{{ isRegistering ? 'Registrarse' : 'Iniciar Sesión' }}</v-card-title>
          <v-card-text>
            <div v-if="!isRegistering">
              <v-text-field v-model="email" label="Correo Electrónico"></v-text-field>
              <v-text-field v-model="password" label="Contraseña" type="password"></v-text-field>
              <v-btn class="mr-4" color="black" @click="login">Iniciar Sesión</v-btn>
              <v-btn text @click="toggleForm">Registrarse</v-btn>
            </div>
  
            <div v-if="isRegistering">
              <v-text-field v-model="registerEmail" label="Correo Electrónico"></v-text-field>
              <v-text-field v-model="registerPassword" label="Contraseña" type="password"></v-text-field>
              <v-btn class="mr-4" color="secondary" @click="register">Registrarse</v-btn>
              <v-btn text @click="toggleForm">Iniciar Sesión</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';

const router = useRouter();

const email = ref('');
const password = ref('');

const registerEmail = ref('');
const registerPassword = ref('');

const isRegistering = ref(false);

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/tasks');
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
};

const register = async () => {
  try {
    await createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value);
    toggleForm();
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
  }
};

const toggleForm = () => {
  isRegistering.value = !isRegistering.value;
};
</script>
