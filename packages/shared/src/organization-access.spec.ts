import { describe, expect, it } from "vitest";
import type { AuthUser } from "./auth.js";
import {
  canAssignOrders,
  canManageAllMerchants,
  canManageDriversOf,
  canManageMerchants,
  canManageOwnDrivers,
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

describe("canManageOwnDrivers", () => {
  it("lets a client administrator and an agent with the permission manage drivers", () => {
    expect(
      canManageOwnDrivers(createClientUser({ role: RoleName.Administrator })),
    ).toBe(true);
    expect(
      canManageOwnDrivers(
        createClientUser({ permissions: [Permission.ManageDrivers] }),
      ),
    ).toBe(true);
    expect(canManageOwnDrivers(createClientUser({}))).toBe(false);
  });

  it("does not apply to Volá! users", () => {
    const platformAdministrator = createClientUser({
      role: RoleName.Administrator,
      organizationId: 1,
      organizationType: OrganizationType.Platform,
    });
    expect(canManageOwnDrivers(platformAdministrator)).toBe(false);
  });
});

describe("canManageDriversOf", () => {
  it("lets Volá! manage drivers of any organization", () => {
    const platformAgent = createClientUser({
      organizationId: 1,
      organizationType: OrganizationType.Platform,
      permissions: [Permission.ManageDrivers],
    });
    expect(canManageDriversOf(platformAgent, 1)).toBe(true);
    expect(
      canManageDriversOf(platformAgent, OTHER_CLIENT_ORGANIZATION_ID),
    ).toBe(true);
  });

  it("does not let a Volá! agent without the permission manage drivers", () => {
    const platformAgent = createClientUser({
      organizationId: 1,
      organizationType: OrganizationType.Platform,
    });
    expect(canManageDriversOf(platformAgent, CLIENT_ORGANIZATION_ID)).toBe(
      false,
    );
  });

  it("keeps a client administrator within their organization", () => {
    const administrator = createClientUser({ role: RoleName.Administrator });
    expect(canManageDriversOf(administrator, CLIENT_ORGANIZATION_ID)).toBe(
      true,
    );
    expect(
      canManageDriversOf(administrator, OTHER_CLIENT_ORGANIZATION_ID),
    ).toBe(false);
  });
});

describe("canAssignOrders", () => {
  it("lets a client administrator assign orders of their organization only", () => {
    const administrator = createClientUser({ role: RoleName.Administrator });
    expect(canAssignOrders(administrator, CLIENT_ORGANIZATION_ID)).toBe(true);
    expect(canAssignOrders(administrator, OTHER_CLIENT_ORGANIZATION_ID)).toBe(
      false,
    );
  });

  it("lets a client agent assign orders only with the permission", () => {
    expect(canAssignOrders(createClientUser({}), CLIENT_ORGANIZATION_ID)).toBe(
      false,
    );
    const agent = createClientUser({ permissions: [Permission.AssignOrders] });
    expect(canAssignOrders(agent, CLIENT_ORGANIZATION_ID)).toBe(true);
  });
});
