import type { Plugin } from 'vue';
import Keycloak from "keycloak-js";
import { defaultInitConfig } from "./const";
import { createKeycloak, initKeycloak } from "./keycloak";
import {
  isFunction,
  isNull,
  isPromise,
  isString,
} from "@/utilities/type-check.util.ts";
import { loadJsonConfig } from "./config";
import type {
  KeycloakConfig,
  KeycloakConfigAsyncFactory,
  KeycloakPluginConfig,
} from "@/plugins/keycloak/keycloak.interface";

export const vueKeycloak: Plugin = {
  async install(app, options: KeycloakConfig) {
    if (isNull(options)) {
      throw new Error("The Keycloak.KeycloakConfig are required");
    }

    let keycloakPluginConfig: KeycloakPluginConfig;
    if (isString(options)) {
      keycloakPluginConfig = await loadJsonConfig(options as string);
    } else if (isPromise(options) || isFunction(options)) {
      keycloakPluginConfig = await (options as KeycloakConfigAsyncFactory)();
    } else {
      keycloakPluginConfig = options as KeycloakPluginConfig;
    }

    const keycloakConfig = keycloakPluginConfig.config;
    const keycloakInitOptions: Keycloak.KeycloakInitOptions = !isNull(
      keycloakPluginConfig.initOptions
    )
      ? { ...defaultInitConfig, ...keycloakPluginConfig.initOptions }
      : defaultInitConfig;

    app.config.globalProperties.$keycloak = createKeycloak(keycloakConfig);

    await initKeycloak(keycloakInitOptions);
  },
};

