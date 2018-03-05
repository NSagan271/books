/*global $
global io
global gapi*/
let socket;
let signedin = false;
let token;
let currentrsn;
let books = [];
let booksShown = 0;
let p;

function start(page){
   p = page;
   startSocket(page);
}

function startSocket(page){
    socket = io();
    if (page === 0)randomBook();
}

function randomBook(){
    socket.emit("random book", function(data){
        for (let i = 0; i < books.length; i++){
            if (books[i] === data.rsn) return randomBook();
        }
        $("#title").html(data.sortTitle);
        $("#author").html(data.author_printable);
        $(".bookimg").attr('src', "https://slhs.goalexandria.com/7068693"+data.image);
        currentrsn = data.rsn;
        if (data.hasCopies){
            $('#not').html("");
            //$('.book').css({'border-left':'15px solid rgba(50,150,50,1)', 'border-right':'15px solid rgba(50,150,50,1)'});
            //$('.status').css('background-color','rgba(50,150,50,1)');
        }
        else {
            $('#not').html("NOT");
            //$('.book').css({'border-left':'15px solid rgba(150,50,50,1)', 'border-right':'15px solid rgba(150,50,50,1)'});
            //$('.status').css('background-color','rgba(150,50,50,1)');
        }
        $('.book').css({'visibility': 'visible'});
        let y = parseFloat($(".text").width(),10);
        let x = $(window).width() - parseFloat($(".img").width(),10)-100;
        if (x > 500 && x<y) $('.text').css('width', x);
        else $('.text').css('width', 'auto');
    });
}

function storeBook(){
    socket.emit("store book", token, currentrsn, function(){
        console.log("hi");
        randomBook();
    });
}

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present
    token = googleUser.getAuthResponse().id_token;
    socket.emit("signin", token,function(){
        $('.container').css('display','block');
        $('.container2').css('display','none');
        $('.signin').css('display','none');
        $('.signout').css('display','block');
        signedin = true;
        loadBooks();
    });
}
function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        $('.container2').css('display','block');
        $('.container').css('display','none');
        $('.signin').css('display','block');
        $('.signout').css('display','none');
        signedin = false;
        token = null;
        if(p == 1){
            $('.storedBook').remove();
            books = [];
            booksShown=0;
            $('#number').html(booksShown);
            $("#total").html(books.length);
            $('.showmore').css('visibility','hidden');

        }
    });
}
function deleteBook(elem){
    let id = ($(elem).attr('id'));
    console.log(id);
    let index = parseInt(id.substring(6, id.length),10);
    console.log(index);
    console.log(books[index]);
    socket.emit("delete", token, books[index], function(success){
        if(success){
            $('#book'+index).remove();
            books.splice(index,1);
            for (let i = index+1; i < books.length+1; i++){
                $('#book'+i).attr('id','book'+(i-1));
                $('#delete'+i).attr('id','delete'+(i-1));
            }
            booksShown--;
            $('#number').html(booksShown);
            $("#total").html(books.length);
        }
    });
}
function showBooks(max){
    socket.emit("get book from rsn", books[booksShown], function(data){
        if (data){
            console.log(data.image);
            $('.books').append("<div class='storedBook' id='book"+booksShown+"' ><p class='x' id='delete"+
            booksShown+"' onclick='deleteBook(this);'>&times;</p><img src = 'https://slhs.goalexandria.com/7068693"+
            data.image+"' class='bookimg' id='pict"+booksShown+"' onclick='openModal(this)'/><figcaption>"+data.sortTitle+" by "+data.author_printable+"<br>"+((!data.hasCopies)?"NOT":"")+
            " AVAILABLE</figcaption></div>");
            booksShown++;
        }
        if (booksShown < max){
            showBooks(max);
        }
        else{
            $('.books').css('visibility', 'visible');
            $('.show').css('visibility', 'visible');
            $('#number').html(booksShown);
            $("#total").html(books.length);
            if (booksShown == books.length)$('.showmore').css('visibility','hidden');
            else $('.showmore').css('visibility','visible');
        }
    });
}
function showMoreBooks(){
    showBooks((booksShown+10 < books.length)?(booksShown+10):(books.length));
}
function loadBooks(){
    if (signedin){
        socket.emit("get stored books", token, function(data){
            books=data;
            if (p == 1)showBooks((booksShown+10 < books.length)?(booksShown+10):(books.length));
        });
    }
    
}
function closemodal(){
    $("#summary").html("");
    $(".modal").css("visibility","hidden");
}
function openModal(elem){
    $("#summary").html("Loading...");
    $(".modal").css("visibility","visible");
    let rsn1;
    if(p===0){
        rsn1 = currentrsn;
    }
    else{
        let id = $(elem).attr("id");
        let index = id.substring(4,id.length);
        rsn1 = books[index];
    }
    socket.emit("more info", rsn1, function(data){
        $("#summary").html(data);
        if (data === "")$("#summary").html("No summary available!");
    });
}