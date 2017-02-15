/*
 * 초기화면 정의
 */
var can = document.getElementById('canvas');
can.height = 750; can.width = 600;
var ctx = can.getContext('2d');

	var x1 = 0, y1 = 0, x2 = 0, y2 = 0;//현재위치
	var velX1 = 0, velY1 = 0, velX2 = 0, velY2 = 0;//이동각도
	var clickX1 = 0, clickY1 = 0, clickX2 = 0, clickY2 = 0;//이동할위치

	var xBul1 = 0, yBul1 = 0, xBul2 = 0, yBul2 = 0;//현재위치
	var shootX1 = 0, shootY1 = 0, shootX2 = 0, shootY2 = 0;//발사각도
	var attX1 = 0, attY1 = 0, attX2 = 0, attY2 = 0;//발사한 위치
	
	player1 = new Image();
	player1.src = 'img/warship.png';
	player2 = new Image();
	player2.src = 'img/warship2.png';
	gage1 = new Image();
	gage2 = new Image();
	bullet1= new Image();
	bullet1.src = "img/bullet.png";
	bullet2 = new Image();
	bullet2.src = "img/bullet.png";
	gameOver1 = false;
	gameOver2 = false;
	
	//직전에 발사한 시각
	lastShoot = new Date().getTime();
	damageCnt1 = 0;
	damageCnt2 = 0;

	function init(){
		player1.src = 'img/warship.png';
		player2.src = 'img/warship2.png';
		
		gameOver1 = false;
		gameOver2 = false;
		explo = 50;
		damageCnt1 = 0;
		damageCnt2 = 0;
		
		gage1 = new Image();//초기화가 필요		
		gage2 = new Image();//초기화가 필요
		outBtn.style.display = 'none';
	}
	
	/*
	 * 화면을 그린다
	 */
	function draw() {
	    requestAnimationFrame(draw);
		ctx.clearRect(0, 0, can.width, can.height);//모두 지운다
		
		//그리기 시작
	    ctx.beginPath();
	    //배경 그리기
	    ctx.fillStyle = "rgba(0,0,255,0.7)";
	    ctx.fillRect(0, 0, can.width, can.height);//배경사각형에 색을 칠한다

	    //이동속도, 방향 지정
	    x1 += velX1;
	    y1 += velY1;
	    x2 += velX2;
	    y2 += velY2;
	    
	    //목적지에 오면 정지시킨다
	    if(Math.abs(clickX1 - x1) < 5 && Math.abs(clickY1 - y1) < 5){
	    	velX1 = 0;
	    	velY1 = 0;
	    }
	    //목적지에 오면 정지시킨다
	    if(Math.abs(clickX2 - x2) < 5 && Math.abs(clickY2 - y2) < 5){
	    	velX2 = 0;
	    	velY2 = 0;
	    }
	    
	    //플레이어1 그리기
	    if(gameOver1 == true){//폭발씬을 그린다
	    	if(explo > 0) 
	    	ctx.drawImage(player1, x1, y1, explo, explo);
	    	explo--;
	    }else{
	    	ctx.drawImage(player1, x1, y1, 30, 30);//배를 그린다(img, x, y, w, h)
	    	ctx.drawImage(gage1, x1, y1+35, gage1.width, gage1.height);//게이지 상태를 그린다
	    }

	    //플레이어2 그리기
	    if(x2 != 0 && y2 != 0){
	    	if(gameOver2 == true){//폭발씬을 그린다
	    	 	if(explo > 0)
	    		ctx.drawImage(player2, x2, y2, explo, explo);
	    	 	explo--;
	    	}else{
	    		ctx.drawImage(player2, x2, y2, 30, 30);//배를 그린다(img, x, y, w, h)
	    		ctx.drawImage(gage2, x2, y2-10, gage2.width, gage2.height);//게이지 상태를 그린다
	    	}
	    }
	    //함선끼리 충돌
		if(x1+25 > x2 && x1 < x2+25 && y1 < y2+25 && y1+25 > y2){
	    	velX1 = 0; velY1 = 0;
	    	velX2 = 0; velY2 = 0;
		}
	    //미사일 그리기
	    if(gameOver1 == false && gameOver2 == false)
	    	bulletDraw();
	    else
	    	outBtn.style.display = 'block';// 나가기 버튼 출현
	}
draw();