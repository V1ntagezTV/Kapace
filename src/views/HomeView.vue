<template>
  <div>
    <BaseBody />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import BaseBody from "@/components/Body/BaseBody.vue";

@Options({
  components: {
    BaseBody,
  }
})
export default class HomeView extends Vue {
}
</script>
