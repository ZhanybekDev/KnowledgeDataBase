// import Keycloak from "keycloak-js";
// import {Ref, toRefs} from "vue";
// import { getKeycloak } from "./keycloak";
// import {  state} from "./state";
// import type { KeycloakState } from "./state";
// import { isNull } from "@/utilities/type-check.util.ts";
//
// export interface KeycloakComposable {
//   isAuthenticated: Ref<boolean>;
//   hasFailed: Ref<boolean>;
//   isPending: Ref<boolean>;
//   token: Ref<string>;
//   username: Ref<string>;
//   roles: Ref<string[]>;
//   resourceRoles: Ref<Record<string, string[]>>;
//   keycloak: Keycloak;
//   hasRoles: (roles: string[]) => boolean;
//   hasResourceRoles: (roles: string[], resource: string) => boolean;
// }
//
// export const useKeycloak = (): KeycloakComposable => {
//   return {
//     ...toRefs<KeycloakState>(state),
//     keycloak: getKeycloak(),
//     hasRoles: (roles: string[]) =>
//       !isNull(roles) &&
//       state.isAuthenticated &&
//       roles.every((role) => state.roles.includes(role)),
//     hasResourceRoles: (roles: string[], resource: string) =>
//       !isNull(roles) &&
//       !isNull(resource) &&
//       state.isAuthenticated &&
//       roles.every((role) => state.resourceRoles[resource].includes(role)),
//   };
// };
