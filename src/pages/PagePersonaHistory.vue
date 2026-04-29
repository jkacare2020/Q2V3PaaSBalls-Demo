<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="text-h5 text-weight-bold q-mb-sm">Persona Decision History</div>

    <div class="text-subtitle2 text-grey-7 q-mb-md">
      Review previous multi-perspective decisions and AI summaries.
    </div>

    <q-btn
      unelevated
      color="info"
      icon="refresh"
      label="Refresh"
      :loading="loading"
      class="q-mb-md"
      @click="loadHistory"
    />

    <q-card
      v-for="s in sessions"
      :key="s._id"
      flat
      bordered
      class="q-pa-md q-mb-md"
    >
      <div class="row items-start justify-between q-gutter-sm">
        <div class="col">
          <div class="text-subtitle1 text-weight-bold">
            {{ s.question }}
          </div>

          <div class="text-caption text-grey-6 q-mt-xs">
            {{ new Date(s.createdAt).toLocaleString() }}
          </div>
        </div>

        <q-icon name="star" color="amber" size="sm" />
      </div>

      <q-banner rounded class="bg-grey-2 text-dark q-mt-sm">
        <div class="text-caption text-grey-7">Decision Insight</div>
        <div class="text-body2 q-mb-sm">
          {{ s.compare?.summary }}
        </div>

        <div class="text-caption text-grey-7 q-mt-sm">Trade-off</div>
        <div class="text-body2">
          {{ s.compare?.tradeOff }}
        </div>
      </q-banner>

      <div class="row q-gutter-sm q-mt-sm">
        <q-btn
          flat
          color="info"
          icon="replay"
          label="Re-run"
          @click="
            $router.push(
              '/expert-persona-v4-demo?question=' +
                encodeURIComponent(s.question),
            )
          "
        />

        <q-btn flat color="grey-8" icon="visibility" label="View Details" />
      </div>

      <q-expansion-item
        icon="groups"
        label="View persona responses"
        class="q-mt-sm"
      >
        <q-card flat class="q-pa-sm bg-grey-1">
          <div class="text-caption text-grey-7">Grandfather</div>
          <div class="q-mb-sm whitespace">
            {{ s.responses?.grandfather }}
          </div>

          <div class="text-caption text-grey-7">Grandmother</div>
          <div class="q-mb-sm whitespace">
            {{ s.responses?.grandmother }}
          </div>

          <div class="text-caption text-grey-7">Modern Advisor</div>
          <div class="whitespace">
            {{ s.responses?.modern }}
          </div>
        </q-card>
      </q-expansion-item>
    </q-card>

    <div v-if="!loading && sessions.length === 0" class="text-grey-6">
      No history yet.
    </div>
  </q-page>
</template>

<style scoped>
.whitespace {
  white-space: pre-line;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { apiNode } from "boot/apiNode";

const sessions = ref([]);
const loading = ref(false);

async function loadHistory() {
  loading.value = true;

  try {
    const { data } = await apiNode.get("/api/expert-persona/history");
    sessions.value = data.sessions || [];
  } catch (err) {
    console.error("load persona history error:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadHistory);
</script>
