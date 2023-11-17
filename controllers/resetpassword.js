const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');
const nodemailer = require('nodemailer');
//const config = require('../config/config');
require('dotenv').config();

const sendResetPasswordMail=async(name,email,id)=>{
    try{
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS:true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailPassword
            }
        });
        const mailOptions = {
            from: process.env.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<a href="http://51.20.197.253:3000/password/resetpassword/${id}">Reset password</a>`,
        }

        transporter.sendMail(mailOptions, function(error,info){
            if (error){
                console.log(error)
            }
            else{
                console.log("Mail has been sent", info.response)
            }
        })
    }catch(error){
        throw new Error(error.message);
    }
}

const forgotpassword = async (req, res) => {
    try {
        const { email } =  req.body;
        const user = await User.findOne({where : { email }});
        if(user){
            const id = uuid.v4();
            await user.createForgotpassword({ id , active: true })
                .catch(err => {
                    throw new Error(err)
                })
            await sendResetPasswordMail(user.name, user.email,id)
            res.status(200).send({success:true, msg: "Please check your mail"})
        }
            //sgMail.setApiKey(process.env.SENGRID_API_KEY)
        else{
            res.status(200).send({success:true, msg: "The mail doesnt exists"})
        }
            

            
    } catch(err){
        console.error(err)
        return res.json({ message: err, sucess: false });
    }

}

const resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ active: false});
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end()

        }
    })
}

const updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid }}).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
                // console.log('userDetails', user)
                if(user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({message: 'Successfuly update the new password'})
                            })
                        });
                    });
            } else{
                return res.status(404).json({ error: 'No user Exists', success: false})
            }
            })
        })
    } catch(error){
        return res.status(403).json({ error, success: false } )
    }

}


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}