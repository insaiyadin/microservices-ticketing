import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Ticket } from "../../../models/ticket";
import { Order, OrderStatus } from "../../../models/order";
import mongoose from "mongoose";
import { ExpirationCompleteEvent } from "@ak_tickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "asdfff",
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
    userId: "asgfasg",
  });
  await order.save();

  const fakeData: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //   @ts-ignore
  const fakeMessage: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    ticket,
    order,
    fakeData,
    fakeMessage,
  };
};

it("updates the order status to cancelled", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const order = await Order.findById(fakeData.orderId);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("emits and order:cancelled event", async () => {
  const { listener, fakeData, fakeMessage, order } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const updated = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(updated.id).toEqual(order.id);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acks the message", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage.ack).toHaveBeenCalled();
});
