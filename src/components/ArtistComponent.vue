<template>
  <Toast/>
  <Card style="margin: 10px; width: 20rem; overflow: hidden">
    <template #title>{{ artist.name }}</template>
    <template #footer>
      <div style="display:flex; gap: 2rem; justify-content: center">
        <Button label="Edit" severity="secondary" outlined class="w-full" v-on:click="editArtistOverlayIsVisible = true"/>
        <Button label="Delete" severity="danger" class="w-full" v-on:click="deleteArtist()"/>
      </div>
    </template>
  </Card>
  <Dialog v-model:visible="editArtistOverlayIsVisible" modal header="Edit this Artist" :style="{ width: '25rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="title" class="font-semibold w-24">Title</label>
      <InputText id="title" class="flex-auto" autocomplete="off" v-model="artist.name"/>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="editArtistOverlayIsVisible = false"/>
      <Button type="button" label="Save" severity="success" @click="editArtist()"></Button>
    </div>
  </Dialog>
</template>

<script setup>
import {ref} from 'vue';
import axios from 'axios';
import {defineProps} from 'vue';
import {useToast} from "primevue/usetoast";

const toast = useToast();

const emit = defineEmits(['pageUpdate']);
const editArtistOverlayIsVisible = ref(false);
const props = defineProps({
  artist: {
    _links: {
      self: {
        href: String,
      },
      artist: {
        href: String,
      },
    },
    name: String,
  }
});

async function deleteArtist() {
  try {
    await axios.delete(`${props.artist._links.self.href}`);
    showDeletionSuccess();
    emit('pageUpdate');
    console.log('Artist deleted');
  } catch (error) {
    console.error('Error deleting Artist:', error);
  }
}

function showDeletionSuccess() {
  toast.add({severity: 'success', summary: 'Artist successfully deleted', life: 3000});
}

async function editArtist() {
  try {
    await axios.put(`${props.artist._links.self.href}`, {
      name: props.artist.name,
    });
    editArtistOverlayIsVisible.value = false;
    showEditSuccess();
    emit('pageUpdate');
    console.log('Artist updated');
  } catch (error) {
    console.error('Error updating Artist:', error);
  }
}

function showEditSuccess() {
  toast.add({severity: 'success', summary: 'Artist successfully updated', life: 3000});
}

</script>