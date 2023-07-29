const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};
const Item= mongoose.model("Item",itemsSchema);

const item1=new Item({name:"welcome to your todolist"});
const item2=new Item({name:"Hit the + button to add a new item"});
const item3=new Item({name:"<-- hit this to delete an item"});
const defaultItems=[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
        Item.insertMany(defaultItems).then(function(){
               console.log("successfully executed ");
             })
             .catch(function(err){
               console.log("error");
             }); 
             res.redirect("/");
    }else{
    res.render(__dirname+"/views/list.ejs", {listTitle: "Today", newListItems: foundItems});
    }
  });


 

});
app.get("/:customListname",function(req,res){
    const customListname=_.capitalize(req.params.customListname);
    const foundList=List.findOne({name:customListname}).then(function(foundList){
      //if list not created so creating it
      
           if(!foundList){
            const list=new List({
              name:customListname,
              items:defaultItems
          })
          list.save(); 
          res.redirect("/"+customListname);
           }else{
            //show the list
            res.render(__dirname+"/views/list.ejs",{listTitle:foundList.name, newListItems: foundList.items});
           
      }
    });
  });


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:itemName
  })
  if(listname==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listname}).then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listname);
  })
}
});
app.post("/delete",function(req,res){
   const checkeditemid=req.body.checkbox;
   const listname=req.body.listname;
   if(listname==="Today"){
   Item.findByIdAndRemove(checkeditemid).then(function(){
    console.log("successfull deleted");
    res.redirect("/");
   })
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}}).then(function(foundList){
      res.redirect("/"+listname);
    })
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});




