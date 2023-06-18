import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@ak_tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
