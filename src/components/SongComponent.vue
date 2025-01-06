<template>
  <Toast/>
  <Card style="margin: 10px; width: 20rem; overflow: hidden">
    <template #title>{{ song.title }} - {{ song.artist.name }}</template>
    <template #subtitle>{{ song.genre }}</template>
    <template #content>{{ formattedLength }} min</template>
    <template #footer>
      <div style="display:flex; gap: 2rem; justify-content: center">
        <Button label="Edit" severity="secondary" outlined class="w-full" v-on:click="editSongOverlayIsVisible = true"/>
        <Button label="Delete" severity="danger" class="w-full" v-on:click="deleteSong()"/>
        <Button icon="pi pi-play" class="w-full" v-on:click="playSong()"/>
      </div>
    </template>
  </Card>
  <Dialog v-model:visible="editSongOverlayIsVisible" modal header="Edit this Song" :style="{ width: '25rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="song.title"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="artist" class="font-semibold w-24">Artist</label>
      <Dropdown v-model="song.artist" editable :options="artists.value" optionLabel="name"
                placeholder="Select an artist" class="w-full md:w-14rem"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="genre" class="font-semibold w-24">Genre</label>
      <InputText id="genre" class="flex-auto" autocomplete="off" v-model="song.genre"/>
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="genre" class="font-semibold w-24">Length in s</label>
      <InputNumber id="genre" class="flex-auto" autocomplete="off" v-model="song.length"/>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="editSongOverlayIsVisible = false"/>
      <Button type="button" label="Save" severity="success" @click="editSong()"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from 'axios';
import {defineProps} from 'vue';
import {useToast} from "primevue/usetoast";

const toast = useToast();

const emit = defineEmits(['pageUpdate', 'playSong']);
const editSongOverlayIsVisible = ref(false);
const props = defineProps({
  song: {
    _links: {
      artist: {
        href: String,
      },
      self: {
        href: String,
      },
      song: {
        href: String,
      }
    },
    artist: {},
    genre: String,
    length: Number,
    title: String,
  },
  artists: {
    type: Array,
  }
});

const formattedLength = computed(() => {
  const minutes = Math.floor(props.song.length / 60);
  const seconds = props.song.length % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

async function deleteSong() {
  try {
    await axios.delete(`${props.song._links.self.href}`);
    showDeletionSuccess();
    emit('pageUpdate');
    console.log('Song deleted');
  } catch (error) {
    console.error('Error deleting song:', error);
  }
}

function showDeletionSuccess() {
  toast.add({severity: 'success', summary: 'Song successfully deleted', life: 3000});
}

async function editSong() {
  try {
    await axios.patch(`${props.song._links.self.href}`, {
      title: props.song.title,
      artist: props.song.artist._links.self.href,
      genre: props.song.genre,
      length: props.song.length,
    });
    editSongOverlayIsVisible.value = false;
    showEditSuccess();
    emit('pageUpdate');
    console.log('Song updated');
  } catch (error) {
    console.error('Error updating song:', error);
  }
}

async function playSong() {
  try {
    const response = await axios.get(`${props.song._links.self.href}?projection=songFile`);
    emit('playSong', {
      file: response.data.file,
      title: props.song.title,
      artistName: props.song.artist.name
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function showEditSuccess() {
  toast.add({severity: 'success', summary: 'Song successfully updated', life: 3000});
}

</script>