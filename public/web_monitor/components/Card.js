import { ref, computed } from 'vue';

export default {
    props: {
        endpoint: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const showDetails = ref(false);
        
        const statusClass = computed(() => 
            props.endpoint.status === '200' ? 'status-ok' : 
            (props.endpoint.status === null || props.endpoint.status === undefined ? 'status-loading' : 'status-error')
        );
        
        const toggleDetails = () => {
             showDetails.value = !showDetails.value;
        };

        return { 
            showDetails, 
            statusClass, 
            toggleDetails 
        };
    },
    template: `
        <div :class="['card', statusClass]">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span class="status-indicator"></span>
                <h3 style="margin: 0; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ endpoint.name }}
                </h3>
                <span style="font-size: 1.2em; font-weight: bold; min-width: 40px; text-align: right;">
                    {{ endpoint.status || '...' }}
                </span>
            </div>
            
            <div>
                <p style="margin: 5px 0; word-break: break-all;">
                    <strong>Host: </strong>
                    {{ endpoint.protokoll }}://{{ endpoint.host }}
                </p>
            </div>
            
            <button 
                class="secondary"
                @click="toggleDetails"
                style="margin-top: 10px; float: right;"
                aria-expanded="showDetails"
            >
                {{ showDetails ? 'Details ausblenden' : 'Details anzeigen' }}
            </button>
            
            <div style="clear: both;">
                <div v-if="showDetails" style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
                    <strong>Details: </strong>
                    {{ endpoint.details || 'Keine Details verfügbar.' }}
                </div>
            </div>
        </div>
    `
};

