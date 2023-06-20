import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  var signup: (id?: string) => Promise<string[]>;
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51NKbyQFnVez7BDtI8axhiOSiBAT2nFOnk24zVIgSABnI9qNesUM2sIKrYVn8vCskSxydL3o7pSloxPsSP2p4K8MK009j4ziRms";

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "asdff";
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
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

global.signup = async (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJS = JSON.stringify(session);

  const base64 = Buffer.from(sessionJS).toString("base64");

  return [`session=${base64}`];
};
