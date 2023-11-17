const Expense = require('../models/expense');
const User = require('../models/users');
const sequelize = require('../util/database');
//const Sequelize = require('sequelize');
//const { Op, literal } = require('sequelize');
const { Op, Sequelize } = require('sequelize');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
const AWS = require('aws-sdk');
require('dotenv').config();

const addExpense = async (req,res)=>{
    const t = await sequelize.transaction();
    try{
        

        const amount = req.body.expenseAmount;
        const description = req.body.description;
        const category = req.body.category;
        
        
    if ((!amount)|| (!description)||(!category)){
        return res.status(400).json({err:"Something is missing"})
        }

            const expense = await Expense.create({amount,description,category,userId: req.user.id}, {transaction:t })
            const totalExpense = Number(req.user.totalExpenses)+Number(amount)
            
            await User.update({
                totalExpenses: totalExpense
            },{
                where: {id: req.user.id},
                 transaction:t 
            })
            await t.commit();
            res.status(201).json({expense,success:true})
            
            
            
        }catch(err){
            await t.rollback();
            return res.status(500).json({success: false, error: err})
        }
    }
    




    const getExpense = async (req, res) => {
      try {
        //const ITEMS_PER_PAGE = 10;
         // Replace with your desired number of items per page
        const page = parseInt(req.query.page,10)// || 1; // Get the requested page number from the query parameters
        const ITEMS_PER_PAGE=parseInt(req.query.itemsPerPage,10)
        //const num = parseInt(str, 10);
        //console.log(typeof page,typeof ITEMS_PER_PAGE,"&*")
        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        const { count, rows: expenses } = await Expense.findAndCountAll({
          where: { userId: req.user.id },
          limit: ITEMS_PER_PAGE,
          offset,
        });
        
        const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        
        if (expenses.length > 0) {
          console.log(expenses,"<----expenses")
          return res.status(200).json({ expenses, totalPages, currentPage: page, success: true });
        } else {
          return res.status(200).json({ expenses: [], totalPages, currentPage: page, success: true });
        }
      } catch (error) {
        res.status(500).json({ error: error.message, success: false });
      }
    };
// const getExpense = async(req,res)=>{
//     try{
//         const expenses = await Expense.findAll({where : {userId: req.user.id}})
        
        
//         if (expenses) {
//             return res.status(200).json({expenses, success: true})
//             }
        
    
//     }
//     catch(error){  
//         res.status(500).json({error: error, success: false})
//     }
    
// }

const deleteExpense = async(req,res)=>{
    const t = await sequelize.transaction();
    try{
        if (req.params.expenseid=='undefined'){
            return res.status(400).json({err:'ID is missing'})
        }
        const uId = req.params.expenseid;

        const expense = await Expense.findByPk(uId, {transaction:t });
        
        amount = expense.amount
        id = expense.userId
        const user = await User.findByPk(id, {transaction:t });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

        user.totalExpenses -= amount;//err
        await user.save({transaction:t });

        
    
        
        
        // Save the updated user's record
        
        await expense.destroy({transaction:t });
        await t.commit();
        res.json({ message: 'Expense deleted and user totalExpenses updated' });
    }
    catch(err){
        await t.rollback();
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
}

function uploadToS3(data,filename){
    const BUCKET_NAME  = 'expensetrackingapp18';//process.env.BUCKET_NAME;//
    const IAM_USER_KEY='AKIA3RDAL5WYJPSACWVY';// process.env.IAM_USER_KEY;//'AKIA3RDAL5WYNO4QKMGL';
    const IAM_USER_SECRET='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';// process.env.IAM_USER_SECRET;//'cELRdpargfIQeKOZmBG9VbzGbNcyi4/ru6oxBfeM';
    const AWS_REGION = 'us-east-1';
    
    AWS.config.update({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        region: AWS_REGION
    });

    let s3bucket   = new AWS.S3()

    
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve,reject)=>{
        s3bucket.upload(params,(err,s3response)=>{
            if (err){
                console.log('Something went wrong', err)
                reject(err);
            }else{
                console.log('s3response',s3response);
                resolve(s3response.Location);
            }
         })
    })  
    
    

}

const downloadExpenses =  async (req, res) => {
    const expenses  = await req.user.getExpenses()
    console.log("ggggggggggggg")
    //console.log(expenses,"&*&&&*") //array
    const stringifiedExpenses = JSON.stringify(expenses) //string

    const userId  =req.user.id;
    const filename  = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses,filename)
    console.log(fileURL,"()fileURL&")
    res.status(200).json({fileURL, success: true})

    
    
}

const getMonthlyExpenses  =  async (req, res) => {
    try{
        
        const userId = req.user.id;
        
        let month = parseInt(req.params.month);
        let year = parseInt(req.params.year);
        let startDate = new Date(year, month - 1, 1);
        let lastDay = new Date(year, month, 0); 
        let endDate = new Date(year, month - 1, lastDay.getDate()); 
        const listOfExpenses = await Expense.findAll({
            where: {
              userId: userId,
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
            
          });
          const totalAmountSum = await Expense.findAll({
            where: {
              userId: userId,
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
            attributes: [
              [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmountSum'],
            ],
            raw: true,
          });
        
         const amountSum =totalAmountSum[0]['totalAmountSum']
         
         if (amountSum>0){
            return res.status(200).json({
                listOfExpenses: listOfExpenses,
                totalExpenses: amountSum,
              });
         }else{
            return res.status(200).json({
                listOfExpenses: [],
                totalExpenses: 0,
              });
              
         }
         
          
        } catch (error) {
          console.error('Error fetching monthly expenses:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

    }



   const getYearlyExpenses=async(req,res)=>{
        try{const userId = req.user.id;
        
            
            let year = parseInt(req.params.year);// check from below
            
            const listOfExpenses = await Expense.findAll({
                where: {
                  userId: userId,
                  createdAt: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31 23:59:59`],
                  },
                },
                
              });
            const totalAmountSum = await Expense.findAll({
                where: {
                  userId: userId,
                  createdAt: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31 23:59:59`],
                  },
                },
                attributes: [
                  [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmountSum'],
                ],
                raw: true,
              });
            
             const amountSum =totalAmountSum[0]['totalAmountSum']
             
             if (amountSum>0){
                return res.status(200).json({
                    listOfExpenses: listOfExpenses,
                    totalExpenses: amountSum,
                  });
             }else{
                return res.status(200).json({
                    listOfExpenses: [],
                    totalExpenses: 0,
                  });
                  
             }
             
              
            } catch (error) {
              console.error('Error fetching monthly expenses:', error);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
   }
module.exports = {
    addExpense,
    getExpense,
    deleteExpense,
    downloadExpenses,
    getMonthlyExpenses,
    getYearlyExpenses
}
