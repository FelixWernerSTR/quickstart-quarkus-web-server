import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useMonitorStore } from '../store/monitorStore.js';
import { useConfigStore } from '../store/configStore.js';
import Card from '../components/Card.js';

export default {
    components: {
        Card
    },
    setup() {
        const monitorStore = useMonitorStore();
        const configStore = useConfigStore();
        
        const summary = computed(() => monitorStore.healthSummary);
        const isLoading = computed(() => monitorStore.isLoading);
        const lastFetchTime = computed(() => {
            if (!monitorStore.lastFetchTimestamp) return 'N/A';
            return new Date(monitorStore.lastFetchTimestamp).toLocaleTimeString();
        });

        // Data processing for cards
        const mergedEndpointData = computed(() => {
            const endpoints = configStore.endpoints;
            const statusMap = new Map(monitorStore.statusData.map(d => [d.name, d]));
            const currentlyLoading = isLoading.value;

            return endpoints.map(endpoint => {
                const status = statusMap.get(endpoint.name);
                
                let displayStatus = status;
                if (!status) {
                    if (currentlyLoading) {
                         displayStatus = { ...endpoint, status: null, details: 'Lade Status...' };
                    } else {
                         displayStatus = { ...endpoint, status: 'N/A', details: 'Statusdaten fehlen oder konnten nicht abgerufen werden.' };
                    }
                }
                
                return {
                    id: endpoint.id,
                    ...displayStatus 
                };
            });
        });


        // Lifecycle management for auto-refresh
        onMounted(() => {
            monitorStore.startAutoRefresh();
        });
        
        onUnmounted(() => {
            monitorStore.stopAutoRefresh();
        });
        
        const manualRefresh = () => {
            monitorStore.fetchStatus();
        };


        return {
            summary,
            isLoading,
            lastFetchTime,
            configStore,
            manualRefresh,
            mergedEndpointData
        };
    },
    template: `
        <div class="health-monitor">
            <h2>Health Monitor</h2>
            
            <!-- Summary Card -->
            <div class="card" style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div>
                        <h4 style="margin: 0 0 5px 0;">Status-Übersicht</h4>
                        <p style="margin: 2px 0;">Gesamt Endpoints: {{ summary.total }}</p>
                        <p style="margin: 2px 0; color: var(--color-success);">OK: {{ summary.ok }}</p>
                        <p style="margin: 2px 0; color: var(--color-error);">Fehler: {{ summary.error }}</p>
                    </div>
                    <div style="text-align: right; min-width: 150px;">
                        <p style="margin: 2px 0;">Zuletzt aktualisiert: {{ lastFetchTime }}</p>
                        <p style="margin: 2px 0;">Auto-Aktualisierung: Alle {{ configStore.refreshIntervalSeconds }}s</p>
                    </div>
                </div>
                <div style="text-align: left; border-top: 1px solid #eee; padding-top: 10px;">
                     <button @click="manualRefresh" :disabled="isLoading">
                        {{ isLoading ? 'Aktualisiere...' : 'Aktualisieren' }}
                    </button>
                </div>
            </div>
            
            <!-- Endpoint Cards -->
            <div v-if="configStore.endpoints.length === 0" class="card status-loading">
                <p>Keine Endpunkte konfiguriert. Bitte wechseln Sie zur Konfigurationsansicht.</p>
            </div>
            <div v-else class="card-grid">
                <Card 
                    v-for="endpoint in mergedEndpointData" 
                    :key="endpoint.id" 
                    :endpoint="endpoint"
                />
            </div>
        </div>
    `
};

