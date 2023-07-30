const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

//Connecting to the database and creating the table schema
mongoose.connect("mongodb://127.0.0.1:27017/demoDb").then(() => {
    console.log("Connected to MongoDB!")
}).catch((err) => {
    console.log(err)
})
const taskSchema = new mongoose.Schema({task : String});
const task = new mongoose.model("task", taskSchema);

// //Create opertion
// const adder = async() => {
//   try{
//     const t1 = new task({task : "Welcome to to-do list App!"});
//     const t2 = new task({task : "Hit the + button to add task"});
//     const t3 = new task({task : "<-- to delete task"});
  
//     const data = await task.insertMany([t1, t2, t3]);
//     console.log(data);
//   }catch(err){
//     console.log(err.message);
//   }

// }

// adder();


//Reading function
// const reader = async() => {

//   try{
//     const result = await task.find();
//     console.log(result);
//   }catch(err){
//     console.log(err.message)
//   }
// }
// reader();

//HOME ROUTE
app.get("/", async (req, res) =>{

  try {
    // Query the database to get all todo entries
    const todoEntries = await task.find();
    //IF database is already empty , add the welcome commands and then redirext to the home route
    if(todoEntries.length == 0){
      const adderbasic = async() => {
        try{
          const t1 = new task({task : "Welcome to to-do list App!"});
          const t2 = new task({task : "Hit the + button to add task"});
          const t3 = new task({task : "<-- to delete task"});
        
          const data = await task.insertMany([t1, t2, t3]);
          console.log(data);
        }catch(err){
          console.log(err.message);
        }

      }
      adderbasic();
      res.redirect("/");      
    }
    else{
      // Send the retrieved todo entries as a response
      res.render("list.ejs" , {listTitle: "Today", newListItems: todoEntries});
    }

  } catch (err) {
    // Handle any errors that might occur during the database query
    console.error('Error fetching todo entries:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

//ROUTE FOR ADDING ITEMS
app.post("/", async(req, res) =>{
  /*First getting the content from the post request, adding it to the database and redirecting it 
  it to the home route*/
  try{
    const taskToAdd = req.body.newItem;
    const nextTask = new task({task: taskToAdd});
    await nextTask.save();
    res.redirect("/");
  }catch(err){
    console.log(err.message);
  }

});

//ROUTE FOR DELETING ITEMS
app.post("/delete", async(req,res) =>{
  /* getting the item's ID which needs to be deleted via EJS file, deleting 
  it from the database and finally redirecting it the the home route*/
  try {
    const deleteId = req.body.checkbox;
    await task.deleteOne({_id: deleteId});
    res.redirect("/");

  }catch (err) {
    console.log(err.message);
  }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});