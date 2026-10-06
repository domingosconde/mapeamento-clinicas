import { notifyOwner } from "./_core/notification";

type ClinicEvent = {
  title: string;
  content: string;
};

/**
 * The project notification service is the safe default channel available in
 * every environment. Email delivery can be connected later without changing
 * appointment/comment procedures.
 */
export function queueClinicNotification(event: ClinicEvent): void {
  void notifyOwner(event).catch((error) => {
    console.warn("[Notification] Clinic event could not be delivered:", error);
  });
}
