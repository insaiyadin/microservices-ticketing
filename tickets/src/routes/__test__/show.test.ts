import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  const response = await request(app)
    .get("/api/tickets/asdasfasgasga")
    .send()
    .expect(404);
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

it("returns 404 if the ticket is not found", async () => {});

it("returns 404 if the ticket is not found", async () => {});

it("returns 404 if the ticket is not found", async () => {});

it("returns 404 if the ticket is not found", async () => {});
