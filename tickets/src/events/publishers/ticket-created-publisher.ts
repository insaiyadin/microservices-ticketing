import { Publisher, Subjects, TicketCreatedEvent } from "@ak_tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
