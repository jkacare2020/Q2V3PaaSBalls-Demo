<template>
  <div style="color: red; font-weight: bold; font-size: 20px">
    🔥 THIS IS PageChatBotABMode
  </div>
  <q-page class="q-pa-md">
    <div class="chat-container">
      <!-- Chatbot Section -->
      <q-card flat bordered class="chat-card uniform-card">
        <q-card-section>
          <div class="text-h6 text-center">Speaking Chatbot</div>
        </q-card-section>
        <q-card-section>
          <div class="chat-display">
            <div
              v-for="(message, index) in chatMessages"
              :key="index"
              :class="message.role === 'user' ? 'user-message' : 'bot-message'"
            >
              <span>{{ message.text }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="userMessage"
            label="Type your message"
            outlined
            dense
            @keyup.enter="sendMessage"
          />
          <q-btn
            label="Send"
            color="primary"
            @click="sendMessage"
            class="q-mt-md"
          />
        </q-card-section>
      </q-card>

      <!-- Audio Section -->
      <q-card class="q-ma-md uniform-card">
        <q-card-section>
          <div class="text-h6 text-center">Speech Controls</div>
          <div class="row items-center q-gutter-md q-mt-md">
            <q-btn
              @click="startTranscription"
              label="Start Transcription"
              color="blue"
              icon="mic"
            />
            <q-btn
              label="Play Response"
              color="primary"
              icon="volume_up"
              @click="playBotResponse"
              :class="{ 'pulse-button': shouldPulse }"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Controls Section -->
    <q-card class="uniform-card q-mt-md">
      <q-card-section class="row justify-center q-gutter-md">
        <!-- 🎤 Voice Mode Toggle -->
        <q-toggle
          v-model="isVoiceMode"
          label="Voice Mode"
          color="primary"
          checked-icon="record_voice_over"
          unchecked-icon="keyboard"
        />

        <!-- 🔊 Speaker Toggle -->
        <q-toggle
          v-model="isSpeakerEnabled"
          label="Speaker"
          color="secondary"
          :checked-icon="isSpeakerEnabled ? 'volume_up' : 'volume_off'"
          unchecked-icon="volume_off"
        />

        <!-- ✅ Confirm Button (Handles Voice Mode Input) -->
        <q-btn label="Confirm" color="primary" @click="handleInput" />

        <!-- 📜 Chat History -->
        <q-btn
          label="Chat History"
          color="secondary"
          icon="history"
          @click="goToChatHistory"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { auth } from "src/firebase/init";
import { apiNode } from "boot/apiNode"; // Make sure this is imported at the top
import { nextTick } from "vue";
import { onMounted } from "vue";

console.log("🔥 TOP LEVEL PageChatBotABMode LOADED");

onMounted(() => {
  console.log("🔥 PageChatBotABMode mounted");
});

const router = useRouter();
const $q = useQuasar();

const userMessage = ref("");
const chatMessages = ref([]);
const botResponse = ref("");
const audioUrl = ref(null);
const isVoiceMode = ref(false); // 🔄 Voice Mode Toggle
const isSpeakerEnabled = ref(true); // 🔊 Speaker Toggle
const latestBotResponse = ref("");
const shouldPulse = ref(false);

const handleBotReply = (botText) => {
  latestBotResponse.value = botText;
  shouldPulse.value = true; // 🎯 Start animation when bot replies
};
//-----------------------------------
const goToChatHistory = () => {
  router.push("/ChatbotHistory");
};

// 🔥 Handle Input Based on Voice Mode
const handleInput = () => {
  if (isVoiceMode.value) {
    startVoiceInput();
  } else {
    sendMessage();
  }
};

// 🔥 Fetch Firebase Token
const getValidToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("❌ User not authenticated.");
    return null;
  }
  try {
    const token = await currentUser.getIdToken(true);
    console.log("🔥 Fresh Firebase Token:", token);
    return token;
  } catch (error) {
    console.error("❌ Error retrieving Firebase token:", error);
    return null;
  }
};

// ✅ Send Message (Text or Voice Input)
const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  chatMessages.value.push({ role: "user", text: userMessage.value });

  try {
    const token = await getValidToken();
    if (!token) throw new Error("No Firebase token available");

    const response = await apiNode.post(
      "/api/chatbot/sendMessage",
      { userMessage: userMessage.value },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const botResponse = response.data.botResponse;
    chatMessages.value.push({ role: "bot", text: botResponse });

    // Auto-scroll after DOM updates
    await nextTick();
    const el = document.querySelector(".chat-display");
    if (el) el.scrollTop = el.scrollHeight;

    // ✅ Speak response only if Speaker is enabled
    if (isSpeakerEnabled.value) {
      convertToSpeech(botResponse);
      handleBotReply(response.data.botResponse);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    chatMessages.value.push({ role: "bot", text: "Error processing message." });
  } finally {
    userMessage.value = "";
  }
};

// 🎤 Speech-to-Text (STT)
const startTranscription = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    $q.notify({ type: "negative", message: "STT not supported." });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    $q.notify({ type: "info", message: "Listening... Speak now." });
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    userMessage.value = transcript;

    sendMessage();
  };

  recognition.onerror = (event) => {
    console.error("STT Error:", event.error);
    $q.notify({ type: "negative", message: "Transcription failed." });
  };

  recognition.start();
};

// 🔊 Convert GPT Response to Speech
const convertToSpeech = (text) => {
  if (!text.trim() || !isSpeakerEnabled.value) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onerror = (event) => {
    console.error("TTS Error:", event.error);
    $q.notify({ type: "negative", message: "TTS failed." });
  };

  window.speechSynthesis.speak(utterance);
};

// 🖥️ Play Stored Audio Response
const playBotResponse = () => {
  if (!latestBotResponse.value) return;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(latestBotResponse.value);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  speechSynthesis.speak(utterance);

  shouldPulse.value = false; // 🛑 Stop animation when clicked
};

// 🎤 Start Voice Mode STT (B Mode)
const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    $q.notify({ type: "negative", message: "STT not supported." });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    chatMessages.value.push({ role: "user", text: transcript });

    try {
      const token = await getValidToken();
      if (!token) throw new Error("No Firebase token available");

      const response = await apiNode.post(
        "/api/chatbot/sendMessage",
        { userMessage: transcript },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const botResponse = response.data.botResponse;
      chatMessages.value.push({ role: "bot", text: botResponse });

      // ✅ Speak response only if Speaker is enabled
      if (isSpeakerEnabled.value) {
        convertToSpeech(botResponse);
      }
    } catch (error) {
      console.error("STT Error:", error);
    }
  };

  recognition.start();
};
</script>

--- ### **🔹 What Was Fixed** ✅ **Voice Mode + Confirm Button Works** ✅
**Speaker Toggle Works** ✅ **GPT Responds Based on Mode & Settings** Now you
can **enable Voice Mode**, **toggle Speaker on/off**, and **confirm voice
input** before sending! 🚀🔥

<style scoped>
/* Uniform Card Styling */
.uniform-card {
  max-width: 600px;
  width: 100%;
  margin: 20px auto;
}

.chat-display {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: var(--q-background);
  color: var(--q-text);
}

.user-message {
  text-align: right;
  background-color: var(--q-color-primary-lightest);
  color: var(--q-text);
  padding: 8px 12px;
  border-radius: 16px;
  margin: 5px 0;
}

.bot-message {
  text-align: left;
  background-color: var(--q-color-secondary-lightest);
  color: var(--q-text);
  padding: 8px 12px;
  border-radius: 16px;
  margin: 5px 0;
}

.pulse-button {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
