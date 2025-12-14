import { ref } from 'vue';
import { useKanbanStore } from '../stores/kanban.js';
import KanbanBoard from './KanbanBoard.js';
import UserManagement from './UserManagement.js';
import TaskForm from './TaskForm.js';

export default {
  components: {
    KanbanBoard,
    UserManagement,
    TaskForm
  },
  setup() {
    const kanbanStore = useKanbanStore();
    const currentView = ref('kanban');

    // Initialize with today's weekday
    const today = new Date();
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    kanbanStore.setCurrentWeekday(weekdays[today.getDay()]);

    const switchView = (view) => {
      currentView.value = view;
    };

    const selectWeekday = (weekday) => {
      kanbanStore.setCurrentWeekday(weekday);
    };

    // Listen for close events from modals
    window.addEventListener('close-user-modal', () => {
      currentView.value = 'kanban';
    });

    window.addEventListener('close-task-modal', () => {
      currentView.value = 'kanban';
    });

    window.addEventListener('close-edit-modal', () => {
      // The KanbanBoard will handle closing the edit form
    });

    return {
      kanbanStore,
      currentView,
      switchView,
      selectWeekday
    };
  },
  template: `
    <div class="header">
      <h1>👨‍👩‍👧‍👦 Familien-Kanbanboard</h1>
      <div class="weekday-selector">
        <button 
          v-for="day in kanbanStore.weekdays"
          :key="day"
          class="weekday-btn"
          :class="{ active: kanbanStore.currentWeekday === day }"
          @click="selectWeekday(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="sidebar">
        <div class="nav-buttons">
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'kanban' }"
            @click="switchView('kanban')"
          >
            📋 Kanban
          </button>
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'newTask' }"
            @click="switchView('newTask')"
          >
            ➕ Aufgabe hinzufügen
          </button>
          <button 
            class="nav-btn"
            :class="{ active: currentView === 'users' }"
            @click="switchView('users')"
          >
            👥 Benutzer
          </button>
        </div>

        <div class="backlog-section">
          <div class="backlog-title">📦 Backlog</div>
          <div class="backlog-tasks">
            <div 
              v-for="task in kanbanStore.backlog"
              :key="task.id"
              class="task-card"
              draggable="true"
              @dragstart="$event.dataTransfer.effectAllowed = 'move'; $event.dataTransfer.setData('task', JSON.stringify({...task, fromLane: 'backlog'}))"
            >
              <div class="task-card-title">{{ task.title }}</div>
              <div class="task-card-meta">
                <span class="task-card-type">{{ task.type === 'wiederkehrend' ? '🔄 Wdh.' : '✓ Einmalig' }}</span>
                <span v-if="task.assigned" class="task-card-user">👤 {{ task.assigned }}</span>
                <span v-if="task.dueDate">📅 {{ task.dueDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="flex: 1;">
        <KanbanBoard v-if="currentView === 'kanban'" />
        <TaskForm v-if="currentView === 'newTask'" />
        <UserManagement v-if="currentView === 'users'" />
      </div>
    </div>

    <div class="footer">
      Bereitgestellt von Felix Werner, Version v1.0
    </div>
  `
};