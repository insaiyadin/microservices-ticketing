import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "asdf";
  const price = 15;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signup())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResp = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResp.body.title).toEqual(title);
  expect(ticketResp.body.price).toEqual(price);
});
