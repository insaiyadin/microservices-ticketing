import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "123124",
  });
  await ticket.save();

  const user = await signup();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const orderResponse = await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", user)
    .send({})
    .expect(200);

  expect(orderResponse.body.id).toEqual(response.body.id);
});

it("returns an error if wrong user is fetching order", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "123124",
  });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", await signup())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${response.body.id}`)
    .set("Cookie", await signup())
    .send({})
    .expect(401);

  // expect(orderResponse.body.id).toEqual(response.body.id);
});
