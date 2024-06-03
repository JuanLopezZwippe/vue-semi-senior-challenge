<template>
    <v-container>
        <div class="text-h6 my-8 d-flex justify-space-between">
            <div class="rounded-pill bg-black px-4 py-1">
                <p class="text-white">Usuario: {{ user.email }}</p>
            </div>
            <v-btn color="black" @click="logout">Cerrar Sesión</v-btn>
        </div>
        
        <v-select v-model="selectedFilter" :items="filterOptions" label="Filtrar por estado" @change="filterTasks"></v-select>

    <v-data-table :headers="headers" :items="filteredTasks" :items-per-page="15" class="elevation-1">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Lista de Tareas</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-btn color="elevated primary" @click="openCreateTaskDialog">Crear Tarea</v-btn>
                </v-toolbar>
            </template>

            <template v-slot:createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
            </template>

            <template v-for="(header, index) in headers" :key="index" v-slot:[`item.${header.value}`]="{ item }">
                <td v-if="header.value !== 'actions'">
                    {{ header.value === 'completed' ? formatCompleted(item.completed) : item[header.value] }}
                </td>
                <td v-else>
                    <v-btn class="mr-4" :disabled="item.completed" @click="openEditTaskDialog(item)">Editar</v-btn>
                    <v-btn :disabled="item.completed" @click="completeTask(item)">Completar</v-btn>
                </td>
            </template>
        </v-data-table>

        <v-dialog v-model="dialogCreateTask" max-width="500px">
            <v-card>
                <v-card-title>Crear Tarea</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="createTask">
                        <v-text-field v-model="newTask.title" label="Título" required></v-text-field>
                        <v-text-field v-model="newTask.description" label="Descripción"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="createTask">Crear</v-btn>
                    <v-btn @click="closeCreateTaskDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogEditTask" max-width="500px">
            <v-card>
                <v-card-title>Editar Tarea</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="editTask">
                        <v-text-field v-model="editTaskData.title" label="Título" required></v-text-field>
                        <v-text-field v-model="editTaskData.description" label="Descripción"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="saveEditedTask">Guardar</v-btn>
                    <v-btn @click="closeEditTaskDialog">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { collection, query, onSnapshot, updateDoc, doc, addDoc } from "firebase/firestore";
import { auth, db } from '@/services/firebase';

const tasks = ref([]);
const filteredTasks = ref([]); // Tareas filtradas
const router = useRouter();
const user = auth.currentUser;

const headers = [
    { title: 'Título', value: 'title' },
    { title: 'Descripción', value: 'description' },
    { title: 'Creada en', value: 'createdAt' },
    { title: 'Estado', value: 'completed' },
    { title: 'Acciones', value: 'actions' },
];

const filterOptions = ['Todas', 'Completadas', 'Pendientes'];
const selectedFilter = ref('Todas');

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const dialogEditTask = ref(false);
const editTaskData = ref({
    id: '',
    title: '',
    description: ''
});

const openEditTaskDialog = (task) => {
    editTaskData.value.id = task.id;
    editTaskData.value.title = task.title;
    editTaskData.value.description = task.description;
    dialogEditTask.value = true;
};

const closeEditTaskDialog = () => {
    dialogEditTask.value = false;
};

const saveEditedTask = async () => {
    try {
        await updateDoc(doc(db, 'tasks', editTaskData.value.id), {
            title: editTaskData.value.title,
            description: editTaskData.value.description,
        });
        closeEditTaskDialog();
    } catch (error) {
        console.error('Error al editar la tarea:', error);
    }
};

const dialogCreateTask = ref(false);
const newTask = ref({
    title: '',
    description: ''
});

const openCreateTaskDialog = () => {
    dialogCreateTask.value = true;
};

const closeCreateTaskDialog = () => {
    dialogCreateTask.value = false;
};

const createTask = async () => {
    try {
        await addDoc(collection(db, 'tasks'), {
            title: newTask.value.title,
            description: newTask.value.description,
            createdAt: new Date().toISOString(),
            completed: false
        });
        closeCreateTaskDialog();
    } catch (error) {
        console.error('Error al crear la tarea:', error);
    }
};

const fetchTasks = async () => {
    try {
        const tasksCollection = collection(db, 'tasks');
        const q = query(tasksCollection);

        onSnapshot(q, (querySnapshot) => {
            tasks.value = [];
            querySnapshot.forEach((doc) => {
                tasks.value.push({ id: doc.id, ...doc.data() });
            });

            filterTasks();
        });
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
    }
};

const logout = async () => {
    try {
        await auth.signOut();
        router.push('/');

    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

const editTask = (task) => {
    console.log(task);
};

const completeTask = async (task) => {
    try {
        await updateDoc(doc(db, 'tasks', task.id), {
            completed: true,
        });
        console.log('Tarea completada:', task.title);
    } catch (error) {
        console.error('Error al completar la tarea:', error);
    }
};

const formatCompleted = (completed) => {
    return completed ? 'Completa' : 'Incompleta';
};

const filterTasks = () => {
    filteredTasks.value = tasks.value.filter(task => {
        if (selectedFilter.value === 'Todas') return true;
        else if (selectedFilter.value === 'Completadas') return task.completed;
        else if (selectedFilter.value === 'Pendientes') return !task.completed;
    });
};

watch(selectedFilter, filterTasks);

onMounted(() => {
    fetchTasks();
});
</script>