<template>
  <q-dialog v-model="showDialog">
    <q-card style="min-width: 420px; max-width: 700px">
      <q-card-section>
        <div class="text-h6">{{ selectedPersona?.name }}</div>
        <!-- 👇 加这一行 -->
        <div class="text-caption text-primary text-weight-medium">
          👤 {{ selectedPersona?.expertName || "Unassigned" }}
        </div>
        <div class="text-caption text-grey-7">
          {{ selectedPersona?.philosophy }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-mb-sm">
          <b>Priority:</b>
          {{ selectedPersona?.priorityOrder?.join(" → ") }}
        </div>

        <div class="q-mb-sm">
          <b>Signature:</b>
          {{ selectedPersona?.signatureStyle }}
        </div>

        <div class="q-mb-sm">
          <b>Tradeoff:</b>
          Flavor {{ selectedPersona?.tradeoff?.flavor }}, Speed
          {{ selectedPersona?.tradeoff?.speed }}, Cost
          {{ selectedPersona?.tradeoff?.cost }}
        </div>

        <div class="q-mb-sm">
          <b>Decision Logic:</b>
          <div
            v-for="(step, i) in selectedPersona?.decisionLogic || []"
            :key="'d-' + i"
          >
            {{ i + 1 }}. {{ step }}
          </div>
        </div>

        <div class="q-mb-sm">
          <b>Common Mistakes:</b>
          <div
            v-for="(m, i) in selectedPersona?.commonMistakes || []"
            :key="'m-' + i"
          >
            • {{ m }}
          </div>
        </div>

        <div class="q-mb-sm">
          <b>Coaching Principles:</b>
          <div
            v-for="(c, i) in selectedPersona?.coachingPrinciples || []"
            :key="'c-' + i"
          >
            • {{ c }}
          </div>
        </div>

        <div class="q-mt-md text-caption text-grey-7">
          Source: {{ selectedPersona?.sourceTranscript }}
        </div>

        <div class="q-mt-md">
          <!-- 输入框 -->
          <q-input
            v-model="question"
            :label="`Ask ${selectedPersona?.expertName || selectedPersona?.name || 'Expert'}...`"
            outlined
            dense
          />

          <!-- 按钮 -->
          <q-btn
            class="q-mt-sm"
            label="Ask"
            color="primary"
            @click="askExpertFromPersona"
          />

          <!-- 回答 -->
          <div v-if="answer" class="q-mt-md">
            <div class="text-caption text-grey-6">Answer</div>
            <div class="text-body2">{{ answer }}</div>
          </div>
          <q-separator class="q-my-md" />

          <div v-if="activeVideoAnalysis">
            <div class="text-caption text-grey-6">Video Analysis</div>

            <div class="text-body2 text-weight-medium">
              {{ activeVideoAnalysis.title }}
            </div>

            <video
              v-if="activeVideoAnalysis.videoUrl"
              :src="activeVideoAnalysis.videoUrl"
              controls
              style="width: 100%; margin-top: 8px"
            />

            <div class="q-mt-sm text-caption text-grey-7">
              {{ activeVideoAnalysis.caption }}
            </div>

            <q-expansion-item label="View Analysis Details" dense>
              <div class="q-pa-sm">
                <div><b>Transcript:</b></div>
                <div class="text-body2">
                  {{ activeVideoAnalysis.transcript }}
                </div>

                <div class="q-mt-sm"><b>Signals:</b></div>
                <pre>{{ activeVideoAnalysis.extractedSignals }}</pre>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-page class="bg-grey-1">
    <div class="q-pa-lg q-pa-xl-md" style="max-width: 1400px; margin: 0 auto">
      <!-- Hero -->
      <div class="text-center q-mb-xl">
        <div class="text-h3 text-weight-bold text-primary">
          AI Expert Persona Engine
        </div>
        <q-card flat bordered class="q-pa-lg q-mb-xl">
          <div class="text-h6 text-weight-bold q-mb-sm">
            Expert Capture Panel
          </div>

          <div class="text-body2 text-grey-7 q-mb-md">
            Capture expert voice or text responses, then convert them into a
            reusable AI persona.
          </div>

          <div class="q-mb-md">
            <div
              v-for="(question, index) in captureQuestions"
              :key="index"
              class="q-mb-sm text-body2"
            >
              <span class="text-weight-medium">{{ index + 1 }}.</span>
              {{ question }}
            </div>
          </div>
          <q-select
            v-model="selectedExpert"
            :options="expertOptions"
            option-label="expertName"
          />

          <q-btn label="+ New Expert" @click="showExpertDialog = true" />
          <q-input
            v-model="transcript"
            type="textarea"
            outlined
            autogrow
            label="Expert transcript"
            hint="Paste STT transcript here, or later connect live speech-to-text"
            class="q-mb-md"
          />

          <div
            v-if="!speechSupported"
            class="text-caption text-negative q-mb-md"
          >
            Web Speech API is not supported in this browser. You can still paste
            transcript text manually.
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-auto" v-if="speechSupported">
              <q-btn
                color="deep-orange"
                unelevated
                :label="isListening ? 'Listening...' : 'Start Voice Input'"
                :icon="isListening ? 'mic' : 'keyboard_voice'"
                @click="startListening"
              />
            </div>

            <div class="col-auto" v-if="speechSupported && isListening">
              <q-btn
                outline
                color="deep-orange"
                label="Stop"
                icon="stop"
                @click="stopListening"
              />
            </div>

            <div class="col-auto">
              <q-btn
                color="primary"
                unelevated
                label="Generate Persona"
                :loading="isGeneratingPersona"
                @click="generatePersona"
              />
            </div>

            <div class="col-auto">
              <q-btn
                outline
                color="primary"
                label="Add Persona Card"
                :disable="!generatedPersona"
                @click="addGeneratedPersonaCard"
              />
            </div>
          </div>

          <q-card
            v-if="generatedPersona"
            flat
            class="q-pa-md bg-grey-1"
            style="border-radius: 14px"
          >
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              Generated Persona Summary
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Priority Order</div>
              <div class="text-body2">
                {{ generatedPersona.priorityOrder?.join(" → ") || "N/A" }}
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Signature Style</div>
              <div class="text-body2">
                {{ generatedPersona.signatureStyle || "N/A" }}
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Common Mistakes</div>
              <div
                v-for="(item, index) in generatedPersona.commonMistakes || []"
                :key="'mistake-' + index"
                class="text-body2"
              >
                • {{ item }}
              </div>
              <div
                v-if="!generatedPersona.commonMistakes?.length"
                class="text-body2"
              >
                N/A
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Decision Logic</div>
              <div
                v-for="(step, index) in generatedPersona.decisionLogic || []"
                :key="'logic-' + index"
                class="text-body2"
              >
                {{ index + 1 }}. {{ step }}
              </div>
              <div
                v-if="!generatedPersona.decisionLogic?.length"
                class="text-body2"
              >
                N/A
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Trade-off Profile</div>
              <div class="text-body2">
                Flavor: {{ generatedPersona.tradeoff?.flavor || "N/A" }}, Speed:
                {{ generatedPersona.tradeoff?.speed || "N/A" }}, Cost:
                {{ generatedPersona.tradeoff?.cost || "N/A" }}
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-caption text-grey-7">Coaching Principles</div>
              <div
                v-for="(item, index) in generatedPersona.coachingPrinciples ||
                []"
                :key="'coach-' + index"
                class="text-body2"
              >
                • {{ item }}
              </div>
              <div
                v-if="!generatedPersona.coachingPrinciples?.length"
                class="text-body2"
              >
                N/A
              </div>
            </div>
          </q-card>
        </q-card>

        <div class="q-mt-md">
          <div
            v-for="p in personaList"
            :key="p._id"
            class="q-pa-sm q-mb-sm bg-grey-2"
          >
            <div class="row items-center justify-between">
              <div>
                <div class="text-subtitle1">{{ p.name }}</div>
                <div class="text-caption text-primary">
                  Expert: {{ p.expertName || "Unassigned" }}
                </div>
                <div class="text-caption text-grey-7">{{ p.philosophy }}</div>
                <div class="text-body2">
                  {{ p.priorityOrder?.join(" → ") }}
                </div>
              </div>

              <div class="row items-center q-gutter-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="View"
                  @click="viewPersona(p)"
                />

                <q-btn
                  flat
                  dense
                  color="negative"
                  label="Delete"
                  @click="deletePersona(p._id)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="text-h5 q-mt-md text-grey-9 text-weight-medium">
          Capture senior expertise once, deploy everywhere
        </div>

        <div class="text-subtitle1 q-mt-sm text-grey-7">
          Digitize senior expertise into repeatable AI decision agents
        </div>

        <div
          class="text-body2 q-mt-sm text-grey-6"
          style="max-width: 900px; margin: 0 auto"
        >
          This demo shows how the same input can produce different expert
          outcomes based on role, philosophy, and commercial objective.
        </div>
      </div>

      <!-- Input Panel -->
      <q-card flat bordered class="q-pa-md q-mb-xl rounded-borders">
        <div class="text-h6 text-weight-medium q-mb-xs">
          Live Comparison Demo
        </div>

        <div class="text-body2 text-grey-7 q-mb-md">
          Same input. Three expert personas. Three different decision
          frameworks.
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="demoInput.ingredients"
              label="Ingredients"
              outlined
              hint="Example: chicken thigh, potato, onion, cream"
            />
          </div>

          <div class="col-6 col-md-2">
            <q-input v-model="demoInput.time" label="Time" outlined />
          </div>

          <div class="col-6 col-md-2">
            <q-input v-model="demoInput.people" label="People" outlined />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="demoInput.goal"
              label="Goal"
              outlined
              hint="Example: premium dinner / healthy family meal / cost control"
            />
          </div>
        </div>

        <div class="q-mt-md row q-col-gutter-sm items-center">
          <div class="col-auto">
            <q-btn
              color="primary"
              unelevated
              label="Compare Expert Personas"
              @click="runDemo"
            />
          </div>

          <div class="col-auto">
            <q-btn
              outline
              color="primary"
              label="Premium Dining"
              @click="loadScenario('premium')"
            />
          </div>

          <div class="col-auto">
            <q-btn
              outline
              color="primary"
              label="Family Meal"
              @click="loadScenario('family')"
            />
          </div>

          <div class="col-auto">
            <q-btn
              outline
              color="primary"
              label="Cost Control"
              @click="loadScenario('cost')"
            />
          </div>
        </div>
      </q-card>

      <!-- Persona Cards -->
      <q-card flat bordered class="q-pa-md q-mb-md bg-white">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-7">Input Ingredients</div>
            <div class="text-body1 text-weight-medium">
              {{ demoInput.ingredients }}
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="text-caption text-grey-7">Time</div>
            <div class="text-body1 text-weight-medium">
              {{ demoInput.time }}
            </div>
          </div>
          <div class="col-6 col-md-2">
            <div class="text-caption text-grey-7">People</div>
            <div class="text-body1 text-weight-medium">
              {{ demoInput.people }}
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption text-grey-7">Goal</div>
            <div class="text-body1 text-weight-medium">
              {{ demoInput.goal }}
            </div>
          </div>
        </div>
      </q-card>
      <div class="row q-col-gutter-lg q-mb-xl">
        <div v-for="chef in chefs" :key="chef.name" class="col-12 col-md-4">
          <q-card flat bordered class="persona-card full-height">
            <q-card-section class="column full-height">
              <div class="row items-center justify-between q-mb-sm">
                <div>
                  <div class="text-h6 text-weight-bold">
                    {{ chef.name }}
                  </div>
                  <div class="text-subtitle2 text-grey-7">
                    {{ chef.role }}
                  </div>
                </div>

                <q-badge color="primary" outline>
                  {{ chef.tag }}
                </q-badge>
              </div>

              <div class="persona-image q-mb-md flex flex-center">
                <div
                  :class="[
                    'persona-image',
                    chef.themeClass,
                    'q-mb-md',
                    'q-pa-md',
                    'column',
                    'justify-between',
                  ]"
                >
                  <div class="row items-start justify-between">
                    <q-badge
                      color="white"
                      text-color="primary"
                      class="text-weight-medium"
                    >
                      {{ chef.tag }}
                    </q-badge>

                    <div class="text-caption text-white text-right">
                      Persona View
                    </div>
                  </div>

                  <div>
                    <div class="text-h6 text-white text-weight-bold">
                      {{ chef.visualTitle }}
                    </div>
                    <div class="text-body2 text-white q-mt-xs">
                      {{ chef.visualSubtitle }}
                    </div>
                  </div>

                  <div class="text-caption text-white-7">
                    {{ chef.imageLabel }}
                  </div>
                </div>
              </div>

              <div class="text-subtitle2 text-weight-medium q-mb-xs">
                Decision Philosophy
              </div>
              <div class="text-body2 text-grey-8 q-mb-md">
                {{ chef.philosophy }}
              </div>

              <div class="text-subtitle2 text-weight-medium q-mb-xs">
                Recommended Outcome
              </div>
              <div class="text-body1 q-mb-md dish-box">
                {{ chef.dish }}
              </div>

              <div class="text-subtitle2 text-weight-medium q-mb-xs">
                Decision Logic
              </div>
              <div class="text-body2 text-grey-8 q-mb-md reasoning-box">
                {{ chef.reasoning }}
              </div>

              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-4">
                  <q-card flat class="metric-box">
                    <div class="text-caption text-grey-7">Flavor</div>
                    <div class="text-weight-bold">
                      {{ chef.metrics.flavor }}
                    </div>
                  </q-card>
                </div>
                <div class="col-4">
                  <q-card flat class="metric-box">
                    <div class="text-caption text-grey-7">Speed</div>
                    <div class="text-weight-bold">{{ chef.metrics.speed }}</div>
                  </q-card>
                </div>
                <div class="col-4">
                  <q-card flat class="metric-box">
                    <div class="text-caption text-grey-7">Cost</div>
                    <div class="text-weight-bold">{{ chef.metrics.cost }}</div>
                  </q-card>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-caption text-grey-7">Commercial fit</div>
              <div class="text-body2 commercial-fit-box">
                {{ chef.commercialFit }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Why it matters -->
      <q-card flat bordered class="q-pa-lg q-mb-xl">
        <div class="text-h6 text-weight-bold q-mb-md">
          Why this becomes a platform
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-4">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              Repeatable decision quality
            </div>
            <div class="text-body2 text-grey-8">
              The same input can be evaluated through different expert
              philosophies with repeatable logic.
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              Expertise at scale
            </div>
            <div class="text-body2 text-grey-8">
              Organizations can digitize senior expertise and deliver it across
              teams, customers, and locations.
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">
              Cross-industry deployment
            </div>
            <div class="text-body2 text-grey-8">
              Today: chefs. Tomorrow: healthcare copilots, cleaning experts,
              merchant advisors, and training assistants.
            </div>
          </div>
        </div>
      </q-card>

      <!-- Expansion -->
      <q-card flat bordered class="q-pa-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Platform Expansion</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="expand-box">
              <div class="text-subtitle1 text-weight-medium">
                Healthcare Copilot
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                Evidence-aware specialist assistant with structured reasoning.
              </div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="expand-box">
              <div class="text-subtitle1 text-weight-medium">
                Cleaning Expert
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                Stain analysis, treatment strategy, and product recommendation.
              </div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="expand-box">
              <div class="text-subtitle1 text-weight-medium">
                Merchant Advisor
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                Product positioning, pricing logic, and customer-facing
                recommendations.
              </div>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat class="expand-box">
              <div class="text-subtitle1 text-weight-medium">
                Training Agent
              </div>
              <div class="text-body2 text-grey-7 q-mt-sm">
                Capture senior know-how and turn it into guided workflows for
                teams.
              </div>
            </q-card>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>

  <q-dialog v-model="showExpertDialog">
    <q-card class="q-pa-md" style="min-width: 300px">
      <div class="text-h6 q-mb-md">Create Expert</div>

      <q-input v-model="newExpertName" label="Expert Name" />

      <div class="row q-mt-md justify-end">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn color="primary" label="Create" @click="createExpert" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { apiNode } from "src/boot/apiNode";
import { useQuasar } from "quasar";
import { useStoreAuth } from "stores/storeAuth";

const storeAuth = useStoreAuth();

const userId = computed(() => storeAuth.user?.uid);

const $q = useQuasar();

const demoInput = ref({
  ingredients: "chicken thigh, potato, onion, cream",
  time: "30 min",
  people: "4",
  goal: "premium dinner",
});

const question = ref("");
const answer = ref("");

let recognitionActive = false;

const chefs = ref([]);

const scenarios = {
  premium: {
    input: {
      ingredients: "chicken thigh, potato, onion, cream",
      time: "30 min",
      people: "4",
      goal: "premium dinner",
    },
    chefs: [
      {
        name: "Chef Laurent",
        role: "Fine Dining Expert",
        tag: "Premium",
        themeClass: "theme-laurent",
        visualTitle: "Premium plated dining outcome",
        visualSubtitle:
          "Refined presentation, controlled texture, elegant restraint",
        imageLabel: "Elegant plated dish visual placeholder",
        philosophy:
          "Quality and elegance over speed. Fewer components, executed with precision.",
        dish: "Crispy Chicken Thigh with Cream-Glazed Potatoes",
        reasoning:
          "Prioritizes texture, heat control, and restrained flavor. The dish is designed to feel restaurant-grade while still feasible in a home kitchen.",
        metrics: {
          flavor: "9.5/10",
          speed: "6/10",
          cost: "5/10",
        },
        commercialFit:
          "Luxury dining, hospitality, premium consumer experiences",
      },
      {
        name: "Chef Maya",
        role: "Home Nutrition Expert",
        tag: "Family",
        themeClass: "theme-maya",
        visualTitle: "Home-friendly healthy meal",
        visualSubtitle: "Warm, achievable, family-centered cooking logic",
        imageLabel: "Warm home-style meal visual placeholder",
        philosophy:
          "Healthy, simple, and achievable. Reduce complexity while keeping comfort and nutrition.",
        dish: "Comfort Chicken and Potato Skillet",
        reasoning:
          "Optimizes for family cooking with fewer steps, lower stress, and practical ingredient use. Designed to be repeatable by everyday users.",
        metrics: {
          flavor: "8/10",
          speed: "9/10",
          cost: "8/10",
        },
        commercialFit: "Consumer apps, wellness, family meal planning",
      },
      {
        name: "Chef Chen",
        role: "Commercial Kitchen Expert",
        tag: "Operations",
        themeClass: "theme-chen",
        visualTitle: "Standardized kitchen output",
        visualSubtitle: "Scalable execution, prep efficiency, margin awareness",
        imageLabel: "Standardized kitchen output visual placeholder",
        philosophy:
          "Consistency and margins first. Standardize process, reduce waste, and support scalable execution.",
        dish: "Batch-Ready Chicken Potato Service Plate",
        reasoning:
          "Focuses on reproducibility, prep efficiency, and cost control. Best suited for restaurants, chains, and operational environments.",
        metrics: {
          flavor: "7.5/10",
          speed: "8.5/10",
          cost: "9/10",
        },
        commercialFit: "Restaurants, chain operations, food service management",
      },
    ],
  },

  family: {
    input: {
      ingredients: "chicken breast, broccoli, rice, carrot",
      time: "20 min",
      people: "3",
      goal: "healthy family meal",
    },
    chefs: [
      {
        name: "Chef Laurent",
        role: "Fine Dining Expert",
        tag: "Premium",
        themeClass: "theme-laurent",
        visualTitle: "Refined family-style plating",
        visualSubtitle: "Balanced nutrition with elevated presentation",
        imageLabel: "Elegant family dinner visual placeholder",
        philosophy:
          "Even simple meals should preserve structure, texture, and dignity on the plate.",
        dish: "Seared Chicken with Buttered Rice and Glazed Vegetables",
        reasoning:
          "Transforms basic household ingredients into a more refined composition without losing practicality.",
        metrics: {
          flavor: "8.8/10",
          speed: "7/10",
          cost: "7/10",
        },
        commercialFit: "Premium meal kits, upscale family dining concepts",
      },
      {
        name: "Chef Maya",
        role: "Home Nutrition Expert",
        tag: "Family",
        themeClass: "theme-maya",
        visualTitle: "Fast nutritious family dinner",
        visualSubtitle: "Simple prep, balanced macros, kid-friendly structure",
        imageLabel: "Healthy home meal visual placeholder",
        philosophy:
          "Meals should be nourishing, fast, and low-stress for real households.",
        dish: "One-Pan Chicken, Rice, and Veggie Bowl",
        reasoning:
          "Minimizes cleanup, supports nutrition, and keeps technique approachable for busy families.",
        metrics: {
          flavor: "8.5/10",
          speed: "9.5/10",
          cost: "8.5/10",
        },
        commercialFit: "Family wellness apps, meal planning subscriptions",
      },
      {
        name: "Chef Chen",
        role: "Commercial Kitchen Expert",
        tag: "Operations",
        themeClass: "theme-chen",
        visualTitle: "Meal-prep ready service format",
        visualSubtitle: "Portion control, repeatability, and throughput",
        imageLabel: "Batch family meal visual placeholder",
        philosophy:
          "Use standard portions and parallel prep for consistent output.",
        dish: "Portioned Chicken Rice Meal Box",
        reasoning:
          "Builds a repeatable format suitable for schools, cafeterias, and prepared meal services.",
        metrics: {
          flavor: "7.8/10",
          speed: "8.8/10",
          cost: "9.2/10",
        },
        commercialFit:
          "Meal prep brands, school food service, delivery kitchens",
      },
    ],
  },

  cost: {
    input: {
      ingredients: "chicken leg, potato, cabbage, onion",
      time: "35 min",
      people: "5",
      goal: "cost control",
    },
    chefs: [
      {
        name: "Chef Laurent",
        role: "Fine Dining Expert",
        tag: "Premium",
        themeClass: "theme-laurent",
        visualTitle: "Budget ingredients, premium treatment",
        visualSubtitle: "Technique used to elevate lower-cost components",
        imageLabel: "Elevated budget dish visual placeholder",
        philosophy:
          "Great technique can create perceived luxury from humble ingredients.",
        dish: "Roasted Chicken Leg with Braised Cabbage and Crisp Potatoes",
        reasoning:
          "Uses texture contrast and disciplined plating to raise ingredient value perception.",
        metrics: {
          flavor: "9/10",
          speed: "6.5/10",
          cost: "7.5/10",
        },
        commercialFit: "Value-premium hospitality, chef-driven casual dining",
      },
      {
        name: "Chef Maya",
        role: "Home Nutrition Expert",
        tag: "Family",
        themeClass: "theme-maya",
        visualTitle: "Budget-conscious home cooking",
        visualSubtitle: "Affordable, filling, and nutritionally sensible",
        imageLabel: "Affordable family dish visual placeholder",
        philosophy:
          "Stretch ingredients intelligently without sacrificing comfort or nutrition.",
        dish: "Hearty Chicken and Cabbage Potato Skillet",
        reasoning:
          "Maximizes satiety, reduces waste, and keeps prep simple for regular family use.",
        metrics: {
          flavor: "8/10",
          speed: "8.5/10",
          cost: "9.3/10",
        },
        commercialFit: "Budget meal planning, family savings products",
      },
      {
        name: "Chef Chen",
        role: "Commercial Kitchen Expert",
        tag: "Operations",
        themeClass: "theme-chen",
        visualTitle: "Margin-first service design",
        visualSubtitle:
          "Ingredient efficiency, yield control, standardized prep",
        imageLabel: "Operational cost-control dish visual placeholder",
        philosophy:
          "Design around margin, labor efficiency, and stable output under pressure.",
        dish: "High-Yield Chicken Potato Service Tray",
        reasoning:
          "Optimizes labor, ingredient yield, and purchasing predictability for scaled operations.",
        metrics: {
          flavor: "7.2/10",
          speed: "9/10",
          cost: "9.8/10",
        },
        commercialFit: "Chains, cafeterias, institutional food operations",
      },
    ],
  },
};

const selectedExpert = ref(null);
const expertOptions = ref([]);

const showExpertDialog = ref(false);
const newExpertName = ref("");

async function loadExperts() {
  if (!userId.value) return;

  const { data } = await apiNode.get(`/api/expert/${userId.value}`);
  expertOptions.value = data;

  // 👇 补这一段
  if (!selectedExpert.value && data.length) {
    selectedExpert.value = data[0];
  }
}
async function createExpert() {
  if (!newExpertName.value || !userId.value) return;

  const payload = {
    userId: userId.value,
    expertId: `chef_${Date.now()}`,
    expertName: newExpertName.value,
  };

  const { data } = await apiNode.post("/api/expert", payload);

  expertOptions.value.unshift(data);
  selectedExpert.value = data;

  newExpertName.value = "";
  showExpertDialog.value = false;
}

function loadScenario(type) {
  const scenario = scenarios[type];
  if (!scenario) return;

  demoInput.value = { ...scenario.input };
  chefs.value = scenario.chefs;
}

function runDemo() {
  chefs.value = [
    {
      name: "Chef Laurent",
      role: "Fine Dining Expert",
      tag: "Premium",
      themeClass: "theme-laurent",
      imageLabel: "Elegant plated dish visual placeholder",
      visualTitle: "Premium plated dining outcome",
      visualSubtitle:
        "Refined presentation, controlled texture, elegant restraint",
      imageLabel: "Elegant plated dish visual placeholder",
      philosophy:
        "Quality and elegance over speed. Fewer components, executed with precision.",
      dish: "Crispy Chicken Thigh with Cream-Glazed Potatoes",
      reasoning:
        "Prioritizes texture, heat control, and restrained flavor. The dish is designed to feel restaurant-grade while still feasible in a home kitchen.",
      metrics: {
        flavor: "9.5/10",
        speed: "6/10",
        cost: "5/10",
      },
      commercialFit: "Luxury dining, hospitality, premium consumer experiences",
    },
    {
      name: "Chef Maya",
      role: "Home Nutrition Expert",
      tag: "Family",
      themeClass: "theme-maya",
      visualTitle: "Home-friendly healthy meal",
      visualSubtitle: "Warm, achievable, family-centered cooking logic",
      imageLabel: "Warm home-style meal visual placeholder",
      philosophy:
        "Healthy, simple, and achievable. Reduce complexity while keeping comfort and nutrition.",
      dish: "Comfort Chicken and Potato Skillet",
      reasoning:
        "Optimizes for family cooking with fewer steps, lower stress, and practical ingredient use. Designed to be repeatable by everyday users.",
      metrics: {
        flavor: "8/10",
        speed: "9/10",
        cost: "8/10",
      },
      commercialFit: "Consumer apps, wellness, family meal planning",
    },
    {
      name: "Chef Chen",
      role: "Commercial Kitchen Expert",
      tag: "Operations",
      themeClass: "theme-chen",
      visualTitle: "Standardized kitchen output",
      visualSubtitle: "Scalable execution, prep efficiency, margin awareness",
      imageLabel: "Standardized kitchen output visual placeholder",
      philosophy:
        "Consistency and margins first. Standardize process, reduce waste, and support scalable execution.",
      dish: "Batch-Ready Chicken Potato Service Plate",
      reasoning:
        "Focuses on reproducibility, prep efficiency, and cost control. Best suited for restaurants, chains, and operational environments.",
      metrics: {
        flavor: "7.5/10",
        speed: "8.5/10",
        cost: "9/10",
      },
      commercialFit: "Restaurants, chain operations, food service management",
    },
  ];
}

const captureQuestions = [
  "What do you prioritize first when cooking this dish?",
  "What is the one thing you refuse to compromise?",
  "How do you balance flavor, speed, and cost?",
  "What mistake do beginners make most often?",
  "How would you describe your cooking philosophy in one sentence?",
];

const transcript = ref("");
const generatedPersona = ref(null);
const isGeneratingPersona = ref(false);

const isListening = ref(false);
const speechSupported = ref(false);
let recognition = null;

function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    speechSupported.value = false;
    return;
  }

  speechSupported.value = true;
  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("STT started");
    isListening.value = true;
    recognitionActive = true;
  };

  recognition.onend = () => {
    console.log("STT ended");
    isListening.value = false;
    recognitionActive = false;
  };

  recognition.onresult = (event) => {
    console.log("STT result event:", event);

    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      console.log("segment:", text, "isFinal:", event.results[i].isFinal);

      if (event.results[i].isFinal) {
        finalTranscript += text + " ";
      } else {
        interimTranscript += text;
      }
    }

    transcript.value = `${finalTranscript}${interimTranscript}`.trim();
    console.log("transcript.value =", transcript.value);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isListening.value = false;
    recognitionActive = false;
  };
}

function startListening() {
  if (!recognition) {
    console.log("recognition not initialized");
    return;
  }

  if (isListening.value || recognitionActive) {
    console.log("Already listening, ignoring duplicate start");
    return;
  }

  try {
    recognition.start();
  } catch (err) {
    console.error("recognition.start failed:", err);
  }
}

function stopListening() {
  if (!recognition) return;
  recognition.stop();
}

onMounted(() => {
  initSpeechRecognition();
});

function generateMockPersona() {
  isGeneratingPersona.value = true;

  setTimeout(() => {
    generatedPersona.value = {
      name: "Captured Expert",
      philosophy:
        "Prioritize texture and heat control over unnecessary complexity.",
      decisionLogic:
        "Ingredient quality → Heat control → Texture → Sauce restraint → Presentation",
      tradeoff: {
        flavor: "High",
        speed: "Medium",
        cost: "Medium",
      },
      coachingNote: "Beginners usually overcrowd the pan and lose browning.",
    };

    isGeneratingPersona.value = false;
  }, 800);
}

function addGeneratedPersonaCard() {
  if (!generatedPersona.value) return;

  const personaCard = {
    name: generatedPersona.value.name,
    role: "Voice-Captured Expert",
    tag: "Captured",
    themeClass: "theme-captured",
    visualTitle: "AI-generated expert profile",
    visualSubtitle: generatedPersona.value.philosophy,
    imageLabel: "Generated from expert voice input",
    philosophy: generatedPersona.value.philosophy,
    dish: "Custom scenario-driven recommendation",
    reasoning: generatedPersona.value.decisionLogic,
    metrics: {
      flavor: generatedPersona.value.tradeoff.flavor,
      speed: generatedPersona.value.tradeoff.speed,
      cost: generatedPersona.value.tradeoff.cost,
    },
    commercialFit: generatedPersona.value.coachingNote,
  };

  chefs.value = [...chefs.value, personaCard];
}

async function generatePersona() {
  console.log("🚀 Button clicked");

  if (!transcript.value?.trim()) {
    console.warn("Transcript is empty");
    return;
  }

  console.log("📤 Sending transcript:", transcript.value);

  isGeneratingPersona.value = true;

  try {
    const { data } = await apiNode.post("/api/persona/generate", {
      transcript: transcript.value,
      expertId: selectedExpert.value?.expertId,
      expertName: selectedExpert.value?.expertName,
    });

    console.log("✅ Response received:", data);

    generatedPersona.value = data;

    // 🔥 加在这里（关键）
    if (data.duplicate) {
      console.log("⚠️ Similar persona already exists");

      $q.notify({
        type: "warning",
        message: data.message || "Similar persona already exists",
      });
    } else {
      $q.notify({
        type: "positive",
        message: "New persona created",
      });
    }

    // 🔥 刷新列表（你很关键的一步）
    await loadPersonas();
  } catch (err) {
    console.error("❌ generate persona failed:", err);
  } finally {
    isGeneratingPersona.value = false;
  }
}

const personaList = ref([]);

async function loadPersonas() {
  const { data } = await apiNode.get("/api/persona");
  personaList.value = data;
}

onMounted(() => {
  loadPersonas();
});

onMounted(() => {
  loadExperts();
});

onMounted(() => {
  if (userId.value) {
    loadExperts();
  }
});

const selectedPersona = ref(null);
const showDialog = ref(false);

function viewPersona(persona) {
  selectedPersona.value = persona;
  showDialog.value = true;
}

// async function deletePersona(id) {
//   try {
//     await apiNode.delete(`/api/persona/${id}`);
//     await loadPersonas(); // 🔥 删除后刷新列表
//   } catch (err) {
//     console.error("Delete failed:", err);
//   }
// }

import { Dialog } from "quasar";

function deletePersona(id) {
  Dialog.create({
    title: "Confirm",
    message: "Delete this persona?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await apiNode.delete(`/api/persona/${id}`);
      await loadPersonas(); // 🔥 删除后刷新
    } catch (err) {
      console.error("Delete failed:", err);
    }
  });
}

async function askExpertFromPersona() {
  if (!selectedPersona.value?.expertId || !question.value.trim()) return;

  const { data } = await apiNode.post("/api/persona/ask", {
    expertId: selectedPersona.value.expertId,
    question: question.value,
  });

  answer.value = data.answer;
}

runDemo();
</script>

<style scoped>
.persona-card {
  border-radius: 18px;
  min-height: 720px;
  display: flex;
  flex-direction: column;
}

.persona-image {
  height: 190px;
  border-radius: 16px;
  overflow: hidden;
}

.theme-laurent {
  background: linear-gradient(135deg, #4f46e5 0%, #6d5efc 45%, #9b8cff 100%);
}

.theme-maya {
  background: linear-gradient(135deg, #f59e0b 0%, #f7b955 45%, #fbd38d 100%);
}

.theme-chen {
  background: linear-gradient(135deg, #4b5563 0%, #6b7280 45%, #9ca3af 100%);
}

.metric-box {
  background: #f7f9fc;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e4e8ef;
}

.expand-box {
  background: #f8fafc;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  min-height: 130px;
}
.reasoning-box {
  min-height: 88px;
}
.dish-box {
  min-height: 52px;
}
.commercial-fit-box {
  min-height: 44px;
}
html {
  overflow-y: scroll;
}

.theme-captured {
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 45%, #5eead4 100%);
}
</style>
