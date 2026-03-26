import bcrypt from "bcrypt";

const hash = "$2b$10$pdVd747TG3vgJwrgvW.uO.5q0/hcEx.ILK4JQQLzlDbsR37UaBXma";
const password = "asdfghjkl";

bcrypt.compare(password, hash).then(result => {
  console.log("Match:", result);
});