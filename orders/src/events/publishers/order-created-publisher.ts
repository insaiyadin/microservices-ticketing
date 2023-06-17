import { Publisher, OrderCreatedEvent, Subjects } from "@ak_tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
