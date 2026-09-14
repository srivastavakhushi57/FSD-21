import fs from 'fs';
const fileName="student.txt";
async function createFile(){
    try {
        await fs.promises.writeFile(fileName, "name:Khushi\n Email:srivastavakhushi615@gmail.com");
        console.log("File created successfully.");
    } catch (error) {
        console.error("Error creating file:", error);
    }
}
async function readFile(){
    try{
        await fs.readSync();
    }
    catch(err){
        console.error("Error reading file:", err);
    }
}