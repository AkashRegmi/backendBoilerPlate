import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.log("Redis Error:", err);
});

client.on("connect", () => {
  console.log("Redis connected");
});

client.on("ready", () => {
  console.log("Redis ready");
});

client.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

client.on("end", () => {
  console.log("Redis connection closed");
});

async function connectRedis() {
  try {
    await client.connect();
  } catch (err) {
    if(err instanceof AggregateError ){
        console.log(err.errors);
    }
    // console.error("Failed to connect Redis:", err);
    // process.exit(1);
  }
}

export { client, connectRedis };
