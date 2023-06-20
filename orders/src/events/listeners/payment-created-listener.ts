import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@ak_tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.PaymentCreated;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error("Order does not exist");
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
