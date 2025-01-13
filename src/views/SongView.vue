<template>
  <Toolbar>
    <template #start>
      <Button label="Add Song" icon="pi pi-plus" @click="addSongOverlayIsVisible = true"/>
    </template>
    <template #center>
      <Button label="First" icon="pi pi-step-backward" @click="pageUpdate('first')" style="margin-right: 10px"
              :disabled="currentPage <= 0"/>
      <Button label="Previous" icon="pi pi-caret-left" @click="pageUpdate('previous')" style="margin-right: 10px"
              :disabled="currentPage <= 0"/>
      <Button label="Next" icon="pi pi-caret-right" @click="pageUpdate('next')" style="margin-right: 10px"
              :disabled="currentPage >= totalPageCount.value-1"/>
      <Button label="Last" icon="pi pi-step-forward" @click="pageUpdate('last')" style="margin-right: 10px"
              :disabled="currentPage >= totalPageCount.value-1"/>
    </template>
    <template #end>
      <InputText v-model="searchTerm" placeholder="Search by title or artist" @input="debounceSearch"/>
    </template>
  </Toolbar>
  <div v-if="currentlyPlayingSong">
    <p>Playing Song: {{ currentlyPlayingSongTitle }} by {{ currentlyPlayingSongArtist }}</p>
    <audio ref="audioPlayer" controls autoplay>
      <source :src="currentlyPlayingSong" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>
  <Toast/>
  <div style="display: flex; flex-direction:row; flex-wrap:wrap">
    <SongComponent v-for="song in pageData.value" :key="song._links.self.href" :song="song" :artists="artists"
                   @pageUpdate="pageUpdate(currentPage)" @playSong="handlePlaySong"/>
  </div>
  <Dialog v-model:visible="addSongOverlayIsVisible" modal header="Add a Song" :style="{ width: '25rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="newSong.title"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="artist" class="font-semibold w-24">Artist</label>
      <Dropdown v-model="newSong.artist" editable :options="artists.value" optionLabel="name"
                placeholder="Select an artist" class="w-full md:w-14rem"/>
      <!-- <InputText id="artist" class="flex-auto" autocomplete="off" v-model="newSong.artist"/> -->
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="genre" class="font-semibold w-24">Genre</label>
      <InputText id="genre" class="flex-auto" autocomplete="off" v-model="newSong.genre"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="genre" class="font-semibold w-24">File</label>
      <FileUpload mode="basic" accept="audio/*" @select="onFileSelect"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="genre" class="font-semibold w-24">Length in s</label>
      <InputNumber id="genre" class="flex-auto" autocomplete="off" v-model="newSong.length"/>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="addSongOverlayIsVisible = false"/>
      <Button type="button" label="Save" severity="success" @click="addSong()"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import SongComponent from '@/components/SongComponent.vue';
import axios from 'axios';
import {useToast} from "primevue/usetoast";

const toast = useToast();
const pageData = reactive([]);
const currentPage = ref(0);
const totalPageCount = reactive([""]);
const addSongOverlayIsVisible = ref(false);
const newSong = reactive({
  title: '',
  artist: '',
  genre: '',
  length: 0,
  file: ''
});
const searchTerm = ref('');
let debounceTimeout;
const artists = reactive([]);
const uploadFile = ref(null);
const currentlyPlayingSong = ref('');
const currentlyPlayingSongTitle = ref('');
const currentlyPlayingSongArtist = ref('');
const audioPlayer = ref(null);

async function fetchSongData(page) {
  try {
    const response = await axios.get(`http://localhost:8080/api/songs?page=${page}&projection=songWithArtist`);
    pageData.value = response.data["_embedded"]["songs"];
    totalPageCount.value = response.data["page"]["totalPages"];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchArtists() {
  try {
    const response = await axios.get('http://localhost:8080/api/artists?page=0&size=999');
    artists.value = response.data["_embedded"]["artists"];
  } catch (error) {
    console.error('Error fetching artists:', error);
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
    await fetchSongData(currentPage.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function onFileSelect(event) {
  uploadFile.value = event.files[0];
}

function encodeAudioFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addSong() {
  try {
    if (uploadFile.value) {
      newSong.file = await encodeAudioFile(uploadFile.value);
    }
    newSong.artist = newSong.artist._links.artist.href;
    console.log('Adding song:', newSong);
    await axios.post('http://localhost:8080/api/songs', newSong);
    addSongOverlayIsVisible.value = false;
    newSong.title = '';
    newSong.artist = '';
    newSong.genre = '';
    newSong.length = 0;
    newSong.file = '';
    await pageUpdate(currentPage.value);
    showAddSuccess();
  } catch (error) {
    console.error('Error adding song:', error);
  }
}

function handlePlaySong({file, title, artistName}) {
  if (file === "") {
    toast.add({severity: 'info', summary: 'No file available for this song', life: 3000});
    return;
  }
  currentlyPlayingSong.value = file;
  currentlyPlayingSongTitle.value = title;
  currentlyPlayingSongArtist.value = artistName;
  if (audioPlayer.value) {
    audioPlayer.value.load();
    audioPlayer.value.play();
  }
}

function showAddSuccess() {
  toast.add({severity: 'success', summary: 'Song successfully added', life: 3000});
}

async function searchSongsByTitle() {
  if (searchTerm.value === '') {
    await fetchSongData(currentPage.value);
  } else {
    try {
      const searchResponse = await axios.get(`http://localhost:8080/api/songs/search/findByTitleIgnoreCaseContainingOrArtistIgnoreCaseContaining?title=${searchTerm.value}&artist=${searchTerm.value}`);
      if (searchResponse.data["_embedded"]["songs"].length === 0) {
        toast.add({severity: 'info', summary: 'No songs can be found. Please adjust your search.', life: 3000});
      } else {
        pageData.value = searchResponse.data["_embedded"]["songs"];
      }
    } catch (error) {
      console.error('Error searching songs:', error);
    }
  }
}

function debounceSearch() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(searchSongsByTitle, 2000); // 2 seconds debounce
}

onMounted(async () => {
  try {
    await fetchSongData(currentPage.value);
    await fetchArtists();
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