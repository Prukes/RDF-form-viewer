import { cacheNames, clientsClaim } from 'workbox-core'
import { registerRoute, setCatchHandler, setDefaultHandler } from 'workbox-routing'
import type { StrategyHandler } from 'workbox-strategies'
import {
    NetworkFirst,
    NetworkOnly,
    Strategy
} from 'workbox-strategies'
import type { ManifestEntry } from 'workbox-build'
import {precacheAndRoute} from "workbox-precaching";

// Give TypeScript the correct global.
declare let self: ServiceWorkerGlobalScope
declare type ExtendableEvent = any


precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// self.addEventListener('fetch',(event)=>{
//     console.log('log of event from sw',event);
//     return fetch(event.request);
// });

registerRoute('http://localhost:1235/vita-study/record-manager-server/j_spring_security_check',async (event)=>{
    console.log("registerRoute ",event);
    const reg = await navigator.serviceWorker.ready;
    return fetch(event.request);
},'POST');



