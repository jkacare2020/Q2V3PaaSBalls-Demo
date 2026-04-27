/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require("quasar/wrappers");
const path = require("path");
require("dotenv").config(); // Base .env
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`, // Env-specific
});

module.exports = configure(function () {
  console.log("Current Environment:", process.env.NODE_ENV);
  const resolvedApiUrl =
    process.env.NODE_ENV === "production"
      ? process.env.VITE_API_BASE_URL
      : process.env.VITE_API_LOCAL || "http://localhost:3000";

  console.log("Current Environment:", process.env.NODE_ENV);
  console.log("Resolved Node API URL:", resolvedApiUrl);
  console.log("API Local:", process.env.VITE_API_LOCAL);
  console.log("API Base URL:", process.env.VITE_API_BASE_URL);
  console.log("🧪 Using FASTAPI_URL:", process.env.VITE_FASTAPI_URL);

  return {
    bbuild: {
      vueRouterMode: "history",
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node20",
      },

      extendWebpack(cfg) {
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          "@": path.resolve(__dirname, "./src"),
        };
      },
      htmlVariables: {
        productName: "Ismehr: AI SaaS for Cleaning & HR",
        productDescription: "Your AI-powered tool for Cleaning & HR tasks",
      },
      version: "1.0.1",
    },
    boot: ["router", "apiFastAPI", "apiNode", "firebase"],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v7',
      // 'fontawesome-v6',
      "eva-icons",
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node20",
      },

      extendWebpack(cfg) {
        cfg.resolve.alias = {
          ...cfg.resolve.alias, // This adds to existing aliases
          "@": path.resolve(__dirname, "./src"),
        };
      },
      env: {
        VITE_API_LOCAL: process.env.VITE_API_LOCAL,
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,

        VITE_FASTAPI_URL: process.env.VITE_FASTAPI_URL,

        VUE_APP_FIREBASE_API_KEY: process.env.VUE_APP_FIREBASE_API_KEY,
        VUE_APP_FIREBASE_AUTH_DOMAIN: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
        VUE_APP_FIREBASE_PROJECT_ID: process.env.VUE_APP_FIREBASE_PROJECT_ID,
        VUE_APP_FIREBASE_STORAGE_BUCKET:
          process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
        VUE_APP_FIREBASE_MESSAGING_SENDER_ID:
          process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
        VUE_APP_FIREBASE_APP_ID: process.env.VUE_APP_FIREBASE_APP_ID,
      },

      // vitePlugins: [
      //   [
      //     "@intlify/vite-plugin-vue-i18n",
      //     {
      //       /* options */
      //     },
      //   ], // Example plugin
      // ],
      // chainWebpack(chain) {
      //   chain.resolve.alias.set("@", path.resolve(__dirname, "./src"));
      // },

      vueRouterMode: "hash", // available values: 'hash', 'history'
      version: "1.0.1", // Change version each time you deploy
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      // extendViteConf (viteConf) {},
      // viteVuePluginOptions: {},

      // vitePlugins: [
      //   [ 'package-name', { ..pluginOptions.. }, { server: true, client: true } ]
      // ]
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {},

      css: [
        "app.scss",
        "@quasar/extras/animate.css", // ✅ ADD THIS
      ],
      components: [
        "QPage",
        "QBtn",
        "QCard",
        "QInput", // etc...
      ],

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ["Dialog", "Notify", "Loading", "LocalStorage", "BottomSheet"],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: ["jackInTheBox", "fadeInUp", "fadeOutDown"],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      // workboxPluginMode: "GenerateSW", // or 'InjectManifest' if you're customizing

      // workboxOptions: {
      //   skipWaiting: true,
      //   clientsClaim: true,
      // }, // Can leave empty or customize
      workboxPluginMode: "InjectManifest",
      workboxOptions: {
        swSrc: "src-pwa/custom-service-worker.js",
      },
      injectPwaMetaTags: true, // ✅ Recommended for automatic `<meta>` tags
      manifest: {
        name: "Ismehr: AI SaaS for Cleaning & HR",
        short_name: "Ismehr",
        description: "Your AI-powered HR Assistant App",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#027be3",
        icons: [
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      // specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
        // platform: 'win32'
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        appId: "com.ismehr.pwa",

        // appId: "quasar-SaaS",
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
