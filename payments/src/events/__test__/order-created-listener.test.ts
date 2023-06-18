import { OrderCreatedEvent, OrderStatus } from "@ak_tickets/common";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCreatedListener } from "../listeners/order-created-listener";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const fakeData: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "asgas",
    userId: "asgasg",
    status: OrderStatus.Created,
    ticket: {
      id: "asgasg",
      price: 20,
    },
  };

  // @ts-ignore
  const fakeMessage: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    fakeData,
    fakeMessage,
  };
};

it("replicates the order", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const order = await Order.findById(fakeData.id);
  expect(order!.price).toEqual(fakeData.ticket.price);
});

it("acks the message", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);
  expect(fakeMessage.ack).toHaveBeenCalled();
});
