import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import TasksView from '@/views/TasksView.vue';
import { auth } from '@/services/firebase';

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
    },
    {
        path: '/tasks',
        name: 'Tasks',
        component: TasksView,
        beforeEnter: async (to, from, next) => {
            try {
                const user = auth.currentUser;
                if (user) {
                    next();
                } else {
                    next({ name: 'Login' });
                }
            } catch (error) {
                console.error('Error al verificar la autenticación:', error);
                next({ name: 'Login' });
            }
        }
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
