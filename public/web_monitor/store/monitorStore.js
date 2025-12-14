import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useConfigStore } from './configStore.js';

export const useMonitorStore = defineStore('monitor', () => {
    const configStore = useConfigStore();
    
    // State
    const statusData = ref([]);
    const isLoading = ref(false);
    const lastFetchTimestamp = ref(null);
    const refreshTimer = ref(null);

    // Getters
    const healthSummary = computed(() => {
        const total = configStore.endpoints.length;
        const ok = statusData.value.filter(d => d.status === '200').length;
        const error = total - ok;
        return { total, ok, error };
    });

    // Actions
    async function fetchStatus() {
        if (isLoading.value) return;
        
        // If there are no endpoints configured, just clear data and stop.
        if (configStore.endpoints.length === 0) {
             statusData.value = [];
             return;
        }

        isLoading.value = true;

        try {
            // Get the list of configured endpoints (excluding the IDs for API payload)
            const payload = configStore.endpoints.map(({ id, ...rest }) => rest);

            console.log(`[API] Sending request to ${configStore.apiUrl} with ${payload.length} endpoints.`);

            const response = await fetch(configStore.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            statusData.value = result;
            lastFetchTimestamp.value = Date.now();
        } catch (error) {
            console.error("Error fetching status:", error);
            // Fallback for connection/fetch errors
            statusData.value = configStore.endpoints.map(ep => ({
                name: ep.name,
                host: ep.host,
                protokoll: ep.protokoll,
                status: 'ERR',
                details: `Connection Error: ${error.message}`
            }));
        } finally {
            isLoading.value = false;
        }
    }
    
    function startAutoRefresh() {
        stopAutoRefresh(); // Clear existing timer first
        
        const intervalMs = Math.max(1, configStore.refreshIntervalSeconds) * 1000;
        console.log(`Starting auto-refresh every ${configStore.refreshIntervalSeconds} seconds.`);
        
        // Initial fetch is handled in the mounted hook of HealthMonitor, but ensure we start refreshing
        // if the component mounts or interval changes.
        
        refreshTimer.value = setInterval(() => {
            if (!isLoading.value) { // Prevent concurrent fetches if the mock takes longer than the interval
                fetchStatus();
            }
        }, intervalMs);
    }
    
    function stopAutoRefresh() {
        if (refreshTimer.value) {
            clearInterval(refreshTimer.value);
            refreshTimer.value = null;
        }
    }
    
    // Watch for interval changes in config store to restart timer
    watch(() => configStore.refreshIntervalSeconds, startAutoRefresh);
    
    // Watch for endpoint changes to trigger an immediate refetch and potentially update the summary 
    // when endpoints are added/removed, even if the monitor view isn't active.
    watch(() => configStore.endpoints, () => {
        fetchStatus(); 
    }, { deep: true, immediate: true });


    return {
        statusData,
        isLoading,
        lastFetchTimestamp,
        healthSummary,
        fetchStatus,
        startAutoRefresh,
        stopAutoRefresh
    };
});

