$(document).ready(function(){
    $("#post-form").submit((e)=>{
        e.preventDefault()
        const my_content = $("#postcontent").val()
        $.post("/post/new",{content: my_content},function(data){
            if(data=="Created") alert("Post Created Successfully")
            else alert("Error occured")
        })
    })
})

const Form = (props) => {
    const SetReload=props.reloadFunction
    const [content,Setcontent] = React.useState("")
    

    const post = (e) => {
        e.preventDefault()
        $.post("/post/new",{content: content},function(data){
            if(data=="Created") {
                alert("Post Created Successfully")
                SetReload(cur=>!cur)}
            else alert("Error occured")
        }
        )
    }
    
    return (<section class="mt-6 w-3/4 m-auto bg-white p-8 rounded">
    <h2 class="text-2xl text-black bold  mb-2">Create New Post</h2>
    
    <form action="/post/new" method="POST" id="post-form" class="flex flex-row" onSubmit={post}>
        <textarea name="content" id="postcontent" placeholder="What's on your mind" class="border 2 p-2 w-full" value={content} onChange={(e)=>{Setcontent(e.target.value)}}></textarea>
        <button type="submit" class="bg-blue-600 hover:bg-blue-800 text-white curson-pointer float-right px-4 py-2"><i class="fa-solid fa-paper-plane px-2"></i>Post Now</button>
    </form>

    </section>)
}


const Posts = () => {
    const [posts,SetPosts] = React.useState([])
    const [Reload, SetReload] = React.useState(false)

    React.useEffect(()=>{
        fetch("/post/all")
        .then((data)=>{
            data.json()
            .then(final_data=>{
                SetPosts(final_data)
            })
        })

        .catch((err)=>{
            console.log(err)
        })
    },[Reload])
    
    
    return (<div> 
    <Form reloadFunction={SetReload}/>
    {posts.map((post,index)=> (<div className="mt-6 w-8/12 m-auto bg-white p-8 rounded flex gap-x-5" key={index}>
    <i className="fa-solid fa-circle-user text-8xl"></i>
    <div className="w-full">
        <div className="flex flex-row justify-between items-center">
            <h3 className="text-3xl bold px-2 py-8">{post.name}</h3>
            <span className="text-gray-500 float-right">{post.date_posted}</span>
        </div>
    

        <p>{post.content}</p>
    </div>

    </div>))}

    </div>)
}


const root=ReactDOM.createRoot(document.getElementById("app"))
root.render(<Posts></Posts>)
