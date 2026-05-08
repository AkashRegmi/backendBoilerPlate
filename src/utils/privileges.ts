export enum DASHBOARD_PRIVILEGES {
  KEY = "dashboard",
  DISPLAY_CARDS = "dashboard.displayCards",
  PRODUCT_OVERVIEW = "dashboard.productOverview",
  ORDER_OVERVIEW = "dashboard.orderOverview",
}
export enum ROLEMAPPING_PRIVILEGES {
  KEY = "roleMapping",
  READ = "roleMapping.read",
  EDIT = "roleMapping.edit",
  CREATE = "roleMapping.create",
}
export enum STAFF_MANAGEMENT_PRIVILEGES {
  KEY = "staffManagement",
  CREATE_STAFF = "staffManagement.create",
  VIEW_STAFF_DETAILS = "staffManagement.view",
  EDIT_STAFF_DETAILS = "staffManagement.edit",
  DELETE_STAFF_DETAILS = "staffManagement.delete",
  DOWNLOAD_OR_IMPORT_STAFF_DETAILS = "staffManagement.downloadOrImport",
}

export const ALL_PRIVILEGES = [
  {
    module: DASHBOARD_PRIVILEGES.KEY,
    actions: [
      DASHBOARD_PRIVILEGES.DISPLAY_CARDS,
      DASHBOARD_PRIVILEGES.PRODUCT_OVERVIEW,
      DASHBOARD_PRIVILEGES.ORDER_OVERVIEW,
    ],
  },
  {
    module: ROLEMAPPING_PRIVILEGES.KEY,
    actions: [
      ROLEMAPPING_PRIVILEGES.READ,
      ROLEMAPPING_PRIVILEGES.EDIT,
      ROLEMAPPING_PRIVILEGES.CREATE,
    ],
  },
  {
    module: STAFF_MANAGEMENT_PRIVILEGES.KEY,
    actions: [
      STAFF_MANAGEMENT_PRIVILEGES.CREATE_STAFF,
      STAFF_MANAGEMENT_PRIVILEGES.VIEW_STAFF_DETAILS,
      STAFF_MANAGEMENT_PRIVILEGES.EDIT_STAFF_DETAILS,
      STAFF_MANAGEMENT_PRIVILEGES.DELETE_STAFF_DETAILS,
      STAFF_MANAGEMENT_PRIVILEGES.DOWNLOAD_OR_IMPORT_STAFF_DETAILS,
    ],
  },
];
