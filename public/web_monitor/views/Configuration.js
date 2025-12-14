import { ref, computed } from 'vue';
import { useConfigStore } from '../store/configStore.js';

export default {
    setup() {
        const configStore = useConfigStore();
        
        // Local state for adding/editing
        const newEndpointTemplate = { name: '', host: '', protokoll: 'https' };
        const newEndpoint = ref({ ...newEndpointTemplate });
        const editingEndpoint = ref(null); 
        
        // Import/Export state
        const importExportModal = ref(false);
        const importExportData = ref('');
        const importExportType = ref('export'); // 'export' or 'import'
        
        // --- Endpoint Management ---

        const isEditing = computed(() => !!editingEndpoint.value);

        const resetForm = () => {
            newEndpoint.value = { ...newEndpointTemplate };
            editingEndpoint.value = null;
        };
        
        const saveEndpoint = () => {
            const ep = isEditing.value ? editingEndpoint.value : newEndpoint.value;
            if (!ep.name || !ep.host || !ep.protokoll) {
                alert("Name, Host und Protokoll sind erforderlich.");
                return;
            }
            
            if (isEditing.value) {
                configStore.updateEndpoint(ep);
            } else {
                configStore.addEndpoint(ep);
            }
            resetForm();
        };

        const editEndpoint = (endpoint) => {
            // Clone the object to avoid immediate modification of store state
            editingEndpoint.value = { ...endpoint };
        };
        
        const deleteEndpoint = (id) => {
            if (confirm('Soll dieser Endpunkt wirklich gelöscht werden?')) {
                configStore.removeEndpoint(id);
            }
        };

        // --- Config Settings ---
        
        const updateRefreshInterval = (event) => {
            const value = Number(event.target.value);
            // Ensure interval is a positive integer
            if (!isNaN(value) && value >= 1) {
                configStore.refreshIntervalSeconds = Math.floor(value);
            }
        };
        
        // --- Import/Export ---
        
        const openExport = () => {
            importExportType.value = 'export';
            importExportData.value = configStore.exportConfig();
            importExportModal.value = true;
        };

        const openImport = () => {
            importExportType.value = 'import';
            importExportData.value = '';
            importExportModal.value = true;
        };
        
        const performImport = () => {
            if (configStore.importConfig(importExportData.value)) {
                alert('Konfiguration erfolgreich importiert! Die Endpunkt-Liste wurde aktualisiert.');
                importExportModal.value = false;
            } else {
                alert('Fehler beim Import der Konfiguration. Überprüfen Sie das JSON-Format.');
            }
        };

        return { 
            configStore,
            newEndpoint,
            editingEndpoint,
            isEditing,
            resetForm,
            saveEndpoint,
            editEndpoint,
            deleteEndpoint,
            updateRefreshInterval,
            importExportModal,
            importExportData,
            importExportType,
            openExport,
            openImport,
            performImport,
        };
    },
    template: `
        <div class="configuration">
            <h2>Konfiguration</h2>
            
            <!-- Basis-Konfiguration -->
            <div class="card">
                <h3>Basis-Konfiguration</h3>
                
                <label for="api_url">Backend API URL</label>
                <input 
                    id="api_url" type="text" 
                    :value="configStore.apiUrl" 
                    @input="configStore.apiUrl = $event.target.value" 
                >
                
                <label for="refresh_interval">Aktualisierungsintervall (Sekunden)</label>
                <input 
                    id="refresh_interval" type="number" min="1"
                    :value="configStore.refreshIntervalSeconds" 
                    @input="updateRefreshInterval" 
                >
            </div>
            
            <div style="margin-bottom: 20px;">
                <button class="secondary" @click="openExport">Exportieren (JSON)</button>
                <button class="secondary" @click="openImport">Importieren (JSON)</button>
            </div>
            
            <!-- Endpoint Form -->
            <div class="card">
                <h3>{{ isEditing ? 'Endpunkt bearbeiten' : 'Neuen Endpunkt hinzufügen' }}</h3>
                
                <label for="ep_name">Name (Eindeutiger Bezeichner)</label>
                <input 
                    id="ep_name" type="text" placeholder="z.B. gmx" 
                    v-model="isEditing ? editingEndpoint.name : newEndpoint.name" 
                >
                
                <label for="ep_host">Host</label>
                <input 
                    id="ep_host" type="text" placeholder="z.B. gmx.de" 
                    v-model="isEditing ? editingEndpoint.host : newEndpoint.host"
                >
                
                <label for="ep_protokoll">Protokoll</label>
                <select 
                    id="ep_protokoll" 
                    v-model="isEditing ? editingEndpoint.protokoll : newEndpoint.protokoll"
                    style="width: 100%; margin-bottom: 15px;"
                >
                    <option value="http">http</option>
                    <option value="https">https</option>
                </select>

                <button @click="saveEndpoint">{{ isEditing ? 'Speichern' : 'Hinzufügen' }}</button>
                <button v-if="isEditing" class="secondary" @click="resetForm">Abbrechen</button>
            </div>
            
            <!-- Endpoint List -->
            <div class="card entity-list">
                <h3>Konfigurierte Endpunkte ({{ configStore.endpoints.length }})</h3>
                <p v-if="configStore.endpoints.length === 0">Aktuell sind keine Endpunkte konfiguriert.</p>
                <div v-else>
                    <div v-for="ep in configStore.endpoints" :key="ep.id" class="entity-item">
                        <div class="entity-info">
                            <strong>{{ ep.name }}</strong>
                            <p style="margin: 0; font-size: 0.9em; word-break: break-all;">{{ ep.protokoll }}://{{ ep.host }}</p>
                        </div>
                        <div class="entity-actions">
                            <button class="secondary" @click="editEndpoint(ep)">Bearbeiten</button>
                            <button class="danger" @click="deleteEndpoint(ep.id)">Löschen</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Import/Export Modal -->
            <div v-if="importExportModal" 
                style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100;"
                @click.self="importExportModal = false"
            >
                <div class="card" style="width: 90%; max-width: 600px; max-height: 90%; overflow-y: auto;">
                    <h3>{{ importExportType === 'export' ? 'Konfiguration exportieren' : 'Konfiguration importieren' }}</h3>
                    
                    <textarea
                        style="height: 200px; width: 100%; font-family: monospace; resize: vertical;"
                        v-model="importExportData"
                        :readonly="importExportType === 'export'"
                    ></textarea>
                    
                    <div style="text-align: right; margin-top: 10px;">
                        <button class="secondary" @click="importExportModal = false">Schließen</button>
                        
                        <button v-if="importExportType === 'import'" @click="performImport" style="margin-left: 10px;">
                            Importieren
                        </button> 
                        <a v-else
                            class="button"
                            style="margin-left: 10px; text-decoration: none; display: inline-block;"
                            download="endpoint_config.json"
                            :href="'data:text/json;charset=utf-8,' + encodeURIComponent(importExportData)"
                        >Als Datei speichern</a>
                    </div>
                </div>
            </div>
        </div>
    `
};

