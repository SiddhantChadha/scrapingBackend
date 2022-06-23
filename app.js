const express = require('express');
const app = express();
const {getDataFromFlipkart, getDataFromAmazon,getDataFromCroma} = require('./scrape');

const cors = require("cors");
app.use(cors());

app.get('/flipkart/:company/:product',async (req,res)=>{
    try{
        let data = await getDataFromFlipkart(req.params.product,req.params.company);
        res.json(data);
    }catch(err){
        res.sendStatus(404);
    }
    
    
})

app.get('/amazon/:company/:product',async (req,res)=>{
    try{
        let data = await getDataFromAmazon(req.params.product,req.params.company);
        res.json(data);
    }catch(err){
        res.sendStatus(404);
    }
})

app.get('/croma/:company/:product',async (req,res)=>{
    try{
        let data = await getDataFromCroma(req.params.product,req.params.company);
        res.json(data);
    }catch(err){
        res.sendStatus(404);
    }
    
})


app.listen(process.env.PORT,function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Server started");
    }
})