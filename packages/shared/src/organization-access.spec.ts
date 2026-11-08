import { describe, expect, it } from "vitest";
import type { AuthUser } from "./auth.js";
import {
  canManageAllMerchants,
  canManageMerchants,
  canViewOrganization,
} from "./organization-access.js";
import { OrganizationType } from "./organizations.js";
import { Permission } from "./permissions.js";
import { RoleName } from "./roles.js";

const CLIENT_ORGANIZATION_ID = 2;
const OTHER_CLIENT_ORGANIZATION_ID = 3;

function createClientUser(changes: Partial<AuthUser>): AuthUser {
  return {
    id: 10,
    name: "Cindy Flores",
    email: "cindy.flores@baleadasdonamary.hn",
    phoneNumber: "+50433087719",
    role: RoleName.Agent,
    organizationId: CLIENT_ORGANIZATION_ID,
    organizationType: OrganizationType.Merchant,
    permissions: [],
    ...changes,
  };
}

describe("canManageMerchants", () => {
  it("lets a client administrator manage the merchants of their organization", () => {
    const administrator = createClientUser({ role: RoleName.Administrator });
    expect(canManageMerchants(administrator, CLIENT_ORGANIZATION_ID)).toBe(
      true,
    );
  });

  it("does not let a client administrator manage another organization", () => {
    const administrator = createClientUser({ role: RoleName.Administrator });
    expect(
      canManageMerchants(administrator, OTHER_CLIENT_ORGANIZATION_ID),
    ).toBe(false);
  });

  it("lets a client agent manage merchants only with the permission", () => {
    const agent = createClientUser({});
    const agentWithPermission = createClientUser({
      permissions: [Permission.ManageMerchants],
    });
    expect(canManageMerchants(agent, CLIENT_ORGANIZATION_ID)).toBe(false);
    expect(
      canManageMerchants(agentWithPermission, CLIENT_ORGANIZATION_ID),
    ).toBe(true);
  });

  it("keeps managing every merchant for Volá! only", () => {
    const clientAgent = createClientUser({
      permissions: [Permission.ManageMerchants],
    });
    const platformAgent = createClientUser({
      organizationId: 1,
      organizationType: OrganizationType.Platform,
      permissions: [Permission.ManageMerchants],
    });
    expect(canManageAllMerchants(clientAgent)).toBe(false);
    expect(canManageAllMerchants(platformAgent)).toBe(true);
  });
});

describe("canViewOrganization", () => {
  it("lets a client agent who manages merchants see their organization", () => {
    const agent = createClientUser({
      permissions: [Permission.ManageMerchants],
    });
    expect(canViewOrganization(agent, CLIENT_ORGANIZATION_ID)).toBe(true);
    expect(
      canViewOrganization(createClientUser({}), CLIENT_ORGANIZATION_ID),
    ).toBe(false);
  });
});
