// if('serviceWorker' in navigator) navigator.serviceWorker.register('/dev-sw.js?dev-sw', { scope: '/', type: 'module' })
import {Workbox} from 'workbox-window';

const wb = new Workbox('/dev-sw.js?dev-sw');
wb.register();