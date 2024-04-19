process.on("unhandledRejection", (err) => {
  console.log(`${err.name} ${err.message}`);
  process.exit(1);
});
process.on("uncaughtException", (err) => [
  console.log(`${err.name} ${err.message}`),
]);
const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5100;

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, { useNewUrlParser: true })
  .then(() =>
    app.listen(PORT, () => console.log(`app running on port ${PORT}`))
  )
  .catch((err) => console.log(err));
