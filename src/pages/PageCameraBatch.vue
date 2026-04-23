<template>
  <q-page class="q-pa-md constrain-more">
    <div class="text-h6 q-mb-md">📸 Batch Photo Capture</div>

    <q-input
      v-model="batchCaption"
      label="Caption for All Photos"
      outlined
      dense
      class="q-mb-md"
      autofocus
      :rules="[
        (val) => !!val?.trim() || 'Caption is required before capturing photos',
      ]"
    />

    <div class="camera-fallback-wrapper" v-if="cameraUnavailable">
      <q-banner
        dense
        class="bg-red-2 text-red-10 q-pa-sm q-mb-sm text-center"
        rounded
      >
        📵 Camera not available. Please upload photos from your album below.
      </q-banner>
    </div>

    <div v-if="cameraAvailable" class="q-mb-md flex justify-center">
      <div class="camera-frame">
        <video ref="video" autoplay playsinline muted class="video-preview" />
      </div>
    </div>

    <!-- Select from Album -->
    <q-file
      v-model="localFiles"
      label="📁 Select Photos from Album"
      accept="image/*"
      multiple
      outlined
      dense
      class="q-mt-md flash-upload"
      @update:model-value="handleLocalFiles"
    />

    <!-- Buttons -->
    <div class="q-my-md text-center">
      <q-btn
        @click="captureImage"
        color="primary"
        icon="photo_camera"
        label="Capture"
        class="q-mr-sm"
        :disable="!batchCaption.trim()"
      />

      <q-btn
        @click="uploadBatch"
        :disable="capturedPhotos.length === 0 || !batchCaption.trim()"
        color="positive"
        icon="cloud_upload"
        label="Upload Batch"
      />
    </div>

    <!-- Preview Section -->
    <div class="row justify-start q-col-gutter-md">
      <div
        v-for="(photo, index) in capturedPhotos"
        :key="photo.id"
        class="thumbnail-wrapper relative-position"
      >
        <img :src="photo.previewUrl" class="thumbnail-image" alt="Captured" />

        <!-- ❌ Delete Button -->
        <q-btn
          round
          dense
          size="sm"
          icon="close"
          color="negative"
          class="delete-btn"
          @click="removePhoto(index)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { uid, useQuasar } from "quasar";
import { auth } from "src/firebase/init";
import { apiNode } from "boot/apiNode";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const video = ref(null);
const localFiles = ref([]);
const batchCaption = ref("");
const capturedPhotos = ref([]);
const cameraUnavailable = ref(false);
const cameraAvailable = ref(true);

const fileInputRef = ref(null);

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.value.srcObject = stream;
    cameraAvailable.value = true;
  } catch (err) {
    cameraAvailable.value = false;
    $q.dialog({
      title: "Notice",
      message: "Camera not available. Please upload photos from album.",
    });
    nextTick(() => {
      const el = document.querySelector(".flash-upload");
      if (el) el.focus();
    });
  }
});

onMounted(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.value.srcObject = stream;
  } catch (err) {
    cameraUnavailable.value = true;
    // $q.dialog({
    //   title: "Notice",
    //   message:
    //     "Camera not available on this device or permission was denied. You can still upload photos manually.",
    // });
  }
});

// 🎯 CAMERA CAPTURE
function captureImage() {
  const canvas = document.createElement("canvas");
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      const id = uid();
      const previewUrl = URL.createObjectURL(blob);
      capturedPhotos.value.push({ id, blob, previewUrl, source: "camera" });
    },
    "image/jpeg",
    0.9
  );
}

// 📁 LOCAL FILE PICKER
function handleLocalFiles(files) {
  for (const file of files) {
    const id = uid();
    const previewUrl = URL.createObjectURL(file);
    capturedPhotos.value.push({ id, blob: file, previewUrl, source: "album" });
  }
}

// ☁️ UPLOAD BATCH
async function uploadBatch() {
  const user = auth.currentUser;
  if (!user) return;

  const idToken = await user.getIdToken();
  $q.loading.show();

  try {
    for (const photo of capturedPhotos.value) {
      const formData = new FormData();
      formData.append("id", photo.id);
      formData.append("caption", batchCaption.value);
      formData.append("location", "");
      formData.append("date", Date.now());
      formData.append("file", photo.blob, `${photo.id}.jpg`);
      formData.append("tags", photo.source || "batch");

      await apiNode.post("/api/create-post", formData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
    }

    $q.notify({ message: "📤 Batch uploaded!", color: "positive" });
    capturedPhotos.value = [];
    batchCaption.value = "";
    localFiles.value = [];

    // 👇 Redirect to /photos
    router.push("/photos");
  } catch (err) {
    console.error(err);
    $q.dialog({ title: "Error", message: "Upload failed." });
  }

  $q.loading.hide();
}

function removePhoto(index) {
  const removed = capturedPhotos.value.splice(index, 1)[0];

  // Clean up preview URL
  if (removed?.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl);
  }

  // ✅ Remove from localFiles by name match (or blob reference)
  if (removed?.source === "album" && localFiles.value?.length) {
    localFiles.value = localFiles.value.filter(
      (file) => file.name !== removed.blob.name
    );
  }
}
</script>

<style scoped>
.thumbnail-wrapper {
  width: 140px; /* fixed width for thumbnail */
  margin-bottom: 16px;
}

.thumbnail-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ccc;
  object-fit: cover;
}

@media (max-width: 600px) {
  .thumbnail-wrapper {
    width: 45%; /* 2-per-row on small screens */
  }
}

.relative-position {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 5;
}

.camera-frame {
  width: 100%;
  max-width: 480px;
  aspect-ratio: 4 / 3;
  border: 2px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: auto;
  object-fit: cover;
}

@media (max-width: 600px) {
  .camera-frame {
    max-width: 100%;
  }
}

.camera-fallback-wrapper {
  max-width: 500px;
  margin: 12px auto;
}

.flash-upload {
  animation: flash-border 1s infinite alternate;
}
@keyframes flash-border {
  from {
    border: 2px solid #2196f3;
    box-shadow: 0 0 4px #2196f3;
  }
  to {
    border: 2px solid #ff9800;
    box-shadow: 0 0 8px #ff9800;
  }
}
</style>
