<template>
  <Toolbar>
    <template #start>
      <Button label="Add Artist" icon="pi pi-plus" @click="addArtistOverlayIsVisible = true"/>
    </template>
    <template #center>
      <Button label="First" icon="pi pi-step-backward" @click="pageUpdate('first')" style="margin-right: 10px"
              :disabled="currentPage.value <= 0"/>
      <Button label="Previous" icon="pi pi-caret-left" @click="pageUpdate('previous')" style="margin-right: 10px"
              :disabled="currentPage.value <= 0"/>
      <Button label="Next" icon="pi pi-caret-right" @click="pageUpdate('next')" style="margin-right: 10px"
              :disabled="currentPage.value >= totalPageCount.value-1"/>
      <Button label="Last" icon="pi pi-step-forward" @click="pageUpdate('last')" style="margin-right: 10px"
              :disabled="currentPage.value >= totalPageCount.value-1"/>
    </template>
    <template #end>
      <InputText v-model="searchTerm" placeholder="Search artist by name" @input="debounceSearch"/>
    </template>
  </Toolbar>
  <Toast/>
  <div style="display: flex; flex-direction:row">
    <ArtistComponent v-for="artist in pageData.value" :key="artist.id" :artist="artist"
                     @pageUpdate="pageUpdate(currentPage.value)"/>
  </div>
  <Dialog v-model:visible="addArtistOverlayIsVisible" modal header="Add an Artist" :style="{ width: '25rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Name</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="newArtist.name"/>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="addArtistOverlayIsVisible = false"/>
      <Button type="button" label="Save" severity="success" @click="addArtist()"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import ArtistComponent from '@/components/ArtistComponent.vue';
import axios from 'axios';
import {useToast} from "primevue/usetoast";

const toast = useToast();
const pageData = reactive([]);
const currentPage = reactive([0]);
const totalPageCount = reactive([""]);
const addArtistOverlayIsVisible = ref(false);
const newArtist = reactive({
  name: '',
});
const searchTerm = ref('');
let debounceTimeout;

async function fetchArtistData(page) {
  try {
    const response = await axios.get(`http://localhost:8080/api/artists?page=${page}`);
    pageData.value = response.data["_embedded"]["artists"];
    totalPageCount.value = response.data["page"]["totalPages"];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function pageUpdate(page) {
  if (page === 'first') {
    currentPage.value = 0;
  } else if (page === 'previous' && currentPage.value > 0) {
    currentPage.value--;
  } else if (page === 'next' && currentPage.value < totalPageCount.value) {
    currentPage.value++;
  } else if (page === 'last') {
    currentPage.value = totalPageCount.value - 1;
  }
  try {
    await fetchArtistData(currentPage.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function addArtist() {
  try {
    await axios.post('http://localhost:8080/api/artists', newArtist);
    addArtistOverlayIsVisible.value = false;
    newArtist.name = '';
    await pageUpdate(currentPage.value);
    showAddSuccess();
  } catch (error) {
    console.error('Error adding artist:', error);
  }
}

function showAddSuccess() {
  toast.add({severity: 'success', summary: 'Artist successfully added', life: 3000});
}

async function searchArtistsByTitle() {
  if (searchTerm.value === '') {
    await fetchArtistData(currentPage.value);
  } else {
    try {
      const searchResponse = await axios.get(`http://localhost:8080/api/artists/search/findByNameContainingIgnoreCase?name=${searchTerm.value}`);
      if (searchResponse.data["_embedded"]["artists"].length === 0) {
        toast.add({severity: 'info', summary: 'No songs can be found. Please adjust your search.', life: 3000});
      } else {
        pageData.value = searchResponse.data["_embedded"]["artists"];
      }
    } catch (error) {
      console.error('Error searching artists:', error);
    }
  }
}

function debounceSearch() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(searchArtistsByTitle, 500);
}

onMounted(async () => {
  try {
    await fetchArtistData(currentPage.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>