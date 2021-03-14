/*  */
/*  */
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((db) => {
    console.log("DB is connected Successfully -------------------------");
  })
  .catch((err) => console.error(err));
