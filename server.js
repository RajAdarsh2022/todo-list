const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

//Connecting to the database and creating the table schema
mongoose.connect("mongodb+srv://rajadarsh268:adarsh_2608@cluster0.t3cihiw.mongodb.net/demoDb").then(() => {
    console.log("Connected to MongoDB!")
}).catch((err) => {
    console.log(err)
})

//creating schema for homePage todo-list
const taskSchema = new mongoose.Schema({task : String});
const task = new mongoose.model("task", taskSchema);

//Creating another schema to store other kinds of task
const otherTaskSchema = new mongoose.Schema({
  categoryName : String,
  taskList : [taskSchema]
});

const otherTask = new mongoose.model("otherTask" , otherTaskSchema);


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

//DEFAULT ITEMS TO DISPLAY
const t1 = new task({task : "Welcome to to-do list App!"});
const t2 = new task({task : "Hit the + button to add task"});
const t3 = new task({task : "<-- to delete task"});

//HOME ROUTE
app.get("/", async (req, res) =>{

  try {
    // Query the database to get all todo entries
    const todoEntries = await task.find();
    //IF database is already empty , add the welcome commands and then redirext to the home route
    if(todoEntries.length == 0){
      const adderbasic = async() => {
        try{
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

//OTHER TASKS ROUTE
app.get("/:customRoute", async(req, res) => {

  try {
    const customRouteName = _.capitalize(req.params.customRoute);
    const customRouteData = await otherTask.findOne({categoryName : customRouteName});

    if(!customRouteData){
      //if not present then show the intro list
      const adderOthertask = async() => {
        try{
          const data = await otherTask.create({
            categoryName: customRouteName,
            taskList : [t1, t2, t3]
          });
          console.log(data);
        }catch(err){
          console.log(err.message);
        }

      }
      adderOthertask();
      res.redirect("/" + customRouteName);       
    }else{
      //display the current list
      console.log(customRouteData);
      res.render("list.ejs" , {listTitle: customRouteData.categoryName, newListItems: customRouteData.taskList});
    }

  }catch (err) {
    console.log(err.message);
  }
});

//ROUTE FOR ADDING ITEMS 
app.post("/", async(req, res) =>{
  /*First getting the content from the post request, adding it to the database and redirecting it 
  it to the home route*/
  try{
    const taskToAdd = req.body.newItem;
    const locationofAdd = req.body.list;

    const nextTask = new task({task: taskToAdd});
    if(locationofAdd === "Today"){
      await nextTask.save();
      res.redirect("/");
    }else{
      const customRouteData = await otherTask.findOne({categoryName : locationofAdd});
      customRouteData.taskList.push(nextTask);
      await customRouteData.save();
      res.redirect("/" + locationofAdd);
    }
    

  }catch(err){
    console.log(err.message);
  }

});

//ROUTE FOR DELETING ITEMS
app.post("/delete", async(req,res) =>{
  /* getting the item's ID which needs to be deleted via EJS file, deleting 
  it from the database and finally redirecting it the the home route*/
  try {
    const deleteLocation = req.body.listTitle;
    const deleteId = req.body.checkbox;

    if(deleteLocation === "Today"){
      await task.deleteOne({_id: deleteId});
      res.redirect("/");
    }else{
      const customRouteData = await otherTask.findOneAndUpdate(
        {categoryName : deleteLocation},
        {$pull : {taskList : {_id: deleteId}}}
      );
      res.redirect("/" + deleteLocation);

    }


  }catch (err) {
    console.log(err.message);
  }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});