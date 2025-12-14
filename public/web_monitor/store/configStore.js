import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const DEFAULT_ENDPOINTS = [
    { id: 1, name: "heise", host: "heise.de", protokoll: "https" },
    { id: 2, name: "gmx", host: "gmx.de", protokoll: "https" },
];

const LOCAL_STORAGE_KEY = 'monitor_config';

export const useConfigStore = defineStore('config', () => {
    // State
    const apiUrl = ref('/api/endpoint/get/list');
    const refreshIntervalSeconds = ref(30);
    const endpoints = ref([]);
    const nextEndpointId = ref(1);

    // Initialization: Load from localStorage or use defaults
    function loadConfig() {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                const config = JSON.parse(stored);
                apiUrl.value = config.apiUrl || apiUrl.value;
                refreshIntervalSeconds.value = config.refreshIntervalSeconds || refreshIntervalSeconds.value;
                
                // Ensure IDs are sequential and set the next ID correctly
                if (Array.isArray(config.endpoints) && config.endpoints.length > 0) {
                    endpoints.value = config.endpoints.map(ep => ({
                        ...ep,
                        id: ep.id || nextEndpointId.value++ // Assign ID if missing during import
                    }));
                    
                    // Recalculate next ID based on existing max ID
                    const maxId = endpoints.value.reduce((max, ep) => Math.max(max, ep.id || 0), 0);
                    nextEndpointId.value = maxId + 1;

                } else {
                    // Initialize with defaults if localStorage exists but endpoints are empty/invalid
                    initializeDefaults();
                }
            } else {
                initializeDefaults();
            }
            saveConfig(); // Ensure defaults are saved if first run
        } catch (e) {
            console.error("Failed to load config from localStorage", e);
            initializeDefaults();
        }
    }
    
    function initializeDefaults() {
        endpoints.value = DEFAULT_ENDPOINTS.map((ep, index) => ({...ep, id: index + 1}));
        nextEndpointId.value = DEFAULT_ENDPOINTS.length + 1;
    }


    // Actions
    function saveConfig() {
        const configToSave = {
            apiUrl: apiUrl.value,
            refreshIntervalSeconds: refreshIntervalSeconds.value,
            // Strip transient data like IDs if necessary for cleaner export/storage, 
            // but keeping them for Vue/Pinia keying stability.
            endpoints: endpoints.value
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configToSave));
    }
    
    // Watchers for immediate persistence
    watch([apiUrl, refreshIntervalSeconds, endpoints], saveConfig, { deep: true });

    function addEndpoint(endpoint) {
        endpoints.value.push({ ...endpoint, id: nextEndpointId.value++ });
    }

    function removeEndpoint(id) {
        endpoints.value = endpoints.value.filter(ep => ep.id !== id);
    }
    
    function updateEndpoint(updatedEndpoint) {
        const index = endpoints.value.findIndex(ep => ep.id === updatedEndpoint.id);
        if (index !== -1) {
            endpoints.value[index] = updatedEndpoint;
        }
    }

    function exportConfig() {
        const data = {
            apiUrl: apiUrl.value,
            refreshIntervalSeconds: refreshIntervalSeconds.value,
            endpoints: endpoints.value.map(({ id, ...rest }) => rest) // Export without internal IDs
        };
        return JSON.stringify(data, null, 2);
    }

    function importConfig(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            if (importedData.apiUrl) apiUrl.value = importedData.apiUrl;
            
            const importedInterval = Number(importedData.refreshIntervalSeconds);
            if (!isNaN(importedInterval) && importedInterval > 0) refreshIntervalSeconds.value = importedInterval;
            
            if (Array.isArray(importedData.endpoints)) {
                 // Reset endpoints and assign new IDs during import
                endpoints.value = importedData.endpoints.map((ep, index) => ({
                    ...ep,
                    id: index + 1
                }));
                nextEndpointId.value = importedData.endpoints.length + 1;
            }
            saveConfig();
            return true;
        } catch (e) {
            console.error("Import failed:", e);
            return false;
        }
    }

    // Load configuration upon store instantiation
    loadConfig();

    return { 
        apiUrl, 
        refreshIntervalSeconds, 
        endpoints, 
        addEndpoint, 
        removeEndpoint, 
        updateEndpoint,
        exportConfig,
        importConfig,
        saveConfig // Manually trigger save if needed elsewhere
    };
});

