require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
console.log(auth);

//connection code inside
require("./db/conn");
//Require the schema from the userRegister file.
const userRegister = require("./models/userRegister");
const async = require("hbs/lib/async");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

// console.log(process.env.SECRET_KEY);

// For receiving data to the form.HTML.
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);


app.get("/" , (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) =>{
    res.render("register");
});

app.get("/login", (req, res) =>{
    res.render("login");
});

app.get("/logout", auth, async (req, res) =>{
    try{
        console.log(req.user);
        //for single logout
        // req.user.tokens = req.user.tokens.filter((currElement) =>{
        //     return currElement.token != req.token
        // })

        //logout from all device
        req.user.tokens = [];

        res.clearCookie("jwt");

        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    }catch(e){
        res.status(500).send(e);
    }
});

app.get("/secret", auth ,(req, res) =>{
    // console.log(`this is the cookie of login ${req.cookies.jwt}`);
    res.render("secret");
});



//Create a new user in our database.
app.post("/register",async (req, res) =>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){
            
            const registerEmployee = new userRegister({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password:password,
                confirmpassword:cpassword 
            })

            console.log("the success part" + registerEmployee);

            const token =await registerEmployee.generateAuthToken();
            console.log("the token part of register  " +token);

            //The res.cookie() function is used to set the cookie name to value.
            //The value parameter may be a string or object converted to JSON
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly:true
            });

            const registered = await registerEmployee.save(); 
            console.log("save registration" +registered);
            res.status(201).render("index");
        }else{
            res.send("Password are not match");
        }

    }catch(e){
        res.status(400).send(e);
    }
});



//Login authentication for user entering.
app.post("/login", async(req, res) =>{
    try{
        // ye user ka input hai
        const email = req.body.email;
        const password = req.body.password;

        // console.log(`${email} and password is ${password}`);
        const useremail = await userRegister.findOne({email:email});

        //Check user password and in database stored password matching. If match then return promise true.
        const isMatch = await bcrypt.compare(password,useremail.password);
        
        const token = await useremail.generateAuthToken();
        console.log("the token part of login  " +token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly:true,
            // secure:true
        });

      

    //    if(useremail.password === password){  
       if(isMatch){
        res.status(201).render("index");
       }else{
        res.send("invalid password");
       }

    }catch(e){
        res.status(400).send("invalid login Details");
    }
})




//this is only logic to understand not this page

// const bcrypt = require("bcryptjs");
// const securePassword = async (password)=>{
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash);

//     const passwordMatch = await bcrypt.compare(password,passwordHash);
//     console.log(passwordMatch);
// }

// securePassword("omshiv123@");


//implimenting jwt
// const createToken = async() =>{
//     const token = await jwt.sign({_id:"63d40635164e5a4d0ee4f71d"}, "mynameisomshivpatelvermashivay",{
//         expiresIn:"2 seconds"
//     });
//     console.log(token);

//     const userVer = await jwt.verify(token,"mynameisomshivpatelvermashivay");
//     console.log(userVer);
// }

// createToken();


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
});