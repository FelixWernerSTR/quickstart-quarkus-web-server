import { defineStore } from 'pinia';
import { ref } from 'vue';

const defaultUsers = [
  { id: 'user_1', name: 'Lisa' },
  { id: 'user_2', name: 'Maja' },
  { id: 'user_3', name: 'Mama' }
];

export const useUsersStore = defineStore('users', () => {
  const users = ref(JSON.parse(localStorage.getItem('kanban_users')) || defaultUsers);

  const addUser = (name) => {
    const newUser = {
      id: 'user_' + Date.now(),
      name
    };
    users.value.push(newUser);
    saveToLocalStorage();
    return newUser;
  };

  const updateUser = (userId, name) => {
    const user = users.value.find(u => u.id === userId);
    if (user) {
      user.name = name;
      saveToLocalStorage();
    }
  };

  const deleteUser = (userId) => {
    users.value = users.value.filter(u => u.id !== userId);
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('kanban_users', JSON.stringify(users.value));
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser
  };
});

