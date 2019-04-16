var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
	
	fs.readFile("cp_client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.
		
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

var users = [];

var rooms = {};
var roomsnames = [];
var r1n = "null";
var r1w = 0;
var r2n = "null";
var r2w = 0;
var r3n = "null";
var r3w = 0;
var room_prototype = {
    roomname:"",
    p1:"",
    p2:"",
    w1:"",
    w2:""
};
console.log("breakpoint1");
// Do the Socket.IO magic:
var io = socketio.listen(app);

  
console.log("breakpoint2");
io.sockets.on("connection", function(socket){
    //io.sockets.emit("test");
	// This callback runs when a new Socket.IO connection is established.
    //io.sockets.emit('test',{message:"test"});
	
	//insert data into the databse
	socket.on("register_sql",function(data){
		
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "wustl_inst",
  password: "wustl_pass",
  database: "finalproject"
});


var temp_username = data["username"];
var temp_password = data["password"];
var temp = {
	username:temp_username,
	pwd:temp_password,
	win: 0,
	lose:0
	}
	users.push(temp);
	if (r1n == "null") {
		r1n = temp_username;
	}
	else if (r2n == "null") {
		r2n = temp_username;
	}
	else if (r3n == "null") {
		r3n = temp_username;
	}

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO users (username, password) VALUES ?";
  var values = [
	  [data["username"],data["password"]]
  ];
  con.query(sql, [values],function (err, result) {
    if (err) throw err;
	console.log("1 record inserted");
	io.sockets.emit("register_response", {to:data["from"], message:"successfully registered"});
  });
});
});


// insert data into the database
socket.on("login_sql",function(data){
		
	var mysql = require('mysql');


var con = mysql.createConnection({
  host: "localhost",
  user: "wustl_inst",
  password: "wustl_pass",
  database: "finalproject"
});

con.connect(function(err) {
  if (err) throw err;
  var adr = data["from"];
 var sql = 'SELECT password FROM users WHERE username = ?';
  con.query(sql, [adr], function (err, result) {
	if (err) throw err;
	console.log(data["username"]);
	console.log(adr);
	console.log(result[0].password);
	//console.log(result.password);
	io.sockets.emit("login_response", {to:data["from"], result:result[0].password});

  });
});


        var temp_username = data["username"];
        var temp_password = data["password"];
		var index = 0;
        while (index < users.length) {
			var a = users[index];
			if (a["username"]==temp_username){
				io.sockets.emit("registerback",{message:"the name already exists",to:temp_username});
				return;
			}
			index++;			
		}
		var temp = {
			username:temp_username,
			pwd:temp_password,
			win: 0,
			lose:0
			}
			users.push(temp);
            io.sockets.emit("registerback", {message:"You've registered", to:temp_username});
			if (r1n == "null") {
				r1n = temp_username;
			}
			else if (r2n == "null") {
				r2n = temp_username;
			}
			else if (r3n == "null") {
				r3n = temp_username;
			}


	});

//update the users info in the database
	socket.on("change_sql",function(data){
		
		var mysql = require('mysql');
		
		var con = mysql.createConnection({
		  host: "localhost",
		  user: "wustl_inst",
		  password: "wustl_pass",
		  database: "finalproject"
		});
		
		con.connect(function(err) {
			if (err) throw err;
			var name = data["from"];
			var adr = data["newpwd"];
			var sql = "UPDATE users SET password = ? WHERE username = ?";
			con.query(sql, [adr, name], function (err, result) {
			  if (err) throw err;
			  console.log(result.affectedRows + " record(s) updated");
			  io.sockets.emit("change_response", {to:data["from"], message: "success"});
			});
		  });
		});
		




	socket.on("viewranks", function(data) {
		var m = "1st: " + r1n + " wins " + r1w + "\n" + "2nd: " + r2n + " wins " + r2w + "\n" + "3RD: " + r3n + " wins " + r3w;
		io.sockets.emit("viewranks_response", {message: m, to: data["from"]});
	});
	
    socket.on("register", function(data){
        var temp_username = data["username"];
        var temp_password = data["password"];
		var index = 0;
        while (index < users.length) {
			var a = users[index];
			if (a["username"]==temp_username){
				io.sockets.emit("registerback",{message:"the name already exists",to:temp_username});
				return;
			}
			index++;			
		}
		var temp = {
			username:temp_username,
			pwd:temp_password,
			win: 0,
			lose:0
			}
			users.push(temp);
            io.sockets.emit("registerback", {message:"You've registered", to:temp_username});
			if (r1n == "null") {
				r1n = temp_username;
			}
			else if (r2n == "null") {
				r2n = temp_username;
			}
			else if (r3n == "null") {
				r3n = temp_username;
			}
    });
	
	
	socket.on("logIn", function(data){
		var u = data["username"];
		var p = data["password"];
		var index = 0;
		while (index < users.length) {
			var i = users[index];
			if (i["username"] == u) {
				if (i["pwd"] == p) {
					io.sockets.emit("login_response", {message:"You've logged in", to: u});
					return;
				}
				else {
					io.sockets.emit("login_response", {message: "Incorrect password", to: u});
				}
			}
			i++;
		}
		io.sockets.emit("login_response", {message: "no user of this name exists", to:u});
	});

//check who win who lose and when to end the game
	socket.on('action_request', function(data) {
        var room = data["room"];
        var user = data["from"];
        var action = data["action"];
        if (rooms[room]["p1"] == user) {
			rooms[room]["a1"] = action;
            if (rooms[room]["a2"] == "") {
                rooms[room]["a1"] = action;
                return;
            }
            else {
                var action2 = rooms[room]["a2"];
                if (action2 == action) {
					io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"] + ",   Tied!"});
                    rooms[room]["a2"] = "";
					rooms[room]["a1"] = "";
                }
                else if ((action == "r" && action2 == "p")||(action=="p"&&action2=="s")||(action=="s"&&action2=="r")){
                    io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"] + ",  "+ rooms[room]["p2"] + " Win! "});
                    rooms[room]["w2"]++;
                    rooms[room]["a2"] = "";
					rooms[room]["a1"] = "";
                }
                else {
                    io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"]+ ",   "+ rooms[room]["p1"] + " Win! "});

                    rooms[room]["w1"]++;
                    rooms[room]["a2"] = "";
					rooms[room]["a1"] = "";
                }
            }
        }
        else {
			rooms[room]["a2"] = action;
            if (rooms[room]["a1"] == "") {
                rooms[room]["a2"] = action;
                return;
            }
            else {
                // 判断谁嬴谁输
                var action2 = rooms[room]["a1"];
                if (action2 == action) {
                    io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"]+ ",   Tied!"});

                    rooms[room]["a1"] = "";
					rooms[room]["a2"] = "";
                }
                else if ((action == "r" && action2 == "p")||(action=="p"&&action2=="s")||(action=="s"&&action2=="r")){
                    io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"] + ",  "+ rooms[room]["p1"] + " Win! "});

                    rooms[room]["w1"]++;
                    rooms[room]["a1"] = "";
					rooms[room]["a2"] = "";
                }
                else {
                    io.sockets.emit("action_response", {room:room,message: rooms[room]["p1"] + " played " + rooms[room]["a1"] + ", " + rooms[room]["p2"] + " played " + rooms[room]["a2"] + ",  "+ rooms[room]["p2"] + " Win! "});

                    rooms[room]["w2"]++;
                    rooms[room]["a1"] = "";
					rooms[room]["a2"] = "";
                }
            }
        }
        //sleep(5000); //当前方法暂停5秒
        if (rooms[room]["w1"] == 2 || rooms[room]["w2"] == 2) {
            // 结算结果，delete房间，etc
			if (rooms[room]["w1"] == 2) {
				io.sockets.emit("end_game", {to: rooms[room]["p1"], message: "You won!"});
				io.sockets.emit("end_game", {to: rooms[room]["p2"], message: "You lost!"});
				var index = 0;
				console.log(users);
				console.log("yes1?");

				while (index < users.length) {
					var temp = users[index];
					if (temp["username"] == rooms[room]["p1"]) {
						console.log("winner name:"+temp["username"]);
						console.log("p1 name   "+rooms[room]["p1"]);
						console.log("p2 name   "+rooms[room]["p2"]);

						temp["win"] = temp["win"] + 1;
						if (rooms[room]["p1"] == r1n) {r1w++;}
						else if (rooms[room]["p1"] == r2n && temp["win"] > r1w) {
							r2n = r1n;
							r1n = rooms[room]["p1"];
							r2w = r1w;
							r1w = temp["win"];
						}
						else if (rooms[room]["p1"] == r2n) r2w++;
						else if (rooms[room]["p1"] == r3n && temp["win"] > r2w) {
							r3n = r2n;
							r2n = rooms[room]["p1"];
							r3w = r2w;
							r2w = temp["win"];
						}
						else if (rooms[room]["p1"] == r3n) r3w++;
						else if (temp["win"] > r3w) { 
							r3n = rooms[room]["p1"];
							r3w = temp["win"];
						}
						console.log("yes2?");

					}
					index++;
				}
				console.log("yes?");
				var i=0;
				while(i<users.length){
					console.log("Can you see this message?");
					var temp = users[i];
					if(temp["username"]==rooms[room]["p2"]){
						console.log("loser name:"+temp["username"]);
						console.log("p2 name"+rooms[room]["p2"]);
						temp["lose"] = temp["lose"]+1;
					}
					i++;

				}

			
			}
			else {
				io.sockets.emit("end_game", {to: rooms[room]["p2"], message: "You won!"});
				io.sockets.emit("end_game", {to: rooms[room]["p1"], message: "You lost!"});
				var index = 0;
				console.log(users);
				console.log("no1");
				while (index < users.length) {
					var temp = users[index];
					if (temp["username"] == rooms[room]["p2"]) {
						console.log("winner name:"+temp["username"]);
						console.log("p2 name"+rooms[room]["p2"]);
						temp["win"] = temp["win"] + 1;
						if (rooms[room]["p2"] == r1n) {r1w++;}
						else if (rooms[room]["p2"] == r2n && temp["win"] > r1w) {
							r2n = r1n;
							r1n = rooms[room]["p2"];
							r2w = r1w;
							r1w = temp["win"];
						}
						else if (rooms[room]["p2"] == r2n) r2w++;
						else if (rooms[room]["p2"] == r3n && temp["win"] > r2w) {
							r3n = r2n;
							r2n = rooms[room]["p2"];
							r3w = r2w;
							r2w = temp["win"];
						}
						else if (rooms[room]["p2"] == r3n) r3w++;
						else if (temp["win"] > r3w) { 
							r3n = rooms[room]["p2"];
							r3w = temp["win"];
						}
						console.log("no2");
					}
					
					index++;
				}

				var i=0;
				console.log("no3");

				while(i<users.length){
					var temp = users[i];
					if(temp["username"]==rooms[room]["p1"]){
						console.log("loser name:"+temp["username"]);
						console.log("p1 name"+rooms[room]["p1"]);
						temp["lose"] = temp["lose"]+1;
					}
					i++;

				}
				// TODO: 更新胜场输场
				
			}
        }
        else {
            io.sockets.emit("require_action", {room:room});
        }
    });
    
console.log("breakpoint3");
//search the winning rate of a specific person
socket.on("search_server", function(data) {

	var intheroom = false;
	var username = data["username"]; 
	var index=0;
	var wintimes;
	var losetimes;
	while(index<users.length){
		var temp = users[index];
		if(username == temp["username"]){
		wintimes = temp["win"];
		losetimes = temp["lose"];
		intheroom = true;
		}		
		index++;

	}
	var rate = wintimes/(wintimes+losetimes);
	if(intheroom==true){
		io.sockets.emit("search_response", {to: data["from"], message : username + ": "+ wintimes+" wins; "+ losetimes + " losses; "+ " The winning rate is "+rate});	
	}else{
		io.sockets.emit("search_response", {to: data["from"], message : username + " is not in the list"});
		console.log(users);
		}


});


//send message
	socket.on("message_request", function(data) {
		var room = data["room"];
		var from = data["from"];
		var m = from + ": " + data["message"];
		io.sockets.emit("message_response", {room:room, message:m});
	});
	socket.on("invite_server", function(data){
    var sender = data["sender"];
		var receiver = data["receiver"];
		var room = data["room"];
		var pwd = rooms[data["room"]]["pwd"];
        var i = 0;
			while (i < rooms[data["room"]].length){
                a = rooms[data["room"]]["p1"];
                b = rooms[data["room"]]["p2"];
			if(receiver == a || receiver == b){
				
				io.sockets.emit('invite_response', {receiver: receiver, message:"the person is in another room", sender: sender});
			return;
			}
			i++;
			}
			io.sockets.emit("invite_response",{receiver:receiver,message:" invites you to play! ", room:room, sender : sender, pwd:pwd});
		
});

//join the room
socket.on("join_request", function(data){
		var roomname = data["roomname"];
		var pwd = data["pwd"];
		for (sroom in rooms) {
			if (sroom == roomname && rooms[sroom]["pwd"] == pwd) {
				if(data["from"]==rooms[sroom]["p1"]){
				rooms[sroom]["p1"] = data["from"];
				io.sockets.emit("join_response", {message:"success",to:data["from"], new_room:roomname});		
				}
				else if (data["from"]!=rooms[sroom]["p1"]&&rooms[sroom]["p2"] == "") {
				var u = data["from"];
				console.log(u);			
				io.sockets.emit("join_response", {message:"success",to:data["from"], new_room:roomname});
                rooms[sroom]["p2"] = data["from"];
				console.log("p2 is " + rooms[sroom]["p2"]);
				io.sockets.emit("require_action", {room: roomname});
				return;
				}
				else {
					io.sockets.emit("join_response", {message:"this game already started", to:data["from"]});
				}
			}
			else if (sroom == roomname) {
				io.sockets.emit("join_response", {message:"wrong password",to:data["from"]});
				return;
			}
		}
		io.sockets.emit("join_response", {message:"no room of this name exists",to:data["from"]});
		
    });
    


//creating a room
socket.on("create_request", function(data){
		var creator = data["from"];
		var roomname = data["roomname"];
		var pwd = data["pwd"];
		var index = 0;
		while (index < roomsnames.length) {
			var temp = roomsnames[index];
			if (temp == roomname) {
				io.sockets.emit("create_response", {message: "a room of this name already exists", to: creator});
				console.log("repeated room name");
				return;
			}
			index++;
		}
		var temp = {
			name: roomname,
			p1: creator,
            pwd: pwd,
            p2 : "",
			a1:"",
			a2:"",
			w1:0,
			w2:0
		}
		rooms[roomname] = temp;
		roomsnames.push(roomname);
		console.log("created!");
		io.sockets.emit("create_response", {message: "room created", to: creator, room: roomname});
		
	});
});
console.log("breakpoint4");