const fs=require("fs");

//CREATE-Create a file

fs.writeFileSync("student.txt", "Name: Khushi\nRoll No: 634");

console.log("File Created Successfully");

//READ-Read a file
let data=fs.readFileSync("student.txt","utf-8");

console.log("\nFile Content:");
console.log(data);

//UPDATE-Add new data to the file
fs.appendFile("student.txt", "\nCourse:B.Tech CSE");
console.log("File Updated Successfully");