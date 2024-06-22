/**
 * Dev: fr97gp1@gmail.com
 * 
 * Set of functions that will connect the client actions from an html
 * file with Blog API.
 * 
 * Client <=> Blog API <=> Postgre
 * 
 * Route of the file:
 * /public/scripts/staic_handler.js
 */

var domain = "/";

/**
 * Convert a Object into a correct url, to trigger an
 * API route.
 * 
 * @param {String} endPoint Route of the endpoint
 * @param {Object} filter Object, query parameters for the query.
 */
function edit_params(endPoint, filter){

    let params = "";
    let goTo = "";

    for(var key in filter){
        item = filter[key]
        if (item != "")  params += `${key}=${item}&`
    }
    params = params.slice(0,-1);
    goTo = endPoint + "?" +params;

    return {
        "url": goTo,
        "filter": filter
    };
}

function file_handler(){
    var data = {}

    data = document.getElementById("resources").files[0]

    return data
}

/**
 * Function that help to pass the data from formularies
 * to the Blog API, making an ajax call at the end using 
 * the input text.
 */
async function post_create_handler(){
    var container  = [], 
        data_container = {},
        file = form = settings = {},
        route = "";

    // Static declaration
    container = ["user_name", "user_last_n", "post_title", "post_text"]
    container.forEach(label => {
        data_container[label] = document.getElementById(label).value;
    });
    
    // Construct the url for the request
    route = edit_params("/post", data_container)

    settings = {
        "url": route.url,
        "method": "POST",
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        // "contentType": false
        "type": "json"

    };

    file = file_handler()
    if( file ){
        form = new FormData();
        form.append("cover_img", file, file.name);
        settings["data"] = form;
    }

    console.log('settings: ');
    console.log(settings);

    // await $...
    await $.ajax(settings).done(function (response) {
        console.log(response);
    });
    
    console.log("trying to reload into: ", window.location.href)
    window.location.replace(window.location.href);
    
}

/**
 * Weark render.
 * 
 * Will contruct html syntax to display the comments.
 * 
 * @param {Array} data Array of comments
 */
function crate_comments_render(data){

    var render = "", short_comm = ""

    for(let i = 0; i < data.length; i++){

        if (data[i].comm_created)
            short_comm = `
                <br>
                <p class="card-text" style="align-self: flex-end;">
                <small class="text-muted">
                    Creation date: ${data[i].comm_created.slice(0,10)}
                </small>
                </p>`

        render += `
            <div class="card card-body">
                <img src="/icons/comm.png" style="width: 25px;">
                ${data[i].comm_text}
                ${short_comm}
            </div>`
    }

    return render

}

/**
 * Weak render.
 * Show a little content for the client.
 */
async function start(){
    var content, render, row, blog_set,
        doc, card;

    // {data: []}
    content = await $.ajax({
        method: "GET",
        url: "/post/"
    })

    console.log(content)

    blog_set = document.getElementById("set_of_blogs");

    for(var i = 0; i < content.data.length; i++){
        row = content.data[i]

        render = `
            <div class="col-sm-6">
                <div class="card" style="margin: 0 25px 20px 0;">
                    <img src="${row.post_cover_img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-tittle">${row.post_title}</h5>
                        <div id="post_author">
                            <a> 
                                <p>
                                    Author: ${row.post_creator_name} 
                                    ${row.post_creator_l_name}
                                </p> 
                            </a>
                        </div>
                        <p class="card-text">${row.post_text}</p>
                            <a class="btn btn-link" href="/post/${row.post_title}/view">
                                <img src="/icons/look.png" style="width: 50px;">
                            </a>
                            
                            <button type="button" 
                                class="btn btn-light" onclick="delete_handler('/post/${row.post_title}')">
                                <img src="/icons/erase.png" style="width: 50px;">
                            </button>
                    </div>

                    
            </div>
            `

        doc = new DOMParser().parseFromString(render, 'text/html');
        card = doc.body.firstChild;
        blog_set.appendChild( card );
    }
    
}

async function start_unique(){

    var title = window.location.pathname.slice(6, -5),
        render_comms = "", content;
    
    content = await $.ajax({
        method: "GET",
        url: "/post/"+title
    })

    row = content.data;
    console.log(row)
    
    if( row.comments )
        render_comms = crate_comments_render(row.comments) // array

    blog_set = document.getElementById("set_of_blogs");

    render = `
        <div class="card mb-3">
            <img src="${row.post_cover_img}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${row.post_title}</h5>
                <p class="card-text">
                    <small class="text-muted">
                        Aut: ${row.post_creator_name} 
                        ${row.post_creator_l_name}
                    </small>
                </p>
                <p class="card-text">${row.post_text}</p>
            </div>

            ${render_comms}
            
        </div>`

    doc = new DOMParser().parseFromString(render, 'text/html');
    card = doc.body.firstChild;
    blog_set.appendChild( card );
}

async function send_commentary(){
    var container = [], params,
        data_container = {};

    data_container["post_title"] = window.location.pathname.slice(6, -5);

    // Static declaration
    container = ["user_name", "comm_text"]

    container.forEach(label => {
        data_container[label] = document.getElementById(label).value;
    });

    route = edit_params("/commentary", data_container)

    params = {
        method: "POST",
        url: route.url
    }

    await $.ajax(params).done( res =>{
        console.log(res);
    });

    window.location.replace(window.location.href);
}

async function delete_handler(title){

    params = {
        method: "DELETE",
        url: title
    }

    console.log(params)

    await $.ajax(params).done( res =>{
        console.log(res);
    });

    window.location.replace(window.location.href);
}
