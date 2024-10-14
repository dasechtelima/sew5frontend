import {createApp} from 'vue';
import App from "@/App.vue";
//import './style.css';

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
app.use(ToastService);
app.use(PrimeVue);
app.mount('#app');
