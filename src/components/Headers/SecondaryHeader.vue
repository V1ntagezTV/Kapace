<template>
  <div class="secondary-header__main">
    <UnauthorizedUserComponent
      v-if="OptionsApi.HIDE_USER_ACTIVITIES"
      class="nav-main"
    />
  </div>
</template>

<script>
import {OptionsApi} from "@/options/OptionsApi";
import UnauthorizedUserComponent from "@/components/Headers/UnauthorizedUserComponent.vue";

export default {
name: 'App',
  components: {UnauthorizedUserComponent},
  computed: {
    OptionsApi() {
      return OptionsApi
    }
  }
}
</script>