//synchronous and asynchronous programming
//synchronous
// console.log("this is await")
// async
// console.log("1");
// await console.log("2");
// console.log("3");
// console.log("4");

//understanding the concept of fetch in console 
async function test (){
   console.log("this is asynchronous functionh and we want to fetc")
   const response=await fetch("./student.json");
   console.log(response.status);
   const student=await response.json();
   return student;
   console.log("finally data fetched");
}
test().then((res)=>{
    console.log(res);
}).catch((err)=>{
    console.log(err);
})

const EventEmitter=require("events");
const every=new EventEmitter();
event.NONE("greet",()=>{
    console.log("this is event emitter");
})
event.emit("greet");

setImmediate()