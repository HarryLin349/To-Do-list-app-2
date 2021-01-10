//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-harry:test123@cluster0.nwwvp.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "Hit the checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    // const day = date.getDate();
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("default success!");
        }
      });
      res.redirect("/");
    } else
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req, res) {
  const checkedID = req.body.checkbox;
  const listName = req.body.listInfo;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedID, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted " + checkedID + " succesfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedID}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    });
  }


});


app.get("/:customList", function(req, res) {
  const customListName = lodash.capitalize(req.params.customList);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (foundList) {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    } else {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }

  })

});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if ((port == null) || (port = "")){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
