const express=require("express")
const app=express()
const mysql=require("mysql")
const BodyParser=require("body-parser")
const path=require("path")
const Bcrypt=require("bcrypt")
const session=require("express-session")
const ejs=require("ejs")
require("dotenv").config()
const {DateTime}=require("luxon")


const connection=mysql.createConnection(process.env.MYSQL_CON_STRING)


app.set("view engine","ejs")

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

app.use(express.static("resources"))
app.use(BodyParser.urlencoded({ extended:true }))

const Authenticationmiddleware = (req,res,next)=>{
    if(req.session.hasOwnProperty("user_id")){
        next()
    }
    else{
        res.redirect("/login.html")
    }
}


connection.connect((error)=>{
    if (error) {
        throw error;
    }
    else console.log("Server connected to MySQL Successfully")
})


app.get("/try",(req,res)=>{
    res.send("Hello World")
})

app.get("/",(req,res)=>{
    connection.query(`INSERT INTO Users(name,password,age,major) VALUES('${req.query.name}','${req.query.password}','${req.query.age}','${req.query.major}')`,(error,result)=>{
        if(error){
            throw error
            res.sendStatus(404)
        }
        else{
            res.send(`${req.query.name} has been added to the database`)
        }
    })
})

app.post("/signup",(req,res)=>{
    Bcrypt.hash(req.body.password, 10, (error,hashed_password)=>{
        if(error){
            throw error;
            res.sendStatus(404)
        }
        else{
            connection.query(`INSERT INTO Users(name,password,age,major) VALUES('${req.body.fullname}','${hashed_password}','${req.body.age}','${req.body.major}')`,(error,result)=>{
                if(error){
                    throw error
                    res.sendStatus(404)
                }
                else{
                    res.send(`${req.body.fullname}'s Sign Up has been successful`)
                }
            })
        }
    })
    
})


app.post("/login",(req,res)=>{
    const username= req.body.fullname
    const simple_password=req.body.password
    connection.query(`SELECT id, name, password, age, Major FROM Users WHERE name='${username}'`,(error,result)=>{
        if(error){
            throw error;
            res.sendStatus(500)
        }
        else{
            const hashed_password=result[0].password
            Bcrypt.compare(simple_password,hashed_password,(error,comparison_result)=>{
                if(error){
                    throw error;
                    res.sendStatus(404);
                }
                else{
                    if(result){
                        req.session.user_id=result[0].id
                        req.session.user_name=result[0].name
                        res.render("feed.ejs",{
                            name : req.session.user_name
                        })
                    }
                    else{
                        res.sendStatus(401)
                    }
                }
                
            })
        }
    })
})


app.get("/myprofile",Authenticationmiddleware,(req,res)=>{
    res.render("myprofile.ejs",{
        name : req.session.user_name
    })
})


app.get("/myfeed",Authenticationmiddleware,(req,res)=>{
    res.render("feed.ejs",{
        name : req.session.user_name
    })
})


app.post("/post/new",Authenticationmiddleware,(req,res)=>{
    if(req.body.hasOwnProperty("content") && req.body.content != ""){
        connection.query("INSERT INTO Posts(content,user_id) VALUES(?,?)",[req.body.content,req.session.user_id],(error,result)=>{
            if (error) throw error
            else res.sendStatus(201)
        })
    }
    
    else{
        res.sendStatus(400)
    } 
    
     
})


app.get("/post/all",Authenticationmiddleware,(req,res)=>{
    connection.query("SELECT Posts.id,Posts.content, Posts.date_posted, Users.name FROM Posts INNER JOIN Users ON Posts.user_id=Users.id",(error,result)=>{
        if (error) res.sendStatus(500)
        else{
            const final = result.map(post=>{
                post.date_posted=DateTime.fromJSDate(post.date_posted).toFormat('yyyy LLL dd')
                return post
            })
            res.json(final)
        } 
        
    })
})


app.get('/logout',Authenticationmiddleware,(req,res)=>{
    req.session.destroy()
    res.redirect("/login.html")
})

app.listen(3000, ()=>{
    console.log("Server is listening at port 3000")
})