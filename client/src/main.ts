import './polyfills';
import './assets/styles/custom.css';
import './assets/js/custom.js';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from '@/app.module';
import { enableProdMode } from '@angular/core';

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);
