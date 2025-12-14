import { ref } from 'vue';
import { useKanbanStore } from '../stores/kanban.js';
import { useUsersStore } from '../stores/users.js';
import TaskForm from './TaskForm.js';

export default {
  components: {
    TaskForm
  },
  setup() {
    const kanbanStore = useKanbanStore();
    const usersStore = useUsersStore();
    const dragOverLane = ref(null);
    const editingTask = ref(null);
    const editingLane = ref(null);

    const lanes = [
      { id: 'aufgaben', name: '📋 Aufgaben' },
      { id: 'inbearbeitung', name: '⚙️ In Bearbeitung' },
      { id: 'fertig', name: '✅ Fertig' }
    ];

    const getLaneTasks = (laneId) => {
      return kanbanStore.getWeekdayLaneTasks(laneId, kanbanStore.currentWeekday);
    };

    const handleDragOver = (e, laneId) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dragOverLane.value = laneId;
    };

    const handleDragLeave = () => {
      dragOverLane.value = null;
    };

    const handleDrop = (e, toLane) => {
      e.preventDefault();
      dragOverLane.value = null;
      
      try {
        const taskData = JSON.parse(e.dataTransfer.getData('task'));
        const task = { ...taskData };
        const fromLane = task.fromLane;
        delete task.fromLane;

        if (fromLane === 'backlog') {
          // Moving from backlog to a weekday lane
          kanbanStore.removeTaskFromBacklog(task.id);
          kanbanStore.addTaskToWeekday(task, kanbanStore.currentWeekday);
          // Move to the appropriate lane
          kanbanStore.moveWeekdayTask(task.id, 'aufgaben', toLane, kanbanStore.currentWeekday);
        } else {
          // Moving between weekday lanes
          kanbanStore.moveWeekdayTask(task.id, fromLane, toLane, kanbanStore.currentWeekday);
        }
      } catch (error) {
        console.error('Drop error:', error);
      }
    };

    const getUserName = (userId) => {
      const user = usersStore.users.find(u => u.id === userId);
      return user ? user.name : 'Nicht zugewiesen';
    };

    const deleteTask = (taskId) => {
      kanbanStore.deleteWeekdayTask(taskId, kanbanStore.currentWeekday);
    };

    const startEditTask = (task, lane) => {
      editingTask.value = { ...task };
      editingLane.value = lane;
    };

    const closeEditTask = () => {
      editingTask.value = null;
      editingLane.value = null;
    };

    // Listen for close events from TaskForm
    window.addEventListener('close-edit-modal', closeEditTask);

    return {
      lanes,
      getLaneTasks,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      dragOverLane,
      getUserName,
      deleteTask,
      kanbanStore,
      editingTask,
      editingLane,
      startEditTask,
      closeEditTask
    };
  },
  template: `
    <div class="kanban-container">
      <div v-for="lane in lanes" :key="lane.id" class="kanban-lane">
        <div class="lane-header">
          {{ lane.name }}
          <span style="font-size: 12px; opacity: 0.7;">({{ getLaneTasks(lane.id).length }})</span>
        </div>
        <div class="lane-content">
          <div 
            class="drop-zone"
            :class="{ 'drag-over': dragOverLane === lane.id }"
            @dragover="handleDragOver($event, lane.id)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, lane.id)"
          >
            <div v-if="getLaneTasks(lane.id).length === 0" class="empty-state">
              Keine Aufgaben
            </div>
            <div 
              v-for="task in getLaneTasks(lane.id)"
              :key="task.id"
              class="task-card"
              draggable="true"
              @dragstart="$event.dataTransfer.effectAllowed = 'move'; $event.dataTransfer.setData('task', JSON.stringify({...task, fromLane: lane.id}))"
              style="cursor: move;"
            >
              <div class="task-card-title">{{ task.title }}</div>
              <div class="task-card-meta">
                <span class="task-card-type">{{ task.type === 'wiederkehrend' ? '🔄 Wdh.' : '✓ Einmalig' }}</span>
                <span v-if="task.assigned" class="task-card-user">👤 {{ getUserName(task.assigned) }}</span>
                <span v-if="task.dueDate">📅 {{ task.dueDate }}</span>
                <div style="display: flex; gap: 4px; margin-top: 6px;">
                  <button class="btn btn-secondary btn-small" @click="startEditTask(task, lane.id)">✏️</button>
                  <button class="btn btn-danger btn-small" @click="deleteTask(task.id)">Löschen</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskForm 
        v-if="editingTask"
        :task="editingTask"
        :lane="editingLane"
        :weekday="kanbanStore.currentWeekday"
        @close="closeEditTask"
      />
    </div>
  `
};