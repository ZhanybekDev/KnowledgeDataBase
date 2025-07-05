import Keycloak from "keycloak-js";

export interface KeycloakPluginConfig {
  config: Keycloak.KeycloakConfig;
  initOptions?: Keycloak.KeycloakInitOptions;
}

export type KeycloakConfigFactory = () => KeycloakPluginConfig;
export type KeycloakConfigAsyncFactory = () => Promise<KeycloakPluginConfig>;

export type KeycloakConfig =
  | string
  | KeycloakPluginConfig
  | KeycloakConfigFactory
  | KeycloakConfigAsyncFactory;
