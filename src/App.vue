<template>
  <Toolbar>
    <template #start>
      <RouterLink to="/songs">
        <Button label="Songs" style="margin-right: 10px"/>
      </RouterLink>
      <RouterLink to="/artists">
        <Button label="Artists" style="margin-right: 10px"/>
      </RouterLink>
    </template>

    <template #center>
      <h1>Welcome to the Music App</h1>
    </template>

  </Toolbar>

  <RouterView/>
</template>

<script setup>
</script>