/**
 * Centralized registry of all Socket.IO / notification event names.
 * Always use these constants instead of raw strings when sending notifications.
 */
export enum NOTIFICATION_EVENT {
  // ── StaffCreated ───────────────────────────────────────
  STAFF_CREATED = 'staff_created',
  // ── Stock ─────────────────────────────────────────
  LOW_STOCK_ALERT = 'low_stock_alert',

  // ── Orders ────────────────────────────────────────
  ORDER_CREATED = 'order_created',
  NEW_ORDER = 'new_order',          // admin/manager alert when a new order arrives
  ORDER_UPDATED = 'order_updated',
  ORDER_ASSIGNED = 'order_assigned', // delivery person assignment

  // ── User / Auth ───────────────────────────────────
  UPDATE_PROFILE = 'update_profile',
}
