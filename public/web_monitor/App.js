import { createApp, ref, computed } from 'vue';
import { createPinia } from 'pinia';

// Stores
import { useConfigStore } from './store/configStore.js';
import { useMonitorStore } from './store/monitorStore.js';

// Components & Views
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HealthMonitor from './views/HealthMonitor.js';
import Configuration from './views/Configuration.js';
import SeleniumTest from './views/SeleniumTest.js';

const App = {
    components: {
        Header,
        Footer,
        HealthMonitor,
        Configuration,
        SeleniumTest
    },
    setup() {
        // Initialize Pinia store *before* using ref() that depends on it, although createApp handles injection.
        // It's crucial that configuration loads defaults/localStorage upon instantiation.
        const configStore = useConfigStore();
        const monitorStore = useMonitorStore(); // Instantiates and starts watchers/initial fetch

        const currentView = ref('monitor'); // Default view
        
        // Function to navigate between views
        const navigateTo = (viewId) => {
            currentView.value = viewId;
        };
        
        // Determine the component name to render dynamically
        const viewComponent = computed(() => {
            switch (currentView.value) {
                case 'config':
                    return 'Configuration';
                case 'selenium':
                    return 'SeleniumTest';
                case 'monitor':
                default:
                    return 'HealthMonitor';
            }
        });

        return {
            currentView,
            navigateTo,
            viewComponent
        };
    },
    template: `
        <div id="app-container" style="display: flex; flex-direction: column; min-height: 100vh;">
            <Header :currentView="currentView" :onNavigate="navigateTo" />
            <main class="main-content">
                <component :is="viewComponent"></component>
            </main>
            <Footer />
        </div>
    `
};

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');

