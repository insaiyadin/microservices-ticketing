import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  var signup: () => Promise<string[]>;
}

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "asdff";
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = async () => {
  const payload = {
    id: "123125125",
    email: "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJS = JSON.stringify(session);

  const base64 = Buffer.from(sessionJS).toString("base64");

  return [`session=${base64}`];
};
