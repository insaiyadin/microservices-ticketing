import { Publisher, Subjects, TicketUpdatedEvent } from "@ak_tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
