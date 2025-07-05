import { reactive } from "vue";
import {jwtDecode} from "jwt-decode";

export interface KeycloakState<T = unknown> {
  isAuthenticated: boolean;
  hasFailed: boolean;
  isPending: boolean;
  token: string;
  idToken: string;
  decodedToken: T;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  resourceRoles: Record<string, string[]>;
}

export const state = reactive<KeycloakState>({
  isAuthenticated: false,
  hasFailed: false,
  isPending: false,
  token: "",
  idToken: "",
  decodedToken: {},
  username: "",
  firstName: "",
  lastName: "",
  roles: [] as string[],
  resourceRoles: {},
});

interface TokenContent {
  preferred_username: string;
  given_name: string;
  family_name: string;
  realm_access: {
    roles: string[];
  };
  resource_access: Record<string, { roles: string[] }>;
}

export const setToken = (token: string, idToken: string): void => {
  state.token = token;
  state.idToken = idToken;
  const content = jwtDecode<TokenContent>(state.token);

  state.decodedToken = content;
  state.roles = content.realm_access.roles;
  state.username = content.preferred_username;
  state.firstName = content.given_name;
  state.lastName = content.family_name;
  state.resourceRoles = content.resource_access
    ? Object.fromEntries(
        Object.entries(content.resource_access).map(([key, value]) => [
          key,
          value.roles,
        ]),
      )
    : {};
};

export const hasFailed = (value: boolean): void => {
  state.hasFailed = value;
};

export const isPending = (value: boolean): void => {
  state.isPending = value;
};

export const isAuthenticated = (value: boolean): void => {
  state.isAuthenticated = value;
};
