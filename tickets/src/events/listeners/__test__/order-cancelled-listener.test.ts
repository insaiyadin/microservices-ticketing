import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@ak_tickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    price: 10,
    title: "asdf",
    userId: "ASgasg",
  });
  ticket.set({ orderId });
  await ticket.save();

  const fakeData: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: {
      id: ticket.id,
    },
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
    orderId,
  };
};

it("updates the ticket and publishes an event", async () => {
  const { fakeData, fakeMessage, listener, ticket, orderId } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const updatedTicket = await Ticket.findById(fakeData.ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("acks the message", async () => {
  const { fakeData, fakeMessage, listener, ticket, orderId } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage!.ack).toHaveBeenCalled();
});
