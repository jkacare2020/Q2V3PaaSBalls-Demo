<template>
  <!--MainLayout.vue-->
  <q-layout view="hHh lpR lFf">
    <q-header :elevated="useLightOrDark(true, false)">
      <q-banner v-if="showAppInstallBanner" class="bubble-banner">
        <div>
          <b>Install SaaS as a native app?</b>
        </div>
        <div class="bubble-banner-buttons">
          <q-btn flat dense label="Yes" @click="installApp" color="white" />
          <q-btn
            flat
            dense
            label="Later"
            @click="showAppInstallBanner = false"
            color="white"
          />
          <q-btn
            flat
            dense
            label="Never"
            @click="neverShowAppInstallBanner"
            color="white"
          />
        </div>
      </q-banner>

      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="q-pa-none">
          <div class="row items-center justify-center no-wrap">
            <!-- ⬅ Back Icon -->
            <q-btn
              flat
              dense
              round
              icon="arrow_back"
              :disable="!canGoBack"
              @click="goBack()"
            />

            <span class="text-weight-bold"
              >Ismehr
              <img
                src="icons/favicon-32x32.png"
                alt="IsmeHr Logo"
                style="height: 32px; width: 32px"
                class="logo-link q-mr-sm"
                @click="$router.push('/front-page')"
              />SaaSbot</span
            >
            <!-- ➡ Forward Icon -->
            <q-btn
              flat
              dense
              round
              icon="arrow_forward"
              :disable="!canGoForward"
              @click="goForward()"
            />
          </div>
        </q-toolbar-title>

        <div>
          <!-- Avatar and Dropdown only render if the user is logged in -->
          <div v-if="isLoggedIn">
            <q-btn flat round @click.stop="toggleDropdown" class="q-ml-md">
              <q-avatar>
                <!-- <img :src="userAvatar || 'default-avatar.png'" /> -->
                <img :src="finalAvatarUrl" @error="onImageError" />
              </q-avatar>
            </q-btn>
            <q-menu v-model="dropdownOpen">
              <q-list>
                <q-item clickable @click="goToProfile">
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable @click="logout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
                <q-item clickable @click="$router.push('/signup')">
                  <q-item-section>Signup</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>

          <!-- Login button is shown only if the user is not logged in and not on signup page -->
          <div v-else-if="!isSignupPage">
            <q-btn flat round @click="$router.push('/login')" class="q-ml-md">
              Login
            </q-btn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ------------Left side Drawer  ------------------ -->
    <!-- Left-side Navigation Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      class="bg-primary"
      :width="250"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header class="text-white">Navigation</q-item-label>

        <template v-for="category in navLinks" :key="category.category">
          <q-expansion-item
            :icon="category.icon"
            :label="category.category"
            expand-separator
          >
            <!-- Handle each link or submenu -->
            <template
              v-for="link in category.links || category.children"
              :key="link.title"
            >
              <!-- Conditionally skip adminOnly or merchantOnly links -->
              <template v-if="!link.adminOnly || storeUsers.isAdmin">
                <template v-if="!link.merchantOnly || storeUsers.isMerchant">
                  <!-- Has children -->
                  <q-expansion-item
                    v-if="link.children"
                    :icon="link.icon"
                    :label="link.title"
                    expand-separator
                  >
                    <q-item
                      v-for="child in link.children"
                      :key="child.title"
                      clickable
                      v-ripple
                      @click="$router.push(child.link)"
                      class="q-ml-lg"
                    >
                      <q-item-section avatar>
                        <q-icon :name="child.icon" />
                      </q-item-section>
                      <q-item-section>{{ child.title }}</q-item-section>
                    </q-item>
                  </q-expansion-item>

                  <!-- Normal link -->
                  <q-item
                    v-else
                    clickable
                    v-ripple
                    @click="$router.push(link.link)"
                  >
                    <q-item-section avatar>
                      <q-icon
                        :name="link.icon || undefined"
                        :src="link.iconImg || undefined"
                      />
                    </q-item-section>
                    <q-item-section>{{ link.title }}</q-item-section>
                  </q-item>
                </template>
              </template>
            </template>
          </q-expansion-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer class="bg-grey-10 text-white">
      <div class="q-pa-sm column items-center">
        <div class="q-mb-xs">
          <q-btn flat label="Privacy" to="/privacy" class="text-white" />
          <q-btn flat label="Terms" to="/terms" class="text-white" />
          <q-btn
            flat
            label="Content Policy"
            to="/content-policy"
            class="text-white"
          />
        </div>
        <div class="text-caption">
          🧠 Powered by
          <a
            href="https://www.ismehr.com"
            target="_blank"
            class="text-blue-4 text-weight-medium"
          >
            Ismehr
          </a>
          <span class="text-grey-5"> – Multi-Perspective Persona Engine </span>
        </div>

        <q-btn
          flat
          size="sm"
          color="blue-4"
          label="Try the AI Leather Cleaning App Now"
          to="/marketing"
          class="q-mt-xs"
        />
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useStoreAuth } from "src/stores/storeAuth";
import { useStoreUsers } from "src/stores/storeUsers";
import { useRouter, useRoute } from "vue-router";
import { useLightOrDark } from "src/use/useLightOrDark";
import { LocalStorage } from "quasar";
import { collection, getDocs } from "firebase/firestore";
import { db, auth, dbRealtime } from "src/firebase/init"; // ✅ Make sure it's the Firestore instance
import { ref as dbRef, set } from "firebase/database";
import { apiNode } from "boot/apiNode";
import { onAuthStateChanged } from "firebase/auth";

const storeUsers = useStoreUsers();
const storeAuth = useStoreAuth();
const router = useRouter();
const route = useRoute(); // Import useRoute to get current route
const $q = useQuasar();

const leftDrawerOpen = ref(false);
const dropdownOpen = ref(false); // Manage dropdown visibility
const userAvatar = ref(""); // Avatar from Firestore
const tenants = ref([]); // at the top

const historyStack = ref([]);
const currentIndex = ref(-1);

const userIsAdmin = ref(false);

const defaultAvatar = "src/assets/default-avatar.png"; // Local fallback
// Computed properties for checking logged-in status, admin role, and signup page
const isLoggedIn = computed(() => !!storeAuth.user); // True if a user is logged in
const isSignupPage = computed(() => route.path === "/signup"); // True if on signup page
//const isAdmin = computed(() => storeUsers.user?.role === "admin"); // True if user is admin

// Avatar fallback logic
const finalAvatarUrl = computed(() => userAvatar.value || defaultAvatar);

// 🚀 Load avatar from Firebase Firestore
async function loadAvatar(uid) {
  if (!uid) {
    console.warn("⏳ Skipping avatar load: UID is undefined");
    return;
  }
  try {
    console.log("👤 Loading avatar for:", uid);
    const avatarCollectionRef = collection(db, `users/${uid}/avatar`);
    const avatarSnapshot = await getDocs(avatarCollectionRef);

    if (!avatarSnapshot.empty) {
      const avatarDoc = avatarSnapshot.docs[0];
      const avatarData = avatarDoc.data();
      console.log("✅ Avatar found:", avatarData);

      userAvatar.value = avatarData.imageUrl || "";
    } else {
      console.warn("⚠️ No avatar document found.");
    }
  } catch (err) {
    console.error("❌ Error loading avatar from Firestore:", err);
  }
}

//----------------------------------------------------------

onMounted(() => {
  const userIsAdmin = ref(false);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role || [];

      userIsAdmin.value = Array.isArray(role)
        ? role.includes("admin")
        : role === "admin";
    }
  });
});

// Watch for changes in the user data to trigger updates
watch(
  () => storeAuth.user,
  async (newUser) => {
    if (newUser) {
      await storeUsers.init(); // Initialize the store and load user data
      await loadAvatar(newUser.uid);
    }
  },
  { immediate: true },
);

// Auto-redirect based on pending invite status
watch(
  () => storeUsers.user?.pendingInvite?.merchantId,
  (merchantId) => {
    if (merchantId) {
      console.log("📨 Detected pending invite, routing to /pending-invite...");
      router.push("/pending-invite");
    }
  },
  { immediate: true },
);
// Extra safety: Try load on mount too
onMounted(async () => {
  if (storeAuth.user) {
    await storeUsers.init();
    await loadAvatar(storeAuth.user.uid);

    if (storeUsers.user?.pendingInvite?.merchantId) {
      console.log("📨 Detected pending invite, routing to /pending-invite...");
      router.push("/pending-invite");
    }
  }
});

//----------------------------------------------------
function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

const navLinks = [
  {
    category: "Marketplace",
    icon: "storefront",
    links: [
      {
        title: "Browse Marketplace",
        icon: "shopping_cart",
        link: "/marketplace",
      },
      {
        title: "My Private Posts",
        icon: "lock",
        link: "/private-posts",
      },
      {
        title: "V06 Persona",
        icon: "psychology",
        link: "/expert-persona-v06",
      },
    ],
  },

  {
    category: "General",
    icon: "apps",
    links: [
      { title: "Settings", icon: "settings", link: "/settings" },
      { title: "About", icon: "info", link: "/business-about" },
      { title: "Tools", icon: "info", link: "/business-info" },
    ],
  },
  {
    category: "AI HR Assistant",
    icon: "work",
    links: [
      {
        title: "Authentication",
        icon: "vpn_key",
        children: [
          { title: "HR User Login", icon: "login", link: "/py_loginPage" },
          {
            title: "HR user Register",
            icon: "person_add",
            link: "/py_registerPage",
          },
        ],
      },
      { title: "HR Dashboard", icon: "work", link: "/hr-agent" },
      {
        title: "Job Descriptions",
        icon: "edit_note",
        link: "/job-description",
      },
      {
        title: "Job Opening",
        icon: "badge",
        link: "/public/job-opening",
      },
      {
        title: "Screened Resumes",
        icon: "fact_check", // or use iconImg if using custom image
        link: "/resume-screened",
      },
      {
        title: "Semantic R/J",
        iconImg: "/icons/icons8-static-view-level1-100.png",
        link: "/semantic-match",
      },
      {
        title: "Resumes ",
        iconImg: "/icons/icons8-resume-100.png",
        link: "/resume-history",
      },
    ],
  },

  {
    category: "Media Hub",
    icon: "perm_media",
    links: [
      // { title: "Camera", icon: "eva-camera", link: "/camera" },
      {
        title: " Camera",
        icon: "eva-camera",
        children: [
          {
            title: "📸 Single Shot",
            icon: "photo_camera",
            link: "/camera",
          },
          {
            title: "📷 Batch Mode",
            icon: "collections",
            link: "/camera/batch",
          },
        ],
      },
      {
        title: "Video Camera",
        icon: "eva-video-outline",
        link: "/videoCamera",
      },
      { title: "TTS/STT", icon: "eva-mic-outline", link: "/audios" },
      { title: "Videos", icon: "eva-film-outline", link: "/videos" },

      // { title: "Photos", icon: "image", link: "/photos" },
      {
        title: "Photos",
        icon: "image",
        children: [
          {
            title: "📁 All Photos",
            icon: "collections",
            link: "/photos", // your existing general view
          },
          {
            title: "🌐 Public",
            icon: "public",
            link: "/photos",
          },
          {
            title: "🔒 Private (Clients)",
            icon: "lock",
            link: "/photos/private",
          },
          {
            title: "🛍️ Marketplace",
            icon: "storefront",
            link: "/marketplace",
          },
          {
            title: "🧑‍💼 My Posts",
            icon: "person",
            link: "/photos/mine",
          },
        ],
      },

      {
        title: "Audio Files",
        icon: "graphic_eq",
        link: "/audio-posts",
      },
    ],
  },
  {
    category: "Social & Chat",
    icon: "connect_without_contact",
    links: [
      { title: "ChatBot", icon: "smart_toy", link: "/chatBot" },
      {
        title: "Tenant",
        icon: "support_agent",
        link: "/tenants",
        adminOnly: true,
      },
      {
        title: "VisionBot",
        icon: "visibility",
        link: "/vision-bot",
      },
    ],
  },
  {
    category: "Transactions",
    icon: "receipt_long",
    links: [
      {
        title: "All Transactions",
        icon: "point_of_sale",
        link: "/mongo-AllTransacts",
        adminOnly: true, // ✅ only admin can see
      },
      {
        title: "Buyer Transactions",
        icon: "table_chart",
        link: "/mongo-mytransacts",
      },
      {
        title: "Seller Transactions", // ✅ Add this one
        icon: "storefront",
        link: "/merchant-transactions",
        merchantOnly: true, // ✅ only merchant can see
      },
      {
        title: "Search by Phone# ", // ✅ Add this one
        icon: "search",
        link: "/mongo-transacts",
      },
      { title: "Create Transaction", icon: "add", link: "/new-transaction" },
      { title: "$ Ledger ", icon: "savings", link: "/ledger" },
    ],
  },
];

// Toggles the drawer's visibility
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Go to profile page of the logged-in user
function goToProfile() {
  if (storeAuth.user) {
    router.push("/profile/edit/"); // Redirects to the User Profile page
    dropdownOpen.value = false; // Ensure dropdown closes
  } else {
    console.error("User is not logged in");
    router.push("/login"); // Redirect to login if the user is not logged in
  }
}

// Logout function
async function logout() {
  const user = auth.currentUser; // ✅ must use BEFORE logout

  if (user && user.uid) {
    const userPresenceRef = dbRef(dbRealtime, `usersPresence/${user.uid}`);
    try {
      await set(userPresenceRef, {
        online: false,
        lastSeen: Date.now(),
      });
      console.log("✅ User marked offline in Realtime DB.");
    } catch (err) {
      console.warn("⚠️ Failed to update presence status:", err);
    }
  }
  try {
    await apiNode.post(
      "/api/comments/markOffline",
      {},
      {
        headers: {
          Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        },
      },
    );
    console.log("✅ Comments marked offline");
  } catch (err) {
    console.warn("⚠️ Failed to mark comments offline", err);
  }

  // ⚠️ Only logout AFTER presence is updated
  await storeAuth.logoutUser(); // 🔒 logs user out
  storeUsers.clearUsers();
  dropdownOpen.value = false;

  $q.notify({
    type: "negative",
    message: "Logged out successfully",
    timeout: 1500,
  });

  setTimeout(() => {
    router.push("/login");
  }, 1500);
}

// Quit app function for electron platform
function quitApp() {
  $q.dialog({
    title: "Confirm",
    message: "Really quit SaaS-app?",
    cancel: true,
    persistent: true,
    html: true,
    ok: { label: "Quit", color: "negative", noCaps: true },
    cancel: { color: "primary", noCaps: true },
  }).onOk(() => {
    if ($q.platform.is.electron) ipcRenderer.send("quit-app");
  });
}

function isActive(page) {
  return router.currentRoute.value.path === `/${page}`;
}

const showAppInstallBanner = ref(false);
let deferredPrompt = null;

// Handle "Install" button click
const installApp = () => {
  showAppInstallBanner.value = false;

  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        neverShowAppInstallBanner();
      } else {
        console.log("User dismissed the install prompt");
      }
    });
  }
};

// Handle "Never" button click
const neverShowAppInstallBanner = () => {
  showAppInstallBanner.value = false;
  LocalStorage.set("neverShowAppInstallBanner", true);
};

// Detect install prompt
onMounted(() => {
  console.log("👀 Waiting for beforeinstallprompt...");

  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("✅ beforeinstallprompt fired!");

    e.preventDefault();
    deferredPrompt = e;

    // Only show banner if user hasn't chosen "Never"
    if (!LocalStorage.getItem("neverShowAppInstallBanner")) {
      showAppInstallBanner.value = true;
    }
  });

  // Optional: detect successful install
  window.addEventListener("appinstalled", () => {
    console.log("🎉 App was installed");
    $q.notify({
      type: "positive",
      message: "SaaS app installed successfully!",
    });
  });
});

//-----------------------------------

onMounted(() => {
  // Initialize once
  if (historyStack.value.length === 0) {
    historyStack.value.push(route.fullPath);
    currentIndex.value = 0;
  }

  // Use beforeEach to intercept navigation early
  router.beforeEach((to, from, next) => {
    const last = historyStack.value[currentIndex.value];

    if (last !== to.fullPath) {
      // If user is in middle of stack and navigates, trim forward history
      historyStack.value = historyStack.value.slice(0, currentIndex.value + 1);

      historyStack.value.push(to.fullPath);
      currentIndex.value++;
    }

    next(); // continue navigation
  });
});

const canGoBack = computed(() => currentIndex.value > 0);
const canGoForward = computed(
  () => currentIndex.value < historyStack.value.length - 1,
);

const goBack = () => {
  if (canGoBack.value) {
    currentIndex.value--;
    router.push(historyStack.value[currentIndex.value]);
  }
};

const goForward = () => {
  if (canGoForward.value) {
    currentIndex.value++;
    router.push(historyStack.value[currentIndex.value]);
  }
};
//----------------------------
</script>
<style lang="scss" scoped>
.logo-link {
  height: 32px;
  width: 32px;
  cursor: pointer;
}
</style>
