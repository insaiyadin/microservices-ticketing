import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", await signup())
    .send({
      title: "asdff",
      price: 15,
    })
    .expect(404);
});

it("returns 401 if user is not authenticated", async () => {
  await request(app)
    .post(`/api/tickets`)
    .send({
      title: "asdff",
      price: 15,
    })
    .expect(401);
});

it("returns 401 if user does not own the ticket", async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", await signup())
    .send({
      title: "asdff",
      price: 15,
    });
  const id = response.body.id;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", await signup())
    .send({
      title: "a",
      price: 10,
    })
    .expect(401);
});

it("returns 400 if the user provide an invalid title or price", async () => {
  const userCookie = await signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userCookie)
    .send({
      title: "asdff",
      price: 15,
    });

  const id = response.body.id;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send({
      title: "",
      price: 10,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send({
      price: 10,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send({
      title: "asdf",
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send({
      title: "asdf",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const userCookie = await signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userCookie)
    .send({
      title: "asdff",
      price: 15,
    });

  const id = response.body.id;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send({ title: "Adrian", price: 1500 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("Adrian");
  expect(ticketResponse.body.price).toEqual(1500);
});
