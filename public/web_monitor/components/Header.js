import { ref } from 'vue';

export default {
    props: ['currentView', 'onNavigate'],
    setup() {
        const views = [
            { id: 'monitor', name: 'Health-Monitor' },
            { id: 'config', name: 'Konfiguration' }
        ];
        return { views };
    },
    template: `
        <header>
            <h1 style="margin: 0 0 5px 0; font-size: 1.5em;">Endpoint/Resource Monitor</h1>
            <nav>
                <button 
                    v-for="view in views" 
                    :key="view.id"
                    :class="{ active: currentView === view.id }"
                    @click="onNavigate(view.id)"
                >
                    {{ view.name }}
                </button>
            </nav>
        </header>
    `
};

