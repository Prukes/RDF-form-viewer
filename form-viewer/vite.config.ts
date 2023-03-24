import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {ManifestOptions, VitePWA, VitePWAOptions} from "vite-plugin-pwa";
import dns from 'dns'


// https://vitejs.dev/config/

export default ({mode}) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    const pwaOptions: Partial<VitePWAOptions> = {
        mode: 'development',
        base: '/',
        includeAssets: ['favicon.ico','logo.txt','manifest.webmanifest','LoginPage.css'],
        registerType:'autoUpdate',
        workbox:{
            clientsClaim:true,
            skipWaiting:true,

        },
        injectRegister:'script',
        injectManifest:{
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
        strategies:'injectManifest',
        srcDir:'src',
        filename:'my-sw.ts',
        manifest: {
            name: 'RDF Form viewer',
            short_name: 'Form viewer',
            theme_color: '#ffffff',
            icons: [
                {
                    src: 'logo192.png', // <== don't add slash, for testing
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: '/logo512.png', // <== don't remove slash, for testing
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: 'logo512.png', // <== don't add slash, for testing
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                },
            ],
        },
        devOptions: {
            enabled: true,
            /* when using generateSW the PWA plugin will switch to classic */
            type: 'module',
            navigateFallback: 'index.html',
        },
    }

    dns.setDefaultResultOrder('verbatim')
    return defineConfig({
        plugins: [
            react(),
            VitePWA(pwaOptions)],

        server: {
            port: 3001,
            hmr:false,
        },
        preview:{
            port: 3001,
        }
    });
}
