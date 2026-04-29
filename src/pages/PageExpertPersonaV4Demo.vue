// --- PageExpertPersonaV4Demo.vue
<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Hero Section -->
    <q-card flat bordered class="hero-card q-pa-lg q-mb-lg">
      <div class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <div class="text-overline text-info text-weight-bold">v0.4 Demo</div>

          <div class="text-h4 text-weight-bold q-mb-sm">
            Multi-Perspective Persona Engine
          </div>

          <div class="text-subtitle1 text-grey-7">
            Explore one decision through multiple perspectives — family,
            experience, and modern thinking.
          </div>
        </div>

        <div class="col-12 col-md-5">
          <q-banner rounded class="bg-info text-white">
            One question. Multiple voices. Better reflection.
          </q-banner>
        </div>
      </div>
    </q-card>

    <!-- Input Section -->
    <q-card flat bordered class="q-pa-md q-mb-lg input-card">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">
        What decision are you thinking about?
      </div>

      <div class="text-caption text-grey-7 q-mb-md">
        Describe a real decision you're facing — career, relationship, or
        family.
      </div>

      <q-input
        v-model="userQuestion"
        type="textarea"
        autogrow
        outlined
        label="Your question"
        placeholder="Example: Should I move to another city for a better job?"
      />

      <div class="row q-gutter-sm q-mt-md">
        <q-btn
          unelevated
          color="info"
          text-color="white"
          icon="psychology"
          label="Run Multi-Persona Demo"
          :loading="loading"
          @click="runDemo"
        />

        <q-btn
          outline
          color="info"
          icon="lightbulb"
          label="Use Example"
          @click="useExample"
        />

        <q-btn
          flat
          color="grey-8"
          icon="arrow_back"
          label="Back to v0.3"
          @click="$router.push('/expert-persona-demo')"
        />
      </div>
    </q-card>

    <!-- Persona Cards -->
    <div class="row q-col-gutter-md">
      <div
        v-for="persona in personas"
        :key="persona.key"
        class="col-12 col-md-4"
      >
        <q-card flat bordered class="persona-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="persona-icon q-mr-sm">
                {{ persona.icon }}
              </div>

              <div>
                <div class="text-h6 text-weight-bold">
                  {{ persona.name }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ persona.description }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="persona-answer">
            <!-- Thinking -->
            <div v-if="persona.loading" class="text-info flex items-center">
              <q-spinner-dots color="info" size="2em" class="q-mr-sm" />
              Thinking from this perspective...
            </div>

            <!-- Answer -->
            <div v-else-if="persona.answer" class="text-body2 whitespace">
              {{ persona.answer }}
            </div>

            <!-- Idle -->
            <div v-else class="text-grey-6 text-caption">
              Ask a question to see this perspective.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Decision Compare -->
    <q-card flat bordered class="q-pa-md q-mt-lg compare-card">
      <div class="row items-center q-mb-sm">
        <q-icon name="compare_arrows" color="info" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">Decision Compare</div>
      </div>

      <!-- 🔥 动态 summary -->
      <q-banner
        v-if="compareResult"
        rounded
        class="bg-grey-2 text-dark q-mb-md"
      >
        <div class="text-caption text-grey-7">Decision Insight</div>
        <div class="text-body1 text-weight-medium">
          {{ compareResult.summary }}
        </div>
      </q-banner>
      <div v-if="compareResult">
        <!-- <q-banner rounded class="bg-info text-white q-mb-md">
          {{ compareResult.summary }}
        </q-banner> -->

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Grandfather Value</div>
              <div class="text-body2 text-weight-medium">
                {{ compareResult.values?.grandfather }}
              </div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Grandmother Value</div>
              <div class="text-body2 text-weight-medium">
                {{ compareResult.values?.grandmother }}
              </div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Modern Value</div>
              <div class="text-body2 text-weight-medium">
                {{ compareResult.values?.modern }}
              </div>
            </q-card>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Trade-off</div>
              <div class="text-body2">
                {{ compareResult.tradeOff }}
              </div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Risks</div>
              <div class="text-body2">
                {{ compareResult.risks }}
              </div>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat class="mini-card">
              <div class="text-caption text-grey-7">Long-term Consequences</div>
              <div class="text-body2">
                {{ compareResult.longTerm }}
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <div v-else class="text-body2 text-grey-8">
        After the three perspectives respond, this area will summarize values,
        trade-offs, risks, and long-term consequences.
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { apiNode } from "boot/apiNode";

const loading = ref(false);
const compareResult = ref(null);

const userQuestion = ref(
  "Should I move to another city for a better job opportunity?",
);

const personas = ref([
  {
    key: "great_grandfather",
    icon: "👴",
    name: "Great Grandfather",
    description: "Traditional, stable, family-first, risk-aware.",
    style:
      "You are a wise great grandfather. Your tone is calm, serious, and caring. You value family stability, responsibility, patience, and long-term consequences. Do not force a decision. Ask thoughtful questions and guide gently.",
    answer: "",
    loading: false, // ✅ 新增
  },
  {
    key: "great_grandmother",
    icon: "👵",
    name: "Great Grandmother",
    description: "Warm, relational, emotionally wise.",
    style:
      "You are a warm great grandmother. Your tone is gentle, emotionally intelligent, and supportive. You value relationships, kindness, family harmony, and emotional maturity. Do not command. Help the user reflect.",
    answer: "",
    loading: false,
  },
  {
    key: "modern_expert",
    icon: "🧠",
    name: "Modern Advisor",
    description: "Practical, balanced, opportunity-aware.",
    style:
      "You are a modern practical advisor. Your tone is clear, balanced, and realistic. You value opportunity, independence, planning, risk management, and personal growth. Compare trade-offs clearly.",
    answer: "",
    loading: false,
  },
]);

function useExample() {
  userQuestion.value =
    "Should I move to another city for a better job opportunity?";
}

async function runDemo() {
  console.log("🔥 runDemo clicked");

  if (!userQuestion.value.trim()) return;

  compareResult.value = null;

  personas.value.forEach((p) => {
    p.answer = "";
    p.loading = true;
  });

  try {
    const { data } = await apiNode.post("/api/expert-persona/multi", {
      userQuestion: userQuestion.value,
    });

    console.log("✅ multi response:", data);

    const responseMap = data.responses || {};

    personas.value.forEach((p) => {
      if (p.key === "great_grandfather") {
        p.answer = responseMap.grandfather || "";
      }

      if (p.key === "great_grandmother") {
        p.answer = responseMap.grandmother || "";
      }

      if (p.key === "modern_expert") {
        p.answer = responseMap.modern || "";
      }

      p.loading = false;
    });

    compareResult.value = data.compare || null;
  } catch (err) {
    console.error("v0.5 multi persona error:", err);

    personas.value.forEach((p) => {
      p.loading = false;
    });

    personas.value[0].answer =
      "Error calling /api/expert-persona/multi. Check backend.";
  }
}
</script>

<style scoped>
.hero-card {
  border-radius: 18px;
  background: white;
}

.input-card,
.compare-card,
.persona-card {
  border-radius: 16px;
  background: white;
}

.persona-card {
  min-height: 320px;
}

.persona-icon {
  font-size: 34px;
}

.persona-answer {
  min-height: 210px;
}

.mini-card {
  border-radius: 12px;
  padding: 14px;
  background: #f5f7fa;
}

.whitespace {
  white-space: pre-line;
}
</style>
