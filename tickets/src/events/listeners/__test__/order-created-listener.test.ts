import { OrderCreatedEvent, OrderStatus } from "@ak_tickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "asdf",
    price: 10,
    userId: "asdfgg",
  });
  await ticket.save();

  const fakeData: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    userId: "asdf",
    version: 0,
  };

  //   @ts-ignore
  const fakeMessage: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    fakeData,
    fakeMessage,
    ticket,
  };
};

it("sets the orderId of the ticket", async () => {
  const { listener, fakeData, fakeMessage, ticket } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const updated = await Ticket.findById(ticket.id);

  expect(updated!.orderId).toEqual(fakeData.id);
});

it("acks the message", async () => {
  const { listener, fakeData, fakeMessage, ticket } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, fakeData, fakeMessage, ticket } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(fakeData.id).toEqual(updatedData.orderId);
});
