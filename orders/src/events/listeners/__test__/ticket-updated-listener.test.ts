import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@ak_tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const newTicketId = new mongoose.Types.ObjectId().toHexString();

  const fakeTicket = Ticket.build({
    id: newTicketId,
    price: 150,
    title: "asdff",
  });
  await fakeTicket.save();

  const fakeData: TicketUpdatedEvent["data"] = {
    id: newTicketId,
    version: fakeTicket.version + 1,
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
    fakeTicket,
  };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, fakeData, fakeMessage, fakeTicket } = await setup();

  const ticket = await Ticket.findById(fakeTicket.id);
  expect(ticket).toBeDefined();

  await listener.onMessage(fakeData, fakeMessage);

  const updatedTicket = await Ticket.findById(fakeTicket.id);
  expect(updatedTicket!.title).toEqual(fakeData.title);
  expect(updatedTicket!.price).toEqual(fakeData.price);
  expect(updatedTicket!.version).toEqual(fakeData.version);
});

it("ack the message", async () => {
  const { listener, fakeData, fakeMessage } = await setup();

  await listener.onMessage(fakeData, fakeMessage);

  expect(fakeMessage.ack).toHaveBeenCalled();
});

it("does not call ack if the event has wrong version", async () => {
  const { listener, fakeData, fakeMessage, fakeTicket } = await setup();

  fakeData.version += 1;
  try {
    await listener.onMessage(fakeData, fakeMessage);
  } catch (err) {}

  expect(fakeMessage.ack).not.toHaveBeenCalled();
});
