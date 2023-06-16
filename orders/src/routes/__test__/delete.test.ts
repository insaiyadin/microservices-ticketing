import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";

it("cancels user order", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "asddf",
  });
  await ticket.save();

  const user = await signup();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send({})
    .expect(204);

  const updated = await Order.findById(order.id);

  expect(updated!.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits order:cancelled event");
