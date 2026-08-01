import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { hash } from "bcryptjs";

const rl = createInterface({ input, output });
const password = await rl.question("Admin password: ", { hideEchoBack: true });
const confirm = await rl.question("Confirm password: ", { hideEchoBack: true });
rl.close();

if (!password || password !== confirm) {
  console.error("Passwords did not match.");
  process.exit(1);
}

const passwordHash = await hash(password, 12);
console.log(passwordHash);
