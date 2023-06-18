import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@ak_tickets/common";

it("returns 404 when order does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", await signup())
    .send({
      token: "asgasg",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when wrong user pays for order", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", await signup())
    .send({
      token: "asgasg",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 when paying a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = await signup(userId);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    version: 0,
    userId,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "asgasg",
      orderId: order.id,
    })
    .expect(400);
});
