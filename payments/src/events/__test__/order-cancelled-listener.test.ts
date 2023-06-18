import { OrderCancelledEvent, OrderStatus } from "@ak_tickets/common";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledListener } from "../listeners/order-cancelled-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: "Asgasg",
    version: 0,
  });
  await order.save();

  const fakeData: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: {
      id: "asgasg",
    },
    version: 1,
  };

  //   @ts-ignore
  const fakeMessage: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    fakeData,
    fakeMessage,
    order,
  };
};

it("updates status of the order", async () => {
  const { fakeData, fakeMessage, listener, order } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { fakeData, fakeMessage, listener, order } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage.ack).toHaveBeenCalled();
});
