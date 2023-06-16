import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signup())
    .send({
      ticketId,
    })
    .expect(404);
});

it("returns an error if the ticket is reserved", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "asdf",
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    ticket,
    userId: "asgasg",
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "asdf",
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it.todo("emits an order:created event");
