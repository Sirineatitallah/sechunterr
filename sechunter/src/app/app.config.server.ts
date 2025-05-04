import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideClientHydration } from '@angular/platform-browser';
import { appConfig } from './app.config';

// Configuration spécifique au serveur
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideClientHydration(),
    // Ajouter d'autres providers spécifiques au serveur si nécessaire
  ]
};

// Fusionner la configuration de base avec celle du serveur
export const config = mergeApplicationConfig(appConfig, serverConfig);
