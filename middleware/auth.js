const jwt = require("jsonwebtoken");
const userRegister = require("../src/models/userRegister");


const auth = async (req, res, next) =>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);    
            console.log(verifyUser);

            const user = await userRegister.findOne({_id:verifyUser._id});
            console.log(user.firstname);
            req.user = user;
            req.token = token;
            next();
    }catch(e){
        res.status(401).send(e);
    }
}

module.exports = auth;