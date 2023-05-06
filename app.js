//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();
mongoose.connect(
  "mongodb+srv://admin-abdul:Etopia0178@cluster0.yalyrkj.mongodb.net/todolistDB"
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todo list!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });

const defaultItems = [item1, item2, item3];
const listScema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listScema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({})
    .then((docs) => {
      if (docs.length === 0) {
        Item.insertMany(defaultItems).catch((err) => {
          console.log("Success");
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: docs });
      }
    })
    .catch((err) => {
      console.log("No Success");
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    Item.insertMany([item]);
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((docs) => {
        docs.items.push(item);
        docs.save();
        res.redirect(`/${listName}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
app.post("/delete", (req, res) => {
  const checkedBox = req.body.checkBox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove({ _id: checkedBox }).catch((err) => {
      console.log("No Success");
    });
    res.redirect("/");
  } else {
    // List.findOneAndUpdate(
    //   { name: listName },
    //   { $pull: { items: { _id: checkedBox } } }
    // ).then((docs) => {
    //   if (docs) {
    //     res.redirect(`/${listName}`);
    //   }
    // });
    // res.redirect(`/${listName}`);
    List.findOne({ name: listName })
      .then((list) => {
        list.items = list.items.filter((item) => item._id != checkedBox);
        list.save();
        res.redirect(`/${listName}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
app.get("/favicon.ico", (req, res) => {
  res.sendFile(__dirname + "/public/favicon.ico");
});

app.get("/:postName", (req, res) => {
  const requestedPage = _.capitalize(req.params.postName);
  console.log(requestedPage);
  List.findOne({ name: requestedPage })
    .then((list) => {
      if (list) {
        res.render("list", { listTitle: list.name, newListItems: list.items });
      } else {
        const list = new List({
          name: requestedPage,
          items: defaultItems,
        });
        list.save().then(() => {
          res.redirect(`/${requestedPage}`);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
