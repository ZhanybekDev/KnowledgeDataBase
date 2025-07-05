import Keycloak from "keycloak-js";
import { hasFailed, isAuthenticated, isPending, setToken } from "./state";
import { isNull } from "@/utilities/type-check.util.ts";

type KeycloakInstance = Keycloak | undefined;

let $keycloak: KeycloakInstance;

export async function isTokenReady(): Promise<void> {
  return new Promise((resolve) => checkToken(resolve));
}

const checkToken = (resolve: () => void) => {
  if (!isNull($keycloak?.token)) {
    resolve();
  } else {
    setTimeout(() => checkToken(resolve), 500);
  }
};

export function getKeycloak(): Keycloak {
  return $keycloak as Keycloak;
}

export async function getToken(): Promise<string> {
  return updateToken();
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    if (!$keycloak?.authenticated) {
      return false;
    }
    await updateToken();
    return true;
  } catch (error) {
    return false;
  }
}

export async function updateToken(): Promise<string> {
  if (!$keycloak) {
    throw new Error("Keycloak is not initialized.");
  }

  try {
    await $keycloak.updateToken(5);
    setToken($keycloak.token as string, $keycloak.idToken as string);
  } catch (error) {
    hasFailed(true);
    console.error(`Failed to refresh the token, or the session has expired with`)
  }
  return $keycloak.token as string;
}

export function createKeycloak(
  config: Keycloak.KeycloakConfig | string
): Keycloak {
  $keycloak = new Keycloak(config);
  return getKeycloak();
}

export async function initKeycloak(
  initConfig: Keycloak.KeycloakInitOptions
): Promise<void> {
  try {
    if (!$keycloak) throw new Error("Keycloak is null and not defined");

    isPending(true);
    const _isAuthenticated = await $keycloak.init(initConfig);
    isAuthenticated(_isAuthenticated);
    if (!isNull($keycloak.token)) {
      setToken($keycloak.token as string, $keycloak?.idToken as string);
    }

    $keycloak.onAuthRefreshSuccess = () => setToken($keycloak?.token as string, $keycloak?.idToken as string);
    $keycloak.onTokenExpired = () => updateToken();
  } catch (error) {
    hasFailed(true);
    isAuthenticated(false);
    throw new Error("Could not read access token");
  } finally {
    isPending(false);
  }
}
