import mongoose from "mongoose";
import { TicketCreatedEvent } from "@ak_tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const fakeData: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    title: "Aasdf",
    userId: new mongoose.Types.ObjectId().toHexString(),
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

it("creates and saves a ticket", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  const ticket = await Ticket.findById(fakeData.id);
  expect(ticket).toBeDefined();
  expect(ticket!.price).toEqual(fakeData.price);
  expect(ticket!.title).toEqual(fakeData.title);
});

it("ack the message", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage.ack).toHaveBeenCalled();
});
