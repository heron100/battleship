

/*
 * 페이지 로딩이 완료되면 호출
 */
function setupGame() {
	ws = new WebSocket("ws://127.0.0.1:9999/");//서버에 연결하기 - 웹소켓 연결생성
	
	setupInput(ws);
	
	ws.addEventListener("open", function (e) {//open이벤트 발생시
		console.log("OPEN!");
		ws.send("101|");//서버에 메시지 보내기 - 방목록&방문자ID 요청
	}, false);
	
	ws.addEventListener("message", function(e) {//message이벤트 발생시(서버로부터 데이터-data 수신)
		var firstkey = e.data.split("|")[0];
		console.log("commandkey===>"+firstkey);
		switch(firstkey){
			case "101" ://대기실 방목록 편집
				console.log("101실행 : "+e.data);
				roomList(e.data.split("|")[1]);//접속한 개설방목록을 넘겨준다
				break;
			case "102" ://액션
				console.log("102실행 : "+e.data);
			    if(gameOver1 == true || gameOver2 == true) return;//게임오버이면 실행하지 않고 종료
				if(e.data.split("|")[6] == "true"){//이동여부가 true이면 이동
					move(e.data);
				}else{//그렇지 않으면 발사
				    if(new Date().getTime() - lastShoot >= 3000)
						attack(e.data);
				}
				break;
			case "103" ://방이름 중복체크로 입장여부 결정
				console.log("103실행 : "+e.data);
				var msg = e.data.split("|")[1];
				if(msg == "dupl") alert("방이름이 중복됩니다."); //방이름이 중복될때
				else entry(msg);//방만든사람이 방장이므로 즉시입장
				break;
			case "104" ://방입장시 초기화
				console.log("104실행 : "+e.data);
				//e.data - 1:명령, 2:방이름, 3:x1, 4:y1
				x1 = parseInt(e.data.split("|")[2]);
				y1 = parseInt(e.data.split("|")[3]);
				x2 = 0;
				y2 = 0;
				init();
				break;
			case "105" ://방참여시 초기화
				console.log("105실행 : "+e.data);
				//입장한방 인원수 전달
				//(1:명령, 2:방이름, 3:x1, 4:y1, 5:x2, 6:y2)
				x1 = parseInt(e.data.split("|")[2]);
				y1 = parseInt(e.data.split("|")[3]);
				x2 = parseInt(e.data.split("|")[4]);
				y2 = parseInt(e.data.split("|")[5]);
				init();
				break;
			//default :
				//down(e.data);
		}
	}, false);
	
	ws.addEventListener("close", function(e) {//close이벤트 발생시
		console.log(e);
	}, false);
}

/*
 * 서버로부터 수신받은 게임방 데이터를 화면에 보여준다
 */
function roomList(str){
	var array = str.split(",");
	var table = '';
	console.log("방목록수 : "+array.length);
	array.forEach(function(room) {
		if(room == '' || room == null) table = '';
		else table += "<tr class='record'><td>" +
				"<button onclick=javascript:join('"+room+"'); class='roombutton'>"+room+"</button>" +
						"</td></tr>";
	});

	$("#rmlistTable tr:gt(0)").remove();// 테이블의 첫행을 제외하고 모두 제거한다.
	$("#rmlistTable tr:eq(0)").after(table);// 테이블의 첫번째 행 뒤에 table 추가한다.
}

/*
 * 서버로부터 수신받은 유저 데이터를 화면에 보여준다
 */
//function userCurrent(str){
//	var list = str.split(",");
//	var userName = '';
//	list.forEach(function(user){
//		userName += "<tr><td>"+ user +"</td></tr>";
//	});
//	
//	$("#userTable tr:gt(0)").remove();// 테이블의 첫행을 제외하고 모두 제거한다.
//	$("#userTable tr:eq(0)").after(userName);// 테이블의 첫번째 행 뒤에 table 추가한다.
//}

/*
 * 방장 입장 - 화면전환 & 서버에 방장이 생성한 방이름전달 
 */
function entry(room){
	console.log(room + "방 입장!");
	document.getElementById("top").style.display = 'none';
	document.getElementById("panel").style.display = 'block';
	roomName = room;//입장한 방이름을 저장한다
	ws.send("104|"+room);//방입장을 서버에 알림
}

/*
 * 방 참가 - 화면전환 & 서버에 참가자가 입장한 방이름 전달
 */
function join(room){
	console.log(room + "방 참여!");
	document.getElementById("top").style.display = 'none';
	document.getElementById("panel").style.display = 'block';
	roomName = room;//입장한 방이름을 저장한다
	ws.send("105|"+room);//방참여를 서버에 알림
}


window.addEventListener("load", setupGame, false);//윈도우가 로드될때 setupChat메서드 호출