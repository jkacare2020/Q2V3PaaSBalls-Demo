// F:\My_App\quasar2v3\Q2V3PaaSBalls-Cleaned -Demo\src\pages\PageFront.vue
<template>
  <q-page class="q-pa-xl column items-center justify-center">
    <!-- Header Branding -->
    <div class="text-center q-mb-xl">
      <q-img
        src="/icons/apple-touch-icon.png"
        width="120px"
        height="120px"
        class="q-mb-md"
      />
      <div class="text-h4 text-primary text-weight-bold">IsmeHr</div>
      <div class="text-subtitle2 text-grey-7">
        AI-Powered Leather Care Assistant
      </div>
    </div>

    <!-- Highlighted Features -->
    <div class="q-gutter-xl row justify-center items-stretch q-mb-xl">
      <q-card
        class="feature-card"
        flat
        bordered
        clickable
        @click="$router.push('/vision-submit')"
      >
        <q-card-section class="q-pa-md">
          <q-icon name="science" size="xl" color="primary" />
          <div class="text-h6 q-mt-sm text-weight-medium">
            AI Cleaning Evaluation
          </div>
          <div class="text-caption q-mt-xs text-grey-7">
            Upload before & after photos. Let AI-4 Vision assess cleanliness and
            material quality.
          </div>
        </q-card-section>
      </q-card>

      <q-card
        class="feature-card"
        flat
        bordered
        clickable
        @click="$router.push('/detect-brand')"
      >
        <q-card-section class="q-pa-md">
          <q-icon name="inventory_2" size="xl" color="primary" />
          <div class="text-h6 q-mt-sm text-weight-medium">
            Product Suggestions
          </div>
          <div class="text-caption q-mt-xs text-grey-7">
            Get cleaner & conditioner product recommendations tailored to your
            bag’s leather type.
          </div>
        </q-card-section>
      </q-card>

      <q-card
        class="feature-card"
        flat
        bordered
        clickable
        @click="$router.push('/vision-bot')"
      >
        <q-card-section class="q-pa-md">
          <q-icon name="description" size="xl" color="primary" />
          <div class="text-h6 q-mt-sm text-weight-medium">
            Client PDF Reports
          </div>
          <div class="text-caption q-mt-xs text-grey-7">
            Export professional AI analysis reports for your cleaning clients.
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Quick Access -->
    <div class="q-gutter-md row justify-center">
      <q-btn
        color="deep-purple"
        label="Expert Persona Demo"
        icon="psychology"
        @click="$router.push('/expert-persona-demo')"
      />
      <q-btn
        color="info"
        icon="groups"
        label="Try v0.4 Multi-Persona Demo"
        @click="$router.push('/expert-persona-v4-demo')"
      />
      <q-btn
        color="primary"
        label="Chat with AI Assistant"
        icon="smart_toy"
        @click="$router.push('/chatbot')"
      />
      <q-btn
        color="accent"
        label="Go to Marketplace"
        icon="storefront"
        @click="$router.push('/marketplace')"
      />
      <q-btn
        color="secondary"
        label="Upload New Photo"
        icon="photo_camera"
        @click="showCameraChoice = true"
      />
    </div>

    <div class="text-caption text-grey-6 q-mt-xl">
      © 2025 IsmeHr – Your trusted AI assistant for leather restoration
    </div>
  </q-page>
  <q-dialog v-model="showCameraChoice" persistent>
    <q-card class="q-pa-md" style="min-width: 280px">
      <q-card-section class="text-h6">Select Upload Type</q-card-section>
      <q-separator />
      <q-card-section>
        <q-btn
          label="📸 Single Photo Capture"
          icon="photo_camera"
          class="q-mb-sm full-width"
          color="primary"
          @click="goToCamera('single')"
        />
        <q-btn
          label="🗂️ Batch Photo Capture"
          icon="collections"
          class="full-width"
          color="secondary"
          @click="goToCamera('batch')"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="grey"
          @click="showCameraChoice = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "PageFront",
  setup() {
    const showCameraChoice = ref(false);
    const router = useRouter();

    function goToCamera(type) {
      showCameraChoice.value = false;
      if (type === "single") {
        router.push("/camera");
      } else if (type === "batch") {
        router.push("/camera/batch");
      }
    }

    return {
      showCameraChoice,
      goToCamera,
    };
  },
  meta() {
    return {
      title: "IsmeHr | AI Cleaning & Leather Restoration Assistant",
      meta: [
        /*...*/
      ],
    };
  },
};
</script>

<style scoped>
.feature-card {
  width: 220px;
  min-height: 220px;
  text-align: center;
  transition: transform 0.2s ease;
}
.feature-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
</style>
