import { Publisher, OrderCancelledEvent, Subjects } from "@ak_tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
