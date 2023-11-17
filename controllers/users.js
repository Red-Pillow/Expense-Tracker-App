const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateAccessToken(id, name, ispremiumuser,isloggedin){
    return jwt.sign({userId:id, name: name, ispremiumuser,isloggedin}, 'secretkey')
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
}


const signup = async (req,res)=>{
    try{
        console.log("we are in sign up")
        const {name,email,password} = req.body;
        if ((!name)|| (!email)||(!password)){
            
            return res.status(400).json({err:"Something is missing"})
            
            
        }
    saltrounds = 10
    bcrypt.hash(password,saltrounds, async(err,hash)=>{
        await User.create({name,email,password: hash}).then(()=>{
            res.status(201).json({message:'successfully created new user'})
        })
    })
    
   } catch(err){
        res.status(500).json(err);
    }
}


const login = async (req,res)=>{
    try{
        
        
        if ((!req.body.email)||(!req.body.password)){
            
            return res.status(400).json({err:"Something is missing"})
        }
        const entered_email = req.body.email;
        const entered_password = req.body.password;
        
        
        const user = await User.findOne({ where: { email: entered_email } });
      
        
      if (user) {
        bcrypt.compare(entered_password,user.password,(err,result)=>{
            if (err){
                throw new Error('Something went wrong')
            }
            if (result===true){
                console.log(user.dataValues.id, "user.dataValues")
                return res.status(200).json({message:'User login sucessful', token: generateAccessToken(user.dataValues.id,user.dataValues.name,user.dataValues.ispremiumuser,true)});  
            }
            else{
                console.log(result)
                return res.status(401).json({message:'User not authorized. Incorrect password'});
            }
            
        })
        
      } else {
        //console.log('User not found')
        return res.status(404).json({message: 'User not found'}); // If user doesn't exist, return a message
      
      }

    
   } catch(err){
    
        res.status(500).json({message:'Server error'});
    }
}

const logout = async (req,res)=>{
    try{
        const token = req.headers.authorization;
        decoded = parseJwt (token)
        
        const isloggedin  = decoded.isloggedin
        const ispremiumuser = decoded.ispremiumuser
        const id = decoded.id
        const name = decoded.name

        
        return res.status(200).json({message:'User loggedout successfully',token : generateAccessToken(id,name,ispremiumuser,false)})
        //return res.status(200).json({message:'User loggedout sucessfully', token: generateAccessToken(user.dataValues.id,user.dataValues.name,user.dataValues.ispremiumuser,false)});  
    }catch(err){
        res.status(500).json({message:'Server error'});
    }
    
}
module.exports = {
    signup,
    login,
    logout,
    generateAccessToken
}