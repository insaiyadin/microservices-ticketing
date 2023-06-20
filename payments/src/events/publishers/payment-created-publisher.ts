import { PaymentCreatedEvent, Publisher, Subjects } from "@ak_tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
