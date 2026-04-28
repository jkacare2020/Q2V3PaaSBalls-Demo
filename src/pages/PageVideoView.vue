<template>
  <q-page class="constrain q-pa-md">
    <q-btn
      flat
      icon="arrow_forward"
      label="Go to Expert Demo"
      @click="$router.push('/expert-persona-demo')"
    />

    <!-- left side post video box -->
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <!-- 🔍 Search Input -->

        <q-input
          v-model="searchQuery"
          label="Search posts"
          outlined
          dense
          debounce="300"
          class="q-mb-md"
          clearable
        />

        <q-select
          v-model="selectedExpert"
          :options="expertOptions"
          option-label="expertName"
          label="Select Expert"
          dense
          outlined
          class="q-mb-md"
        />
        <!-- 👇 AI 结果展示区（放这里） -->
        <q-card v-if="expertStyle" class="q-mb-md bg-grey-1">
          <q-card-section>
            <div class="text-h6">👨‍🍳 Expert Style</div>

            <div class="text-caption">
              Videos analyzed: {{ expertStyle.videoCount }}
            </div>

            <div class="q-mt-sm">
              🔥 Heat: {{ expertStyle.observedStyle.averageHeat }} | ⚡ Speed:
              {{ expertStyle.observedStyle.averageSpeed }} | 🧠 Complexity:
              {{ expertStyle.observedStyle.averageComplexity }}
            </div>

            <div>
              🍳 Technique: {{ expertStyle.observedStyle.dominantTechnique }}
            </div>

            <div class="q-mt-sm text-primary">
              {{ expertStyle.summary }}
            </div>
          </q-card-section>
        </q-card>
        <q-scroll-area style="height: calc(100vh - 100px)">
          <template v-if="!loadingVideos && videos.length">
            <q-card
              v-for="video in filteredVideos"
              :key="video.id"
              class="card-post q-mb-md"
              bordered
              flat
            >
              <q-badge
                v-if="video.offline"
                class="badge-offline absolute-top-right"
                color="red"
              >
                Stored offline
              </q-badge>
              <!-- Post action icons (top-right) -->
              <div class="post-icons-top-right q-mr-lg">
                <q-btn
                  flat
                  round
                  dense
                  icon="chat"
                  color="primary"
                  @click="startCommentForVideo(video)"
                >
                  <q-tooltip>Comment</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="red"
                  @click="deleteVideo(video.id)"
                >
                  <q-tooltip>Delete video</q-tooltip>
                </q-btn>

                <!-- <q-btn
                  v-if="post.tags && post.tags.includes('marketplace')"
                  flat
                  round
                  dense
                  icon="shopping_cart"
                  color="orange"
                  @click="goToProductPage(post.id)"
                >
                  <q-tooltip>View Product</q-tooltip>
                </q-btn> -->
              </div>

              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="avatarUrl" :alt="username" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-bold">{{ username }}</q-item-label>
                  <q-item-label caption>
                    {{ video.location }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Video Display -->
              <video
                controls
                class="full-width"
                :poster="video.posterUrl"
                :src="video.videoUrl"
              ></video>

              <q-card-section>
                <div>{{ video.caption }}</div>
                <div class="text-caption text-grey">
                  {{ niceDate(video.date) }}
                </div>

                <!--------------badge---------------->
                <q-badge
                  v-if="video.tags?.includes('public')"
                  label="Public"
                  color="green"
                  class="q-mt-sm"
                  rounded
                />
                <q-badge
                  v-else
                  label="Private"
                  color="grey"
                  class="q-mt-sm"
                  rounded
                />
                <q-badge
                  v-if="video.userId === storeAuth.user?.uid"
                  label="You"
                  color="primary"
                  class="q-ml-sm"
                />
                <q-card-actions align="right">
                  <q-select
                    v-model="video.visibilityTag"
                    :options="['public', 'private']"
                    label="Visibility"
                    dense
                    emit-value
                    map-options
                    outlined
                    style="max-width: 140px"
                    @update:model-value="
                      (value) => updateVisibility(video.id, value)
                    "
                    :disable="video.userId !== storeAuth.user?.uid"
                  />
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Add to Expert"
                    @click="addVideoToExpert(video)"
                  />
                  <q-btn
                    flat
                    dense
                    color="secondary"
                    label="View Style"
                    @click="viewExpertStyle()"
                  />
                </q-card-actions>
              </q-card-section>
            </q-card>
          </template>
          <template v-else-if="!loadingVideos && !videos.length">
            <h5 class="text-center text-grey">No videos yet.</h5>
          </template>
          <template v-else>
            <!-- Skeleton Loading -->
            <q-card flat bordered>
              <q-item>
                <q-item-section avatar>
                  <q-skeleton type="QAvatar" animation="fade" size="40px" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                  <q-item-label caption>
                    <q-skeleton type="text" animation="fade" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-skeleton height="200px" square animation="fade" />

              <q-card-section>
                <q-skeleton
                  type="text"
                  class="text-subtitle2"
                  animation="fade"
                />
                <q-skeleton
                  type="text"
                  width="50%"
                  class="text-subtitle2"
                  animation="fade"
                />
              </q-card-section>
            </q-card>
          </template>
        </q-scroll-area>
      </div>

      <!-- RIGHT: Presence + Comment input -->
      <div class="col-4 large-screen-only">
        <q-badge color="primary" floating>
          Comments: {{ commentCount }}
        </q-badge>

        <q-scroll-area style="height: calc(100vh - 100px)">
          <q-card class="q-pa-md">
            <!--------------------- comments ------------------------>
            <q-list bordered class="q-mb-md" v-if="comments.length">
              <q-item
                v-for="(comment, idx) in comments"
                :key="comment.id || idx"
              >
                <q-item-section avatar>
                  <q-avatar size="32px">
                    <img :src="comment.avatarUrl || defaultAvatar" />
                    <q-badge
                      rounded
                      floating
                      :color="comment.online ? 'green' : 'red'"
                      class="presence-dot"
                    />
                  </q-avatar>
                </q-item-section>

                <!-- Main text -->
                <q-item-section>
                  <q-item-label class="text-bold">
                    {{ comment.userName || comment.displayName || "User" }}
                  </q-item-label>

                  <!-- 👇 Inline Edit Mode -->
                  <div v-if="editingCommentId === comment.id">
                    <q-input
                      v-model="editedText"
                      dense
                      outlined
                      autogrow
                      autofocus
                      @keyup.enter="submitEditedComment(comment.id)"
                    />
                    <div class="q-mt-xs">
                      <q-btn
                        flat
                        dense
                        color="primary"
                        label="Save"
                        @click="submitEditedComment(comment.id)"
                      />
                      <q-btn
                        flat
                        dense
                        color="grey"
                        label="Cancel"
                        @click="editingCommentId = null"
                      />
                    </div>
                  </div>

                  <!-- 👇 Normal Display Mode -->
                  <div v-else>
                    <!-- 🧵 If it's a reply comment  Reply indicator -->
                    <template v-if="comment.replyTo">
                      <q-item-label caption>
                        🧵 Reply to another comment
                      </q-item-label>
                      <q-btn
                        flat
                        dense
                        label="View thread"
                        color="primary"
                        size="sm"
                        @click="
                          $router.push(
                            `/replies/${comment.postId}/${comment.replyTo}`,
                          )
                        "
                      />
                      <q-icon name="reply" />
                    </template>
                    <!-------------------------------------------------------------------->
                    <!-- Render mentions as inline chips with popovers -->
                    <q-item-label caption>
                      <template
                        v-for="(part, i) in comment.parsedText"
                        :key="i"
                      >
                        <span v-if="part.isMention">
                          <q-chip
                            clickable
                            square
                            class="mention-chip"
                            @click="goToProfile(part.text)"
                          >
                            <q-tooltip
                              >View profile of {{ part.text }}</q-tooltip
                            >
                            {{ part.text }}
                          </q-chip>
                        </span>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </q-item-label>

                    <!-- ⏰ Timestamp -->
                    <q-item-label caption class="text-grey-6">
                      {{ new Date(comment.timestamp).toLocaleString() }}
                      <span v-if="comment.edited">(edited)</span>
                    </q-item-label>
                  </div>
                </q-item-section>

                <!-- ⋯ Action dropdown menu -->
                <q-item-section
                  side
                  v-if="comment.userId === storeAuth.user?.uid"
                >
                  <q-btn round dense flat icon="more_vert" color="primary">
                    <q-menu>
                      <q-list style="min-width: 120px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="startEditingComment(comment)"
                        >
                          <q-item-section avatar
                            ><q-icon name="edit"
                          /></q-item-section>
                          <q-item-section>Edit</q-item-section>
                        </q-item>

                        <q-item
                          clickable
                          v-close-popup
                          @click="confirmDeleteComment(comment.id)"
                        >
                          <q-item-section avatar
                            ><q-icon name="delete"
                          /></q-item-section>
                          <q-item-section>Delete</q-item-section>
                        </q-item>

                        <q-item
                          clickable
                          v-close-popup
                          @click="toggleCommentOffline(comment)"
                        >
                          <q-item-section avatar>
                            <q-icon name="visibility_off" />
                          </q-item-section>
                          <q-item-section>
                            {{ comment.online ? "Set Offline" : "Go Online" }}
                          </q-item-section>
                        </q-item>
                        <!-- 💬 Reply (always available if logged in) -->
                        <q-item
                          v-if="storeAuth.user"
                          clickable
                          v-close-popup
                          @click="goToReplies(comment)"
                        >
                          <q-item-section avatar>
                            <q-icon name="reply" />
                          </q-item-section>
                          <q-item-section>Reply</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
            <!-----------------------------------general commend input---------------------------------------------------->
            <div v-else class="text-caption q-mt-sm">❌ No comments yet.</div>
            <!-- Comment input -->
            <div class="q-mt-md">
              <q-input
                filled
                v-model="commentText"
                label="Leave a comment..."
                dense
                type="textarea"
                autogrow
                @keyup.enter="sendComment"
              />
              <q-btn
                class="q-mt-sm"
                label="Send"
                color="primary"
                @click="sendComment"
                :disable="!commentText"
              />
            </div>
          </q-card>
        </q-scroll-area>
      </div>
    </div>

    <!-- Floating icon for small screens -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      class="q-mb-md q-mr-md small-screen-only"
    >
      <q-btn round color="primary" icon="chat" @click="handleCommentClick" />
    </q-page-sticky>
  </q-page>

  <q-dialog
    v-model="showCommentModal"
    persistent
    full-width
    full-height
    class="drawer-style"
  >
    <transition
      appear
      enter-active-class="animated fadeInUp"
      leave-active-class="animated fadeOutDown"
    >
      <q-card
        v-if="showCommentModal"
        class="full-width column no-wrap"
        style="border-top-left-radius: 20px; border-top-right-radius: 20px"
      >
        <!-- Header -->
        <q-bar class="bg-primary text-white">
          <div class="text-h6">Comments</div>
          <q-space />
          <q-btn dense flat icon="close" @click="showCommentModal = false" />
        </q-bar>

        <!-- Modal Comment Feed -->
        <q-page class="constrain q-pa-md">
          <q-scroll-area style="height: calc(100vh - 100px)">
            <q-card class="q-pa-md">
              <q-toolbar class="bg-grey-2 text-primary">
                <q-toolbar-title>
                  💬 Comments
                  <q-badge color="primary" floating>
                    {{ commentCount }}
                  </q-badge></q-toolbar-title
                >
              </q-toolbar>

              <!-- Comments List -->
              <q-list v-if="comments.length">
                <q-item
                  v-for="(comment, idx) in comments"
                  :key="comment?.id || idx"
                >
                  <q-item-section avatar>
                    <q-avatar size="32px">
                      <img :src="comment.avatarUrl || defaultAvatar" />
                      <q-badge
                        rounded
                        floating
                        :color="comment.online ? 'green' : 'red'"
                        class="presence-dot"
                      />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-bold">
                      {{ comment.userName || comment.displayName || "User" }}
                    </q-item-label>

                    <!-- Reply indicator -->
                    <template v-if="comment.replyTo">
                      <q-item-label caption>
                        🧵 Reply to another comment
                      </q-item-label>
                      <q-btn
                        flat
                        dense
                        label="View thread"
                        color="primary"
                        size="sm"
                        @click="
                          $router.push(
                            `/replies/${comment.postId}/${comment.replyTo}`,
                          )
                        "
                      />
                    </template>

                    <!-- Render mentions as inline chips with popovers -->
                    <q-item-label caption>
                      <template
                        v-for="(part, i) in comment.parsedText"
                        :key="i"
                      >
                        <span v-if="part.isMention">
                          <q-chip
                            clickable
                            square
                            class="mention-chip"
                            @click="goToProfile(part.text)"
                          >
                            <q-tooltip
                              >View profile of {{ part.text }}</q-tooltip
                            >
                            {{ part.text }}
                          </q-chip>
                        </span>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </q-item-label>

                    <q-item-label caption class="text-grey-6">
                      {{ new Date(comment.timestamp).toLocaleString() }}
                      <span v-if="comment.edited">(edited)</span>
                    </q-item-label>
                  </q-item-section>

                  <!-- ⋯ Action dropdown menu (always shown) -->
                  <q-item-section side>
                    <q-btn round dense flat icon="more_vert" color="primary">
                      <q-menu>
                        <q-list style="min-width: 140px">
                          <q-item
                            v-if="comment.userId === storeAuth.user?.uid"
                            clickable
                            v-close-popup
                            @click="startEditingComment(comment)"
                          >
                            <q-item-section avatar
                              ><q-icon name="edit"
                            /></q-item-section>
                            <q-item-section>Edit</q-item-section>
                          </q-item>

                          <q-item
                            v-if="comment.userId === storeAuth.user?.uid"
                            clickable
                            v-close-popup
                            @click="confirmDeleteComment(comment.id)"
                          >
                            <q-item-section avatar
                              ><q-icon name="delete"
                            /></q-item-section>
                            <q-item-section>Delete</q-item-section>
                          </q-item>

                          <q-item
                            v-if="comment.userId === storeAuth.user?.uid"
                            clickable
                            v-close-popup
                            @click="toggleCommentOffline(comment)"
                          >
                            <q-item-section avatar
                              ><q-icon name="visibility_off"
                            /></q-item-section>
                            <q-item-section>
                              {{ comment.online ? "Set Offline" : "Go Online" }}
                            </q-item-section>
                          </q-item>

                          <q-item
                            v-if="storeAuth.user"
                            clickable
                            v-close-popup
                            @click="goToReplies(comment)"
                          >
                            <q-item-section avatar
                              ><q-icon name="reply"
                            /></q-item-section>
                            <q-item-section>Reply</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-caption">❌ No comments yet.</div>
            </q-card>
          </q-scroll-area>
        </q-page>

        <!-- Modal Input Section -->
        <q-separator />
        <q-card-actions class="q-px-sm q-py-sm">
          <q-input
            ref="commentInputRef"
            v-model="commentText"
            placeholder="Leave a comment..."
            dense
            outlined
            class="col"
            @keyup.enter="sendComment"
          />
          <q-btn round color="primary" icon="send" @click="sendComment">
            <q-badge
              v-if="hasUnreadComments"
              color="red"
              floating
              rounded
              style="top: -6px; right: -6px"
            />
          </q-btn>
        </q-card-actions>
      </q-card>
    </transition>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

import { auth, dbRealtime, db } from "src/firebase/init";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

import { useStoreAuth } from "src/stores/storeAuth";
import { apiNode } from "boot/apiNode";
import {
  onValue,
  ref as dbRef,
  remove,
  set,
  onDisconnect,
  serverTimestamp,
} from "firebase/database";
import { watch } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import defaultAvatar from "src/assets/avatar.png";
import { useRouter } from "vue-router";
import { nextTick } from "vue";
import { useQuasar } from "quasar";

const hasUnreadComments = computed(() => {
  return comments.value.length > 0 && !showCommentModal.value;
});

const router = useRouter();
const storeAuth = useStoreAuth();

const onlineUsers = ref([]);
const comments = ref([]);
const commentText = ref("");
const replyTo = ref(null);
const videoId = ref("global");
const videos = ref([]);
const editingCommentId = ref(null);
const editedText = ref("");
const allUserMap = ref({});
const username = ref(storeAuth.user?.displayName || "User Name");
const email = ref(storeAuth.user?.email || "user@example.com");

const loadingVideos = ref(false);
const showNotificationsBanner = ref(false);
const isAuthenticated = ref(false);
const showCommentModal = ref(false);
const commentCount = ref(0);

const avatarUrl = ref(defaultAvatar);

const $q = useQuasar();

const serviceWorkerSupported = computed(() => "serviceWorker" in navigator);
const pushNotificationsSupported = computed(() => "PushManager" in window);

const topLevelComments = computed(() =>
  comments.value.filter((c) => !c.replyTo),
);

const selectedExpert = ref(null);
const expertOptions = ref([]);

watch(
  () => storeAuth.user,
  (user) => {
    if (user) {
      loadExperts();
    }
  },
  { immediate: true },
);

const expertStyle = ref(null);

async function viewExpertStyle() {
  if (!selectedExpert.value) {
    $q.notify({ type: "warning", message: "Select an expert first." });
    return;
  }

  try {
    const { data } = await apiNode.get(
      `/api/video-analysis/expert/${selectedExpert.value.expertId}/observed-persona`,
    );

    expertStyle.value = data;

    console.log("🎯 Expert Style:", data);
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Failed to load style." });
  }
}

async function loadExperts() {
  const uid = storeAuth.user?.uid;
  if (!uid) return;

  const { data } = await apiNode.get(`/api/expert/${uid}`);
  expertOptions.value = data;

  if (!selectedExpert.value && data.length) {
    selectedExpert.value = data[0];
  }
}

async function addVideoToExpert(video) {
  if (!selectedExpert.value) {
    $q.notify({ type: "warning", message: "Please select an expert first." });
    return;
  }

  try {
    const res = await apiNode.post(
      `/api/video-analysis/from-video/${video.id}`,
      {
        expertId: selectedExpert.value.expertId,
        expertName: selectedExpert.value.expertName,
      },
    );

    const analysisId = res.data._id;

    await apiNode.put(`/api/video-analysis/${analysisId}/mock-analyze`, {
      transcript: video.caption || "No transcript yet.",
      processSteps: [
        "observe video",
        "extract cooking style",
        "link to expert",
      ],
      extractedSignals: {
        heatLevel: 7,
        speed: 6,
        complexity: 5,
        technique: "stir-fry",
      },
      consistencyScore: 0.85,
      linkedPersonaId: null,
    });

    $q.notify({
      type: "positive",
      message: "Video added and analyzed.",
    });
  } catch (err) {
    console.error("Add/analyze video failed:", err);
    $q.notify({
      type: "negative",
      message: "Failed to add/analyze video.",
    });
  }
}

//---------------------Modal open ---------------
function openActionSheet() {
  $q.bottomSheet({
    title: "Choose an action",
    actions: [
      { label: "Open Comments", icon: "chat", id: "reply" },
      { label: "Delete", icon: "delete", color: "negative", id: "delete" },
      { label: "Cancel", icon: "close", id: "cancel" },
    ],
  }).onOk((action) => {
    if (action.id === "reply") {
      showCommentModal.value = true; // Opens <q-dialog>
    } else if (action.id === "delete") {
      $q.notify({ type: "warning", message: "Feature coming soon!" });
    }
  });
}

function handleCommentClick() {
  console.log("FAB clicked");
  openActionSheet(); // ✅ Always run for testing
}
//--------------------Delete comment confirmation -----------
function confirmDeleteComment(commentId) {
  $q.dialog({
    title: "Delete comment?",
    message: "This action cannot be undone.",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteComment(commentId);
  });
}

function deleteComment(commentId) {
  const commentRef = dbRef(dbRealtime, `comments/global/${commentId}`);
  remove(commentRef)
    .then(() => {
      $q.notify({
        type: "positive",
        message: "🗑️ Comment deleted",
        timeout: 2000,
        position: "top-right",
        icon: "check_circle",
      });
    })
    .catch((error) => {
      $q.notify({
        type: "negative",
        message: "❌ Could not delete comment",
        timeout: 2500,
        position: "top-right",
        icon: "error",
      });
      console.error("Failed to delete comment:", error);
    });
}

//---------------------------Presence--------------------------------------------
function initPresenceTracking() {
  if (!auth.currentUser) {
    console.warn("⚠️ No authenticated user for presence");
    return;
  }

  const userId = auth.currentUser.uid;
  const userStatusRef = dbRef(dbRealtime, `usersPresence/${userId}`);

  // Set the user online
  set(userStatusRef, {
    online: true,
    lastSeen: serverTimestamp(),
  });

  // Set the user offline when disconnected (auto-handled by Firebase)
  onDisconnect(userStatusRef).set({
    online: false,
    lastSeen: serverTimestamp(),
  });

  console.log("🟢 Presence tracking initialized for:", userId);
}
// ----------Fetch videos from backend---------
const getVideos = () => {
  if (!auth.currentUser) {
    console.warn("No authenticated user, skipping video retrieval.");
    return;
  }

  loadingVideos.value = true;

  auth.currentUser
    .getIdToken()
    .then((idToken) => {
      apiNode
        .get(`/api/videos`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .then((response) => {
          videos.value = response.data;
          loadingVideos.value = false;
        })
        .catch((err) => {
          console.error("Error fetching videos:", err);
          $q.dialog({
            title: "Error",
            message: "Could not download videos.",
          });
          loadingVideos.value = false;
          // ✅ Process posts and add visibilityTag
          videos.value = response.data.map((video) => ({
            ...video,
            visibilityTag: video.tags?.includes("public")
              ? "public"
              : "private",
          }));
        })
        .catch((err) => {
          console.error("Error fetching videos:", err);
          $q.dialog({
            title: "Error",
            message: "Could not download videos.",
          });
          loadingVideos.value = false;
        });
    })
    .catch((error) => {
      console.error("Error getting ID token:", error);
      loadingVideos.value = false;
    });
};

// ---------------- Delete Video --------------------------
const deleteVideo = (videoId) => {
  console.log("Delete this Video triggered", videoId);
  auth.currentUser.getIdToken().then((idToken) => {
    apiNode
      .delete(`/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then((response) => {
        console.log("Video deleted:", response);
        videos.value = videos.value.filter((video) => video.id !== videoId);
        $q.notify({
          type: "positive",
          message: "Video deleted successfully.",
        });
      })
      .catch((err) => {
        console.error("Error deleting video:", err);
        $q.dialog({
          title: "Error",
          message: "Could not delete video.",
        });
      });
  });
};

const niceDate = (value) => {
  return new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
//---------------------------------fetch comments----------------------------------
function fetchComments(videoId = "global") {
  console.log("📡 Fetching comments from DB...");
  const commentsRef = dbRef(dbRealtime, `comments/${videoId}`);
  onValue(commentsRef, async (snapshot) => {
    const data = snapshot.val();
    console.log("🪵 Raw snapshot:", data);

    if (data) {
      const parsed = Object.entries(data).map(([key, value]) => ({
        ...value,
        id: key,
        parsedText: parseMention(value.text),
      }));

      // ✅ Enrich avatars asynchronously
      await Promise.all(
        parsed.map(async (comment) => {
          if (!comment.avatarUrl || comment.avatarUrl === "") {
            try {
              const avatarSnap = await getDocs(
                collection(db, `users/${comment.userId}/avatar`),
              );
              if (!avatarSnap.empty) {
                comment.avatarUrl =
                  avatarSnap.docs[0].data().imageUrl || defaultAvatar;
              }
            } catch (err) {
              console.warn(`Could not fetch avatar for ${comment.userId}`);
            }
          }
        }),
      );

      comments.value = parsed.sort((a, b) => b.timestamp - a.timestamp);
      commentCount.value = comments.value.length;
    } else {
      comments.value = [];
    }

    console.log("🧾 Parsed comments:", comments.value);

    // ✅ Auto-scroll to latest comment
    nextTick(() => {
      const scrollEl = document.querySelector(".q-scrollarea__container");
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  });
}
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    console.log("👤 Auth state changed:", user.uid);

    fetchUserData(user.uid);
    getVideos();
    loadExperts();
    fetchComments();
    initPresenceTracking();
  });
});

// Watch for storeAuth.user to be ready
watch(
  () => storeAuth.user,
  (newUser) => {
    if (newUser) {
      console.log("🟢 storeAuth.user is now available, calling fetchPresence");
      username.value = newUser.displayName || "User";
      email.value = newUser.email || "user@example.com";
      fetchPresence();
    }
  },
  { immediate: true },
);
//---------------------user Data------------------------------
async function fetchUserData(uid) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      username.value = userData.displayName || "Guest";
      email.value = userData.email;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }

  try {
    const avatarCollectionRef = collection(db, `users/${uid}/avatar`);
    const avatarSnapshot = await getDocs(avatarCollectionRef);
    if (!avatarSnapshot.empty) {
      const avatarDoc = avatarSnapshot.docs[0];
      avatarUrl.value = avatarDoc.data().imageUrl || defaultAvatar;
    }
  } catch (error) {
    console.error("Error fetching avatar: ", error);
  }
}
//--------------------user presence-----------------------------------
async function fetchPresence() {
  console.log("🚀 fetchPresence() called");

  const usersPresenceRef = dbRef(dbRealtime, "usersPresence");

  onValue(usersPresenceRef, async (snapshot) => {
    const presenceData = snapshot.val() || {};
    const newUserMap = {};

    const all = await Promise.all(
      Object.entries(presenceData).map(async ([userId, presence]) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        let avatarUrl = "";
        try {
          const avatarSnap = await getDocs(
            collection(db, `users/${userId}/avatar`),
          );
          if (!avatarSnap.empty) {
            avatarUrl = avatarSnap.docs[0].data().imageUrl;
          }
        } catch (err) {
          console.warn(`⚠️ No avatar found for ${userId}`);
        }

        newUserMap[userId] = {
          userId,
          displayName: userData.displayName || "User",
          userName: userData.userName || "",
          email: userData.email || "",
          avatarUrl: avatarUrl,
          online: presence.online === true,
        };
      }),
    );

    allUserMap.value = newUserMap;
    console.log("✅ allUserMap updated with presence:", newUserMap);
  });
}
//------------------------General comments input and Send Comments ----------------
async function sendComment() {
  const user = storeAuth.user; // ✅ Define this!
  if (!storeAuth.user || !commentText.value) return;

  // Check if the logged-in user has a username
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};

  if (!userData.userName) {
    $q.notify({
      type: "warning",
      message: "Please set a username before commenting.",
      icon: "warning",
      position: "top",
    });

    setTimeout(() => {
      router.push("/profile"); // or your profile/edit page route
    }, 1500);
    return; // 🚫 Prevent comment from being sent
  }

  const token = await auth.currentUser.getIdToken();
  try {
    await apiNode.post(
      "/api/comments/add",
      {
        videoId: videoId.value,
        text: commentText.value,
        replyTo: replyTo.value || null, // 🧠 Send null unless replying a comment
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    $q.notify({ type: "positive", message: "Comment posted ✅" });
    resetCommentBox(); // 👈 Clears videoId, replyTo, and input
  } catch (error) {
    console.error("❌ Comment post failed:", error);
    $q.notify({ type: "negative", message: "Failed to post comment." });
  }
}
//------------------------map-----------------------------
const userMap = computed(() => {
  const map = {};
  for (const user of onlineUsers.value) {
    map[user.userId] = user;
  }
  return map;
});
//--------------------------
function resetCommentBox() {
  commentText.value = "";
  videoId.value = "global";
  replyTo.value = null;
}
//------- Inline Edit ------------------------

function startEditingComment(comment) {
  editingCommentId.value = comment.id;
  editedText.value = comment.text;
}

//----------Submit--------------------------
async function submitEditedComment(commentId) {
  const token = await auth.currentUser.getIdToken();

  try {
    await apiNode.put(
      "/api/comments/update",
      {
        commentId,
        videoId: "global", // or dynamic videotId
        newText: editedText.value,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    $q.notify({ type: "positive", message: "✏️ Comment updated" });
    editingCommentId.value = null;
  } catch (err) {
    console.error("❌ Failed to update:", err);
    $q.notify({ type: "negative", message: "Update failed" });
  }
}

//------------------------------------------------
async function toggleCommentOffline(comment) {
  const token = await auth.currentUser.getIdToken();

  await apiNode.put(
    "/api/comments/update",
    {
      commentId: comment.id,
      videoId: "global",
      newText: comment.text,
      online: !comment.online, // ✅ flip the boolean
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  // Optional instant UI update
  comment.online = !comment.online;
}

//-----------Video tag updateVisibility-------------------------------
async function updateVisibility(videoId, visibility) {
  const token = await auth.currentUser.getIdToken();
  try {
    await apiNode.put(
      "/api/videos/visibility",
      {
        videoId,
        makePublic: visibility === "public",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    // 🔄 Update the video in local array
    const index = videos.value.findIndex((p) => p.id === videoId);
    if (index !== -1) {
      videos.value[index].visibilityTag = visibility;

      // Optionally update tags too ----------------------
      videos.value[index].tags =
        visibility === "public" ? ["public"] : ["private"];
    }
    $q.notify({ type: "positive", message: "Visibility updated" });
  } catch (err) {
    console.error("Failed to update visibility", err);
    $q.notify({ type: "negative", message: "Failed to update visibility" });
  }
}

//------------------Send a comment for a video selected -----------------------------
function startCommentForVideo(video) {
  // 🟢 Fallback order: userName → displayName → "User"
  const name = video.userName || video.displayName || "User";

  commentText.value = `@${name} `;
  videoId.value = "global";
  replyTo.value = null;
  editingCommentId.value = null;

  if ($q.screen.lt.md) {
    showCommentModal.value = true;
  } else {
    nextTick(() => {
      document.querySelector("#general-comment-input")?.focus();
    });
  }
}
//--------------Group by videotId------------------
const groupedComments = computed(() => {
  const map = {};
  for (const c of comments.value) {
    const pid = c.videoId || "global";
    if (!map[pid]) map[pid] = [];
    map[pid].push(c);
  }

  // Sort comments within each group
  Object.keys(map).forEach((pid) => {
    map[pid].sort((a, b) => a.timestamp - b.timestamp);
  });

  return map;
});
//-------------------------------------------------
const repliesByCommentId = computed(() => {
  const grouped = {};
  for (const comment of comments.value) {
    if (comment.replyTo) {
      if (!grouped[comment.replyTo]) grouped[comment.replyTo] = [];
      grouped[comment.replyTo].push(comment);
    }
  }
  return grouped;
});

//-----------------------------------------------
function goToReplies(comment) {
  router.push({
    name: "PageReplies",
    params: {
      postId: comment.videoId || "global",
      commentId: comment.id,
    },
  });
}
//--------------------------------------------------
function goToProfile(mentionText) {
  const username = mentionText.startsWith("@")
    ? mentionText.substring(1)
    : mentionText;
  router.push(`/user/${username}`);
}

//-----------------------------------------------
function parseMention(text) {
  const parts = text.split(/(@\w+)/g); // captures @mentions
  return parts.map((part) => ({
    text: part,
    isMention: part.startsWith("@"),
  }));
}

const searchQuery = ref("");

const filteredVideos = computed(() =>
  videos.value.filter((video) => {
    const query = searchQuery.value.toLowerCase();
    return (
      video.caption?.toLowerCase().includes(query) ||
      video.location?.toLowerCase().includes(query) ||
      niceDate(video.date).toLowerCase().includes(query)
    );
  }),
);

//-----------------------------------------------
</script>

<style scoped lang="scss">
.delete-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  cursor: pointer;
  color: red;
}

.delete-icon:hover {
  color: blue !important;
}

.card-post {
  .q-img {
    min-height: 200px;
  }
}
.presence-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border: 2px solid white;
}
.q-dialog__inner--top {
  align-items: flex-end;
}

.post-icons-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 12px;
  z-index: 10;

  q-icon {
    cursor: pointer;
  }
}

.mention-chip {
  display: inline-block;
  background: #e0f7fa;
  color: #00796b;
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 4px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}
.mention-chip:hover {
  background-color: #b2dfdb;
  text-decoration: underline;
}
.presence-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border: 2px solid white;
}
</style>
