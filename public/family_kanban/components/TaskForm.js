import { ref } from 'vue';
import { useKanbanStore } from '../stores/kanban.js';
import { useUsersStore } from '../stores/users.js';

export default {
  props: {
    task: Object,
    lane: String,
    weekday: String
  },
  setup(props) {
    const kanbanStore = useKanbanStore();
    const usersStore = useUsersStore();

    const form = ref({
      title: props.task ? props.task.title : '',
      type: props.task ? props.task.type : 'einmalig',
      assigned: props.task ? (props.task.assigned || '') : '',
      dueDate: props.task ? (props.task.dueDate || '') : ''
    });

    const submitForm = () => {
      if (!form.value.title.trim()) {
        alert('Bitte geben Sie einen Aufgabentitel ein');
        return;
      }

      if (props.task) {
        // Edit existing task
        const updates = { ...form.value };
        if (!updates.assigned) updates.assigned = null;
        if (!updates.dueDate) updates.dueDate = null;
        kanbanStore.updateWeekdayTask(props.task.id, updates, props.weekday);
      } else {
        // Add new task to backlog
        const newTask = {
          title: form.value.title,
          type: form.value.type,
          assigned: form.value.assigned || null,
          dueDate: form.value.dueDate || null
        };
        kanbanStore.addTaskToBacklog(newTask);
      }
      alert(props.task ? 'Aufgabe aktualisiert!' : 'Aufgabe hinzugefügt!');
    };

    const closeModal = () => {
      // Emit close event to parent
      if (props.task) {
        // If editing, notify parent to close
        const event = new CustomEvent('close-edit-modal');
        window.dispatchEvent(event);
      } else {
        // If adding new task, close by navigating back to kanban
        const event = new CustomEvent('close-task-modal');
        window.dispatchEvent(event);
      }
    };

    const handleBackdropClick = (event) => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    };

    return {
      form,
      submitForm,
      usersStore,
      closeModal,
      handleBackdropClick
    };
  },
  template: `
    <div class="modal active" @click="handleBackdropClick">
      <div class="modal-content">
        <div class="modal-title">{{ task ? '✏️ Aufgabe bearbeiten' : '➕ Neue Aufgabe' }}</div>
        
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Aufgabentitel *</label>
            <input 
              v-model="form.title"
              class="form-input"
              placeholder="z.B. Fenster putzen"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Typ</label>
            <select v-model="form.type" class="form-select">
              <option value="einmalig">✓ Einmalig</option>
              <option value="wiederkehrend">🔄 Wiederkehrend</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Zugewiesen</label>
            <select v-model="form.assigned" class="form-select">
              <option value="">Niemand zugewiesen</option>
              <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Fälligkeitsdatum</label>
            <input 
              v-model="form.dueDate"
              class="form-input"
              type="date"
            />
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn btn-primary">
              {{ task ? '💾 Speichern' : '➕ Aufgabe hinzufügen' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              ✕ Schließen
            </button>
          </div>
        </form>
      </div>
    </div>
  `
};

