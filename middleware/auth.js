const jwt = require('jsonwebtoken');
const User = require('../models/users');

const authenticate = (req,res,next)=>{
    try{
        console.log("auth^&^^$")
        const token = req.header('Authorization');
        const user = jwt.verify(token,'secretkey');
        console.log(user.userId,"%^&* req.user")
        User.findByPk(user.userId).then(user=>{
            req.user = user;
            next();
        })
    }
    catch(err){
        return res.status(401).json({success:false});
    }
}

module.exports = {
    authenticate
}