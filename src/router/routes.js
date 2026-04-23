import { useStoreUsers } from "src/stores/storeUsers";
// import ResumeUpload from "src/pages/feature/py_PageResumeUpload.vue"; // ✅ Import the Resume Upload Page

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "expert-persona-demo",
        component: () => import("pages/PageExpertPersonaDemo.vue"),
      },
      // ✅ Homepage
      {
        path: "",
        redirect: "front-page",
      },

      {
        path: "front-page",
        name: "front-page",
        component: () => import("pages/PageFront.vue"),
        meta: { title: "Home | Ismehr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "user/:username",
        name: "PublicUserProfile",
        component: () => import("pages/PageMentionUserProfileUpdate.vue"),
      },
      // ✅ Public Auth Routes
      {
        path: "login",
        component: () => import("pages/Login.vue"),
        meta: { title: "Sign In  | Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "signup",
        component: () => import("pages/Signup.vue"),
      },
      {
        path: "profile/edit/:id?",
        name: "UserProfileEdit",
        component: () => import("pages/UserProfile.vue"),
        meta: { requiresAuth: true },
      },

      {
        path: "settings",
        component: () => import("pages/PageSettings.vue"),
        meta: {
          title: "Setting | Ismehr: AI SaaS for Cleaning & HR",
          requiresAuth: true,
        },
      },

      {
        path: "camera",
        component: () => import("pages/PageCamera.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Camera | Ismehr: AI SaaS for Cleaning & HR" },
        name: "Camera",
      },
      {
        path: "camera/batch",
        component: () => import("pages/PageCameraBatch.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Camera | Ismehr: AI SaaS for Cleaning & HR" },
        name: "Batch Camera ",
      },
      {
        path: "videoCamera",
        component: () => import("pages/PageVideoCam.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Video Camera | Ismehr: AI SaaS for Cleaning & HR" },
        name: "VideoCamera",
      },
      {
        path: "video-posts",
        component: () => import("pages/PageVideoView.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Video Posts | Ismehr: AI SaaS for Cleaning & HR" },
        name: "VideoPost",
      },
      {
        path: "audio-posts",
        component: () => import("pages/PageAudioView.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Audio Posts | Ismehr: AI SaaS for Cleaning & HR" },
        name: "audioPost",
      },
      {
        path: "photos",
        component: () => import("pages/PageHome.vue"),
        meta: {
          requiresAuth: true,
          title: "Camera | Ismehr: AI SaaS for Cleaning & HR",
        },
      },

      {
        path: "/photos/private",
        component: () => import("pages/PagePhotosPrivate.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Client Photos | Ismehr: AI SaaS for Cleaning & HR" },
      },
      { path: "videos", component: () => import("pages/PageVideoView.vue") },
      {
        path: "audios-AI-stt",
        component: () => import("pages/PageSTTAudio.vue"),
      },
      { path: "audios", component: () => import("pages/PageAudio.vue") },

      {
        path: "chatBot",
        component: () => import("pages/feature/PageChatBotABMode.vue"),
      },
      {
        path: "ChatbotHistory",
        component: () => import("pages/feature/PageChatbotHistory.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "firestore-users",
        component: () => import("pages/PageFirestoreUsers.vue"),
        meta: { requiresAuth: true },
        beforeEnter: async (to, from, next) => {
          const storeUsers = useStoreUsers();

          console.log("🛂 Route guard triggered for /firestore-users");

          if (!storeUsers.userLoaded) {
            console.log("🔄 Initializing user data...");
            await storeUsers.init();
          }

          console.log("🔍 storeUsers.user =", storeUsers.user);

          const roleField = storeUsers.user?.role;
          const roles = Array.isArray(roleField) ? roleField : [roleField];

          if (roles.includes("admin")) {
            console.log("✅ Admin detected. Proceeding...");
            next();
          } else {
            console.warn("❌ Not admin. Redirecting...");
            next("/profile/edit");
          }
        },
      },

      {
        path: "mongo-users",
        component: () => import("pages/PageMongoUsers.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "mongo-transacts",
        component: () => import("pages/PageMongoTran.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "Transaction by ph# | IsmeHr: AI SaaS for Cleaning & HR",
        },
      },
      {
        path: "mongo-mytransacts",
        component: () => import("pages/PageMongo-MyTransacts.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "🛒 my-Transaction | IsmeHr: AI SaaS for Cleaning & HR",
        },
      },
      {
        path: "mongo-AllTransacts",
        component: () => import("pages/PageMongo-AllTransacts.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "🛒 All-Transact | IsmeHr: AI SaaS for Cleaning & HR",
        },
      },
      {
        path: "view-transaction/:transactId",
        component: () => import("pages/ViewTransact.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Transact by Id | Ismehr: AI SaaS for Cleaning & HR" },
      },

      // Route for creating a new transaction
      {
        path: "new-transaction",
        component: () => import("pages/RetieveTranHistory.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "🛒 Create Transact | Ismehr: AI SaaS for Cleaning & HR",
        },
      },

      {
        path: "ledger",
        component: () => import("pages/PageEntries.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "💰 Money bag | Ismehr: AI SaaS for Cleaning & HR",
        },
      },

      {
        path: "merchant-transactions",
        component: () => import("pages/PageSellerTransacts.vue"),
        meta: { requiresAuth: true },
        meta: {
          title: "🛒 Merchant Transact | Ismehr: AI SaaS for Cleaning & HR",
        },
      },

      {
        path: "tenants",
        component: () => import("pages/feature/PageTenantList.vue"),
        meta: {
          title: "🧑‍🤝‍🧑 tenant | Ismehr: AI SaaS for Cleaning & HR",
        },
      },
      {
        path: "tenants/add",
        component: () => import("pages/feature/PageTenantAdd.vue"),
        meta: {
          title: "🧑 tenant | Ismehr: AI SaaS for Cleaning & HR",
        },
      },

      {
        path: "tenants/edit/:id",
        component: () => import("pages/feature/PageTenantEdit.vue"),
      },
      {
        path: "py_loginPage",
        component: () => import("pages/feature/py_LoginPage.vue"),
      },
      {
        path: "py_registerPage",
        component: () => import("pages/feature/py_RegisterPage.vue"),
      },
      {
        path: "py_PageTodos",
        component: () => import("pages/feature/py_TodosPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "py_PageUsers",
        component: () => import("pages/feature/py_PageUsers.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "add-todo",
        component: () => import("pages/feature/py_AddTodosPage.vue"),
      },
      {
        path: "edit-todo/:id",
        component: () => import("pages/feature/py_EditTodosPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "hr-agent",
        component: () => import("pages/feature/py_PageHRChat.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "hr-chat",
        component: () => import("pages/feature/py_PageHRChat.vue"),
      },
      {
        path: "resume-history",
        component: () => import("pages/feature/py_PageResumeHistory.vue"),
      },
      {
        path: "job-description",
        component: () => import("pages/feature/py_PageJobDescription.vue"),
      },
      {
        path: "public/job-opening",
        component: () => import("pages/feature/py_PublicJobBoard.vue"),
      },
      {
        path: "resume-upload",
        component: () => import("pages/feature/py_PageResumeUpload.vue"), // ✅ Lazy-loaded component
        props: (route) => ({
          jobId: route.query.jobId,
          employerId: route.query.employerId,
          employerPhone: route.query.employerPhone,
        }),
      },

      {
        path: "resume-screened",
        component: () => import("pages/feature/py_PageAI-screenedResumes.vue"),
        meta: { requiresAuth: true }, // Only allow authenticated users
      },
      {
        path: "semantic-match",
        component: () => import("pages/feature/py_PageJobMatcher.vue"),
        meta: { requiresAuth: true }, // Optional: restrict to logged-in users
      },
      {
        path: "upload-success",
        component: () => import("pages/feature/py_SuccessfulPage.vue"),
      },
      // router/index.js or wherever you define routes
      {
        path: "replies/:postId/:commentId",
        name: "PageReplies",
        component: () => import("pages/PageReplies.vue"),
      },
      {
        path: "post-product/:postId",
        component: () => import("pages/feature/PostProduct.vue"),
      },
      {
        path: "my-products",
        name: "ProductList",
        component: () => import("pages/feature/ProductList.vue"),
      },
      {
        path: "marketplace",
        name: "marketplace",
        component: () => import("pages/feature/PageMarketplace.vue"),
        meta: { title: "Marketplace | IsmeHr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "/photos/:postId",
        component: () => import("pages/PagePhotoDetail.vue"),
        meta: { requiresAuth: true },
        meta: { title: "Photos By Id | IsmeHr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "/photos/mine",
        component: () => import("pages/PagePhotosMine.vue"),
        meta: { requiresAuth: true },
        meta: { title: "My Photos | IsmeHr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "private-posts",
        component: () => import("pages/PagePrivatePosts.vue"),
        meta: { title: "Private Posts | Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "assign-client",
        component: () => import("pages/PageAssignClient.vue"),
        meta: { title: "Assign my client | Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "preSignup",
        component: () => import("pages/PageRegisterClient.vue"),
        meta: { title: "Register Client | Ismehr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "products/:id",
        name: "ProductDetails",
        component: () => import("pages/feature/PostProduct.vue"), // ✅ or your correct file
        meta: { requiresAuth: true },
        meta: { title: "Product by Id | Ismehr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "product-view/:id",
        component: () => import("pages/feature/PostProductMongo.vue"),
        meta: { title: "Product Preview | Ismehr: AI SaaS for Cleaning & HR" },
      },

      {
        path: "new-transaction-cart", // 🚫 no leading slash
        name: "CartPage_NewTransaction",
        component: () => import("pages/feature/PageNewTransactionCart.vue"),
        meta: { title: "🛒 Shopping Cart | Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "transactions-unpaid",
        name: "CartPage_Unpaid",
        component: () => import("pages/PageCart.vue"),
        meta: { requiresAuth: true },
        meta: { title: "🛒 Transaction| Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "vision-submit",
        component: () => import("pages/PageVisionSubmit.vue"),
      },
      {
        path: "vision-bot",
        component: () => import("pages/PageVisionLog.vue"), // Adjust if path differs
        meta: { requiresAuth: true },
      },
      {
        path: "vision-details",
        component: () => import("pages/PageVisionDetails.vue"), // Adjust if path differs
        meta: { requiresAuth: true },
      },

      //-------------------------------------------------------
      {
        path: "privacy",
        component: () => import("pages/PagePrivacy.vue"),
      },
      {
        path: "terms",
        component: () => import("pages/PageTerms.vue"),
      },
      {
        path: "content-policy",
        component: () => import("pages/PageContentPolicy.vue"),
      },
      {
        path: "/pending-invite",
        component: () => import("pages/PagePendingInvite.vue"),
        meta: { requiresAuth: true }, // optional
      },
      {
        path: "detect-brand",
        component: () => import("pages/feature/PageVisualBrandMaterial.vue"),
        meta: { requiresAuth: true }, // optional
      },

      {
        path: "bluebook-bag",
        component: () => import("pages/feature/PageBluebookBag.vue"),
        meta: { requiresAuth: true }, // optional
      },

      {
        path: "try",
        name: "try-page",
        component: () => import("pages/feature/PageTry.vue"),
      }, // ✅ Add this line
      {
        path: "marketing",
        name: "Demo-page",
        component: () => import("src/pages/feature/PageTryMarketDemo.vue"),
      }, // ✅ Add this line

      {
        path: "/business-info",
        component: () => import("pages/PageBusinessLanding.vue"),
        meta: {
          title: "AI Tools for Leather & Fabric Cleaning | Ismehr",
        },
      },
      {
        path: "/business-about",
        component: () => import("pages/PageBusinessAbout.vue"),
        meta: { title: "About | Ismehr: AI SaaS for Cleaning & HR" },
      },
      {
        path: "/for-cleaners",
        component: () => import("pages/PageForCleaners.vue"),
      },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
