import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@ak_tickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

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

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const cookie = await signup(userId);
  const price = Math.floor(Math.random() * 10000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    status: OrderStatus.Created,
    version: 0,
    userId,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", cookie)
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.amount).toEqual(price * 100);
  expect(stripeCharge?.currency).toEqual("pln");

  const foundPayment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(foundPayment).not.toBeNull();
  expect(foundPayment!.orderId).toEqual(order.id);
  expect(foundPayment!.stripeId).toEqual(stripeCharge!.id);

  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual("tok_visa");
  // expect(chargeOptions.amount).toEqual(10 * 100);
  // expect(chargeOptions.currency).toEqual("pln");
});
