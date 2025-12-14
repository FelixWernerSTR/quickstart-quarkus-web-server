import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const defaultBacklogTasks = [
  { id: 'task_1', title: 'Geschirr aufräumen/Spülmaschine ausräumen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_2', title: 'Staubsaugen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_3', title: 'Waschbecken waschen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_4', title: 'Mittagessen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_5', title: 'Abendessen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_6', title: 'Frühstück', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_7', title: 'Boden wischen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_8', title: 'Wohnzimmer aufräumen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_9', title: 'Schlafzimmer aufräumen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_10', title: 'Lisas Zimmer aufräumen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_11', title: 'Majas Zimmer aufräumen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_12', title: 'Wäsche waschen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_13', title: 'Wäsche aufhängen', type: 'wiederkehrend', assigned: null, dueDate: null },
  { id: 'task_14', title: 'Wäsche in den Schrank vom Trockner einräumen', type: 'wiederkehrend', assigned: null, dueDate: null }
];

export const useKanbanStore = defineStore('kanban', () => {
  const backlog = ref(JSON.parse(localStorage.getItem('kanban_backlog')) || defaultBacklogTasks);
  const lanes = ref(JSON.parse(localStorage.getItem('kanban_lanes')) || {
    'aufgaben': [],
    'inbearbeitung': [],
    'fertig': []
  });
  const currentWeekday = ref(new Date().toLocaleDateString('de-DE', { weekday: 'long' }));
  const weekdayTasks = ref(JSON.parse(localStorage.getItem('kanban_weekday_tasks')) || {});

  const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  const addTaskToBacklog = (task) => {
    task.id = 'task_' + Date.now();
    backlog.value.push(task);
    saveToLocalStorage();
  };

  const removeTaskFromBacklog = (taskId) => {
    backlog.value = backlog.value.filter(t => t.id !== taskId);
    saveToLocalStorage();
  };

  const moveTaskToLane = (taskId, fromLane, toLane) => {
    if (fromLane === 'backlog') {
      const taskIndex = backlog.value.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const task = backlog.value.splice(taskIndex, 1)[0];
        lanes.value[toLane].push(task);
      }
    } else {
      const fromIndex = lanes.value[fromLane].findIndex(t => t.id === taskId);
      if (fromIndex !== -1) {
        const task = lanes.value[fromLane].splice(fromIndex, 1)[0];
        if (toLane === 'backlog') {
          backlog.value.push(task);
        } else {
          lanes.value[toLane].push(task);
        }
      }
    }
    saveToLocalStorage();
  };

  const setCurrentWeekday = (weekday) => {
    currentWeekday.value = weekday;
    if (!weekdayTasks.value[weekday]) {
      weekdayTasks.value[weekday] = {
        aufgaben: [],
        inbearbeitung: [],
        fertig: []
      };
    }
  };

  const addTaskToWeekday = (task, weekday = currentWeekday.value) => {
    task.id = 'task_' + Date.now();
    if (!weekdayTasks.value[weekday]) {
      weekdayTasks.value[weekday] = {
        aufgaben: [],
        inbearbeitung: [],
        fertig: []
      };
    }
    weekdayTasks.value[weekday].aufgaben.push(task);
    saveToLocalStorage();
  };

  const moveWeekdayTask = (taskId, fromLane, toLane, weekday = currentWeekday.value) => {
    if (!weekdayTasks.value[weekday]) return;
    const fromIndex = weekdayTasks.value[weekday][fromLane].findIndex(t => t.id === taskId);
    if (fromIndex !== -1) {
      const task = weekdayTasks.value[weekday][fromLane].splice(fromIndex, 1)[0];
      weekdayTasks.value[weekday][toLane].push(task);
      saveToLocalStorage();
    }
  };

  const getWeekdayLaneTasks = (lane, weekday = currentWeekday.value) => {
    if (!weekdayTasks.value[weekday]) {
      weekdayTasks.value[weekday] = {
        aufgaben: [],
        inbearbeitung: [],
        fertig: []
      };
    }
    return weekdayTasks.value[weekday][lane] || [];
  };

  const deleteWeekdayTask = (taskId, weekday = currentWeekday.value) => {
    if (!weekdayTasks.value[weekday]) return;
    weekdayTasks.value[weekday].aufgaben = weekdayTasks.value[weekday].aufgaben.filter(t => t.id !== taskId);
    weekdayTasks.value[weekday].inbearbeitung = weekdayTasks.value[weekday].inbearbeitung.filter(t => t.id !== taskId);
    weekdayTasks.value[weekday].fertig = weekdayTasks.value[weekday].fertig.filter(t => t.id !== taskId);
    saveToLocalStorage();
  };

  const updateWeekdayTask = (taskId, updates, weekday = currentWeekday.value) => {
    if (!weekdayTasks.value[weekday]) return;
    const lanes = ['aufgaben', 'inbearbeitung', 'fertig'];
    for (const lane of lanes) {
      const task = weekdayTasks.value[weekday][lane].find(t => t.id === taskId);
      if (task) {
        Object.assign(task, updates);
        saveToLocalStorage();
        return;
      }
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('kanban_backlog', JSON.stringify(backlog.value));
    localStorage.setItem('kanban_lanes', JSON.stringify(lanes.value));
    localStorage.setItem('kanban_weekday_tasks', JSON.stringify(weekdayTasks.value));
  };

  return {
    backlog,
    lanes,
    currentWeekday,
    weekdayTasks,
    weekdays,
    addTaskToBacklog,
    removeTaskFromBacklog,
    moveTaskToLane,
    setCurrentWeekday,
    addTaskToWeekday,
    moveWeekdayTask,
    getWeekdayLaneTasks,
    deleteWeekdayTask,
    updateWeekdayTask
  };
});