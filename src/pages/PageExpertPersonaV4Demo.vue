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

      <div class="text-body2 text-grey-8 q-mb-md">
        After the three perspectives respond, this area helps the user compare
        values, trade-offs, risks, and long-term consequences.
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <q-card flat class="mini-card">
            <div class="text-caption text-grey-7">Stability</div>
            <div class="text-body2 text-weight-medium">What feels safe?</div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat class="mini-card">
            <div class="text-caption text-grey-7">Family Impact</div>
            <div class="text-body2 text-weight-medium">Who is affected?</div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat class="mini-card">
            <div class="text-caption text-grey-7">Growth</div>
            <div class="text-body2 text-weight-medium">
              What opportunity opens?
            </div>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat class="mini-card">
            <div class="text-caption text-grey-7">Risk</div>
            <div class="text-body2 text-weight-medium">
              What could go wrong?
            </div>
          </q-card>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { apiNode } from "boot/apiNode";

const loading = ref(false);

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
  if (!userQuestion.value.trim()) return;

  personas.value.forEach((p) => {
    p.answer = "";
    p.loading = true;
  });

  // ✅ 不 await Promise.all
  personas.value.forEach(async (persona) => {
    try {
      const prompt = `
Persona:
${persona.style}

User question:
${userQuestion.value}

Rules:
- Respond as this persona.
- Do not give a harsh command.
- Give caring guidance.
- Ask one thoughtful follow-up question.
- Show at least two trade-offs.
- Keep the answer concise and practical.
`;

      const { data } = await apiNode.post("/api/expert-persona/demo", {
        persona: persona.name,
        prompt,
        userQuestion: userQuestion.value,
      });

      // ✅ 谁先返回，谁先显示
      persona.answer =
        data.answer ||
        data.reply ||
        data.message ||
        JSON.stringify(data, null, 2);
    } catch (err) {
      console.error(`${persona.name} error:`, err);

      persona.answer = `Error: ${persona.name} could not respond.`;
    } finally {
      // ✅ 这个 persona 单独停止 loading
      persona.loading = false;
    }
  });
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
