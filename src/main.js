import {createApp} from 'vue';
import App from "@/App.vue";

import 'primevue/resources/themes/aura-light-purple/theme.css'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';

import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Button from "primevue/button"
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import InputNumber from "primevue/inputnumber";
import Dropdown from 'primevue/dropdown';
import AutoComplete from 'primevue/autocomplete';

import {createMemoryHistory, createRouter} from 'vue-router'

import SongView from "@/views/SongView.vue";
import ArtistView from "@/views/ArtistView.vue";

const routes = [
    {path: '/songs', component: SongView},
    {path: '/artists', component: ArtistView},
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

const app = createApp(App);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Card', Card);
app.component('Toolbar', Toolbar);
app.component('Dialog', Dialog);
app.component('Toast', Toast);
app.component('InputNumber', InputNumber);
app.component('Dropdown', Dropdown);
app.component('AutoComplete', AutoComplete);
app.use(ToastService);
app.use(PrimeVue);
app.use(router);
app.mount('#app');
