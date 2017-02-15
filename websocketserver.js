
var server = require("http").createServer(),//HTTP서버를 생성
	ws = new (require("websocket").server)({//웹소켓 서버를 생성 - ws.mount()메서드를 사용하지 않고 WebSocketServer생성자에 서버설정 객체를 전달
		httpServer : server,
		autoAcceptConnections : true //프로토콜과 무관하게 연결수락
	}), clients = [];//클라이언트 목록
	
	idx = 0;//클라이언트 목록 인덱스(0베이스 아님)
	room_list = [];//방목록
	where_list = new Map();//위치목록(key : 닉네임, value : 방이름)
	//클라이언트에 따른 위치좌표 초기값
	firstX1 = 450;
	firstY1 = 550;
	firstX2 = 30;
	firstY2 = 100;
	//방장목록
	master = [];
	//플레이어 이동가능 여부
	moveOk = [];

/*
 * 모든 클라이언트에게 메시지 전송
 */
function broadcast(data) {
	clients.forEach(function(client) {
		client.sendUTF(data);
	});
}	

/*
 * 같은방 클라이언트에게 메시지 전송
 */
function selectcast(data) {
	var loc = data.split("|")[3];//방이름
	var player = data.split("|")[4];//클릭한 유저명
	var flag = false;
	//클릭한 유저가 방장인지 여부체크
	master.forEach(function(user){
		if(user == player) flag = true; 
	});
	
	where_list.forEach(function(wh, name){//방이름을 가진 유저에게만 보낸다
		//(1:명령, 2:x좌표, 3:y좌표, 4:방이름, 5:클릭한 유저명, 6:방장여부, 7:이동여부)
		if(wh == loc) clients[name-1].sendUTF(data+"|"+flag+"|"+moveOk[player-1]);
	});
}

/*
 * 대기중인 클라이언트에게 방목록 전송
 */
function waitcast(data) {
	where_list.forEach(function(wh, name){//방이름을 가진 유저에게만 보낸다
		if(wh == "WAIT") clients[name-1].sendUTF(data);
	});
}


/*
 * connect이벤트 발생시에 클라이언트와 통신하는데 필요한 연결객체가 전달된다
 */
function connectHandler(conn) {
	//conn.nickname = conn.remoteAddress;//클라이언트IP를 별명으로 사용한다
	conn.on("message", messageHandler);
    conn.on("close", closeHandler);
	idx = clients.push(conn);//클라이언트 목록에 연결을 추가한다
	conn.nickname = idx;
	moveOk.push(true);//이동가능으로 초기화
	where_list.set(conn.nickname, "WAIT");
}

/*
 * 연결이 끊긴 클라이언트 제거하기
 */
function closeHandler() {
	var index = clients.indexOf(this);
	if (index > -1) {
		clients.splice(index, 1);
	}
}

/*
 * 클라이언트가 웹소켓 서버에 데이터를 전송하면
 * 클라이언트 연결객체에 message이벤트 발생
 */
function messageHandler(message) {
	var data = message.utf8Data.toString(),//utf8Data속성을 통해 문자열메시지에 접근
		firstWord = data.split("|")[0];
		switch (firstWord) {
			case "101" ://연결 OPEN
				waitcast("101|"+roomList());//대기자들에게 방목록을 전달한다
				break;
			case "102" ://이동하기
				//(1:명령, 2:x좌표, 3:y좌표, 4:방이름, 5:클릭한 유저명)
				selectcast(data+"|"+this.nickname);//방이름과 클릭한 유저명을 전달해서 그 참가자에게만 전송
				break;
			case "103" ://방목록 추가 - 방이름이 중복되지 않으면 방장입장
				var roomName = data.split("|")[1];
				var ch = checkRoomNm(roomName);//방이름 중복여부체크
				if(ch != true){//방목록이 중복되지 않을 시
					room_list.push(roomName);//방목록 추가
					var roomlist = roomList();
					waitcast("101|"+roomlist);//대기자는 방목록을 갱신하도록 전달
					clients[this.nickname-1].sendUTF("103|"+roomName);//방장은 입장하도록 전달
				}else{
					//클릭한 유저에게만 보낸다(방이름 중복메시지)
					clients[this.nickname-1].sendUTF("103|dupl");
				}
				break;
			case "104" ://방장 입장 - 초기값 전달
				var rmName = data.split("|")[1];//입장한 방이름
				where_list.set(this.nickname, rmName);//대기상태에서 입장한 방이름으로 위치정보 변경
				master.push(this.nickname);//방장 명부에 추가
				//방에 참여한 사람에게만 보내는 메시지(1:명령, 2:방이름, 3:x1, 4:y1) 
				clients[this.nickname-1].sendUTF(data +"|"+ firstX1 +"|"+ firstY1);//방장의 위치 초기값
				break;
			case "105" ://참여자 방입장 - 게임시작(초기값전달&방목록삭제) 
				var rmName = data.split("|")[1];//입장한 방이름
				where_list.set(this.nickname, rmName);//대기상태에서 입장한 방이름으로 위치정보 변경
				where_list.forEach(function(wh, name){//방이름을 가진 유저에게만 보낸다
					if(wh == rmName){
						//요청한 좌표와 객체(1:명령, 2:방이름, 3:x1, 4:y1, 5:x2, 6:y2)
						clients[name-1].sendUTF(data + "|"+ firstX1 +"|"+ firstY1+ "|"+ firstX2 +"|"+ firstY2);
					}
				});
				//방목록에서 삭제 => 게임시작
				var idn = room_list.indexOf(rmName);
				if(idn != -1) room_list.splice(idn, 1);//(1:start, 2:deleteCnt)
				waitcast("101|"+roomList());//대기자들에게 방목록을 갱신하도록 보내준다
				break;
			case "106" : //이동하기 버튼클릭
				moveOk[this.nickname-1] = true;
				break;
			case "107" : //미사일 발사하기 버튼클릭
				moveOk[this.nickname-1] = false;
				break;
			case "108" ://방나가기
				where_list.set(this.nickname, "WAIT");//입장한 방이름을 대기상태로 설정
				var idx = master.indexOf(this.nickname);//방장 명부에서 제거
				if(idx != -1) master.splice(idx, 1);//(1:start, 2:deleteCnt)
				waitcast("101|"+roomList());//접속한 방목록과 유저목록을 전달한다
				break;
			case "/nick" : //이름을 정한다
				var newname = data.split(" ")[1];
				if (newname != "") {
					//broadcast(this.nickname + " changed name to " + newname);
					this.nickname = newname;
				}
				break;
			case "/shutdown" : //서버와 연결을 닫는다
				//broadcast("Server shutting down. Bye!");
				ws.shutDown();//열려진 연결을 모두 닫는다
				server.close();
				break;
			//default :
				//broadcast(data);
				//this.sendUTF("Unknown command: " + firstWord);
		}
}

/*
 * 동일한 방이름 체크
 */
function checkRoomNm(rm){
	var count = 0;
	where_list.forEach(function(wh, name){
		if(wh == rm) count++;
	});
	if(count > 0) return true;
	else return false;
}

/*
 * 개설방 목록
 */
function roomList(){
	var rmlist="";
	for(var i=0; i<room_list.length; i++){
		if(rmlist != "") rmlist += ","+room_list[i];
		else rmlist = room_list[i];
	}
	return rmlist;
}

//새로운 클라이언트가 서버에 연결되면 WebSocketServer객체에서 connect이벤트가 발생한다
ws.on("connect", connectHandler);

server.listen(9999);//연결수락