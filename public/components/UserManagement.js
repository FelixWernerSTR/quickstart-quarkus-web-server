import { ref } from 'vue';
import { useUsersStore } from '../stores/users.js';

export default {
  setup() {
    const usersStore = useUsersStore();
    const showAddForm = ref(false);
    const newUserName = ref('');
    const editingUserId = ref(null);
    const editingUserName = ref('');

    const addUser = () => {
      if (!newUserName.value.trim()) {
        alert('Bitte geben Sie einen Namen ein');
        return;
      }
      usersStore.addUser(newUserName.value);
      newUserName.value = '';
      showAddForm.value = false;
    };

    const startEdit = (userId, name) => {
      editingUserId.value = userId;
      editingUserName.value = name;
    };

    const saveEdit = () => {
      if (!editingUserName.value.trim()) {
        alert('Bitte geben Sie einen Namen ein');
        return;
      }
      usersStore.updateUser(editingUserId.value, editingUserName.value);
      editingUserId.value = null;
      editingUserName.value = '';
    };

    const deleteUser = (userId) => {
      if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
        usersStore.deleteUser(userId);
      }
    };

    const closeModal = () => {
      const event = new CustomEvent('close-user-modal');
      window.dispatchEvent(event);
    };

    const handleBackdropClick = (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    };

    return {
      usersStore,
      showAddForm,
      newUserName,
      addUser,
      editingUserId,
      editingUserName,
      startEdit,
      saveEdit,
      deleteUser,
      closeModal,
      handleBackdropClick
    };
  },
  template: `
    <div class="modal active" @click="handleBackdropClick">
      <div class="modal-content">
        <div class="modal-title">👥 Benutzer verwalten</div>
        
        <button 
          v-if="!showAddForm"
          class="btn btn-primary"
          @click="showAddForm = true"
          style="margin-bottom: 16px; width: 100%;"
        >
          ➕ Neuer Benutzer
        </button>

        <div v-if="showAddForm" class="form-group" style="margin-bottom: 20px; padding: 12px; background: #fef2f2; border-radius: 6px;">
          <input 
            v-model="newUserName"
            class="form-input"
            placeholder="Benutzername"
            style="margin-bottom: 8px;"
          />
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" @click="addUser" style="flex: 1;">Hinzufügen</button>
            <button class="btn btn-secondary" @click="showAddForm = false" style="flex: 1;">Abbrechen</button>
          </div>
        </div>

        <div class="users-list">
          <div v-for="user in usersStore.users" :key="user.id" class="user-card">
            <div v-if="editingUserId !== user.id" class="user-name">
              {{ user.name }}
            </div>
            <input 
              v-else
              v-model="editingUserName"
              class="form-input"
              style="margin-bottom: 8px;"
            />
            
            <div v-if="editingUserId !== user.id" class="user-actions">
              <button class="btn btn-secondary btn-small" @click="startEdit(user.id, user.name)">
                ✏️
              </button>
              <button class="btn btn-danger btn-small" @click="deleteUser(user.id)">
                🗑️
              </button>
            </div>
            <div v-else style="display: flex; gap: 4px; flex-direction: column;">
              <button class="btn btn-primary btn-small" @click="saveEdit">✓ Speichern</button>
              <button class="btn btn-secondary btn-small" @click="editingUserId = null">✕ Abbrechen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

