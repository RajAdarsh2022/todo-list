const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


items = ["Buy Food", "Cook Food", "Eat Food"];
app.get("/", (req, res) => {
  var today = new Date();
  var options = {
    weekday : "long",
    day: "numeric",
    month: "long"
  };
  var day = today.toLocaleDateString("en-US", options);
  res.render("list", { currDay: day  ,  lists : items});
});

app.post("/" , (req, res) => {
  var item = req.body.task;
  items.push(item);
  res.redirect("/");
});


app.listen("3000", function () {
  console.log("Server is listening on port 3000");
});
