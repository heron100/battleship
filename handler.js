/*
 * keydown이벤트에 연결되는 핸들러 함수 
 */
function setupInput(ws) {
	/*
	 * 방만들기
	 */
	var roomNm = document.getElementById("room");//방이름 텍스트
	var roomBtn = document.getElementById("makeRoom");//방만들기 버튼
	roomBtn.addEventListener("click", function(e) {//키 이벤트 발생시
			//입력체크
			if(roomNm.value == '' || roomNm.value == null){
				alert(' 방이름을 입력해주세요(공백제외). ');
		    	return false;
			}
			//공백체크
			var blank_pattern = /[\s]/g;
			if( blank_pattern.test(roomNm.value) == true){
			    alert(' 공백은 사용할 수 없습니다. ');
			    return false;
			}
			ws.send("103|"+roomNm.value);//서버에 방생성을 알림
			roomNm.value='';
	});
	
	/*
	 * 방 나가기
	 */
	outBtn = document.getElementById("outRoom");//나가기 버튼
	outBtn.style.display = 'none';
	outBtn.addEventListener("click", function(e) {
		console.log("나가기 버튼클릭!!!");
		document.getElementById("top").style.display = 'block';
		document.getElementById("panel").style.display = 'none';
		console.log(roomName+"방 나가기");
		ws.send("108|"+roomName);
	});
	
	/*
	 * 이동하기 버튼
	 */
	var moveBtn = document.getElementById("move");//나가기 버튼
	moveBtn.addEventListener("click", function(e) {
		console.log("이동하기 버튼클릭!!!");
		if($(this).attr('src') == "img/movebtn.png"){
			moveBtn.src = "img/movebtn_p.png";
			bulletBtn.src = "img/bulletbtn.png"; 
		}
		ws.send("106|");
	});
	
	/*
	 * 미사일 버튼
	 */
	var bulletBtn = document.getElementById("bullet");//나가기 버튼
	bulletBtn.addEventListener("click", function(e) {
		console.log("미사일 버튼클릭!!!");
		if($(this).attr('src') == "img/bulletbtn.png"){
			bulletBtn.src = "img/bulletbtn_p.png";
			moveBtn.src = "img/movebtn.png";
		}
		ws.send("107|");
	});
	
	/*
	 * 게임화면 - 게임액션
	 */
	var input = document.getElementById("panel");//게임화면
	input.style.display = 'none';
	input.addEventListener("click", function(e) {//키 이벤트 발생시
		var clX = e.clientX;
		var clY = e.clientY;
		if(clX < 170 && clY > 625) return;//버튼 영역은 배제
		var str = "102|"+clX+"|"+clY+"|"+roomName;
		console.log("화면클릭! "+str);
		ws.send(str);//서버에 메시지 보내기
	});
}

/*
 * 미사일 그리기
 */
function bulletDraw(){
    //공격하지 않았으면 발사위치만 셋팅하고 종료
    if(shootX1 == 0 || shootY1 == 0 ){
    	xBul1 = x1+15;
    	yBul1 = y1+15;
    }else{//공격했으면
	    xBul1 += shootX1;
	    yBul1 += shootY1;
	    //플레이어1 미사일 그리기
	    ctx.drawImage(bullet1, xBul1, yBul1, 10, 10);
	    var result = checkCollision();//충돌판정

	    //목적지에 오거나 충돌판정시 정지시킨다
	    if((Math.abs(attX1 - xBul1) < 5 && Math.abs(attY1 - yBul1) < 5) || result == true){
	    	shootX1 = 0;
	    	shootY1 = 0;
	    	xBul1 = x1+15;
	    	yBul1 = y1+15;
	    }
    }
    //공격하지 않았으면 발사위치만 셋팅하고 종료
    if(shootX2 == 0 || shootY2 == 0 ){
    	xBul2 = x2+15;
    	yBul2 = y2+15;
    }else{
	    xBul2 += shootX2;
	    yBul2 += shootY2;
	    //플레이어2 미사일 그리기
	    ctx.drawImage(bullet2, xBul2, yBul2, 10, 10);
	    var result = checkCollision();//충돌판정
	    //목적지에 오거나 충돌판정시 정지시킨다
	    if((Math.abs(attX2 - xBul2) < 5 && Math.abs(attY2 - yBul2) < 5) || result == true){
	    	shootX2 = 0;
	    	shootY2 = 0;
	    	xBul2 = x2+15;
	    	yBul2 = y2+15;
	    }
    }
}

/*
 * 이동시 방향, 속도계산 - (1:명령, 2:x좌표, 3:y좌표, 4:방이름, 5:클릭한 유저명, 6:방장여부, 7:이동여부)
 */
function move(str){
	var flag = str.split("|")[5];//방장여부
	if(flag == "true"){
		console.log("방장 클릭!");
		clickX1 = str.split("|")[1]-10;//클릭한 x좌표
		clickY1 = str.split("|")[2]-10;//클릭한 y좌표
		
		//클릭한 위치로 이동방향계산
		var theta1 = Math.atan2(clickY1 - y1, clickX1 - x1);
		velX1 = 0.5 * Math.cos(theta1);
		velY1 = 0.5 * Math.sin(theta1);
	}else{
		console.log("참가자 클릭!");
		clickX2 = str.split("|")[1]-10;//클릭한 x좌표
		clickY2 = str.split("|")[2]-10;//클릭한 y좌표
		
		//클릭한 위치로 이동방향계산
		var theta2 = Math.atan2(clickY2 - y2, clickX2 - x2);
		velX2 = 0.5 * Math.cos(theta2);
		velY2 = 0.5 * Math.sin(theta2);
	}
	checkCollision();//충돌판정
}

/*
 * 공격시 미사일 방향, 속도계산 - (1:명령, 2:x좌표, 3:y좌표, 4:방이름, 5:클릭한 유저명, 6:방장여부, 7:이동여부)
 */
function attack(str){
	lastShoot = new Date().getTime();//마지막 발사시각 기록
	var flag = str.split("|")[5];//방장여부
	if(flag == "true"){
		console.log("방장 공격!");
		attX1 = str.split("|")[1]-10;//공격지점 x좌표
		attY1 = str.split("|")[2]-10;//공격지점 y좌표
		
		//클릭한 위치로 이동방향계산
		var theta1 = Math.atan2(attY1 - yBul1, attX1 - xBul1);
		shootX1 = 3 * Math.cos(theta1);
		shootY1 = 3 * Math.sin(theta1);
	}else{
		console.log("참가자 공격!");
		attX2 = str.split("|")[1]-10;//클릭한 x좌표
		attY2 = str.split("|")[2]-10;//클릭한 y좌표
		
		//클릭한 위치로 이동방향계산
		var theta2 = Math.atan2(attY2 - yBul2, attX2 - xBul2);
		shootX2 = 3 * Math.cos(theta2);
		shootY2 = 3 * Math.sin(theta2);
	}
}

/*
 * 충돌 판정
 */
function checkCollision(){
	//함선의 오른쪽이 미사일의 왼쪽보다 크고, 함선의 왼쪽이 미사일의 오른쪽보다 작고,
	//함선의 위가 미사일의 바닥보다 작고, 함선의 바닥이 미사일의 위보다 클경우
	if(x1+35 > xBul2 && x1 < xBul2+5 
			&& y1 < yBul2+5 && y1+35 > yBul2) {
		console.log("방장 충돌");
		if(damageCnt1 == 0) gage1.src = "img/gageTwo.png";
		else if(damageCnt1 == 1) gage1.src = "img/gageOne.png";
		else{
			player1.src = "img/explosion.png";
			gameOver1 = true;
		}
		damageCnt1++;
		gage1.width = 30;//이미지 사이즈 지정
		gage1.height = 5;
		return true;
	}
	
	if(x2+35 > xBul1 && x2 < xBul1+5 
			&& y2 < yBul1+5 && y2+35 > yBul1){
		console.log("참가자 충돌");
		if(damageCnt2 == 0) gage2.src = "img/gageTwo.png";
		else if(damageCnt2 == 1) gage2.src = "img/gageOne.png";
		else{
			player2.src = "img/explosion.png";
			gameOver2 = true;
		}
		damageCnt2++;
		gage2.width = 30;//이미지 사이즈 지정
		gage2.height = 5;
		return true;
	}
	
	return false;
}

