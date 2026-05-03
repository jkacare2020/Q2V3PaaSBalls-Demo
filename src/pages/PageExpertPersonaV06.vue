<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="text-h5 text-weight-bold q-mb-sm">
      AI Cognitive Persona Engine V06
    </div>

    <div class="text-subtitle2 text-grey-7 q-mb-md">
      Persona-aligned decision advice with WHY reasoning.
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="text-h6 q-mb-md">Persona Setup</div>

      <q-input v-model="persona.identity.name" label="Name" class="q-mb-sm" />
      <q-input v-model="persona.identity.role" label="Role" class="q-mb-sm" />
      <q-input
        v-model="persona.identity.background"
        label="Background"
        class="q-mb-sm"
      />

      <q-input
        v-model="financialValuesText"
        label="Financial Values, comma separated"
        class="q-mb-sm"
      />

      <q-input
        v-model="persona.languageProfile.primaryLanguage"
        label="Primary Language"
        class="q-mb-sm"
      />

      <q-input
        v-model="persona.languageProfile.culturalContext"
        label="Cultural Context"
        class="q-mb-md"
      />

      <q-btn
        color="primary"
        label="Save Persona V06"
        :loading="saving"
        @click="savePersona"
      />
    </q-card>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="text-h6 q-mb-md">Ask V06</div>

      <q-input
        v-model="question"
        type="textarea"
        label="Question"
        autogrow
        class="q-mb-md"
      />

      <q-btn
        color="secondary"
        label="Generate V06 Answer"
        :loading="generating"
        @click="generateAnswer"
      />
    </q-card>

    <div class="text-caption text-grey-7 q-mb-sm">
      Domain: {{ result.domain || "N/A" }} | Philosophy:
      {{ result.philosophy || "N/A" }}
    </div>

    <q-card v-if="result.answer" flat bordered class="q-pa-md q-mb-md">
      <div class="text-h6 q-mb-sm">Answer</div>
      <div class="q-mb-md" style="white-space: pre-line">
        {{ result.answer }}
      </div>

      <q-separator class="q-my-md" />

      <!-- <div class="text-h6 q-mb-sm">WHY</div> -->
      <!-- 
      <div><b>Values:</b> {{ result.why?.values?.join(", ") }}</div>
      <div><b>Culture:</b> {{ result.why?.culture?.join(", ") }}</div>
      <div><b>Logic:</b> {{ result.why?.logic?.join(", ") }}</div>
      <div><b>Confidence:</b> {{ result.why?.confidence }}</div> -->

      <div class="q-mt-md text-caption text-grey-7">
        Mode: {{ result.personaMode }} | Depth: {{ result.depthLevel }}
      </div>
      <q-toggle v-model="showWhy" label="Show WHY" class="q-mb-md" />

      <div v-if="showWhy">
        <div><b>Values:</b> {{ result.why?.values?.join(", ") }}</div>
        <div><b>Culture:</b> {{ result.why?.culture?.join(", ") }}</div>
        <div><b>Logic:</b> {{ result.why?.logic?.join(", ") }}</div>
        <div><b>Confidence:</b> {{ result.why?.confidence }}</div>
      </div>
    </q-card>
    <div v-if="showWhy" class="q-mt-md">
      <q-separator class="q-my-md" />

      <div class="text-subtitle2 text-weight-bold">Next Actions</div>

      <div class="q-mt-sm">
        • Conservative option: {{ result.nextActions?.conservative }}
      </div>
      <div>• Balanced option: {{ result.nextActions?.balanced }}</div>
      <div>• Aggressive option: {{ result.nextActions?.aggressive }}</div>

      <q-separator class="q-my-md" />

      <div class="text-subtitle2 text-weight-bold">Risk Warning</div>
      <div class="text-negative">
        {{ result.riskWarning }}
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useQuasar } from "quasar";
import { apiNode } from "boot/apiNode";

const showWhy = ref(false);

const $q = useQuasar();

const userId = "test123";

const saving = ref(false);
const generating = ref(false);

const question = ref("Should I use leverage in business?");

const result = ref({});

const persona = reactive({
  userId,
  identity: {
    name: "Jason",
    role: "entrepreneur",
    background: "AI + business",
  },
  valueProfile: {
    financialValues: ["long-term growth", "risk control"],
    moralValues: [],
    familyValues: [],
    traditionValues: [],
  },
  languageProfile: {
    primaryLanguage: "en-US",
    outputLanguage: "en-US",
    culturalContext: "US business",
  },
});

const financialValuesText = computed({
  get() {
    return persona.valueProfile.financialValues.join(", ");
  },
  set(value) {
    persona.valueProfile.financialValues = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  },
});

async function savePersona() {
  try {
    saving.value = true;

    const { data } = await apiNode.post("/api/persona-v06/create", persona);

    $q.notify({
      type: "positive",
      message: data.message || "Persona V06 saved",
    });
  } catch (error) {
    console.error("savePersona error:", error);
    $q.notify({
      type: "negative",
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to save Persona V06",
    });
  } finally {
    saving.value = false;
  }
}

async function generateAnswer() {
  try {
    generating.value = true;

    const { data } = await apiNode.post("/api/persona-v06/generate", {
      userId,
      question: question.value,
    });

    result.value = data;
  } catch (error) {
    console.error("generateAnswer error:", error);
    $q.notify({
      type: "negative",
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate V06 answer",
    });
  } finally {
    generating.value = false;
  }
}
</script>
