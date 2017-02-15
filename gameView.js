/*
 * �ʱ�ȭ�� ����
 */
var can = document.getElementById('canvas');
can.height = 750; can.width = 600;
var ctx = can.getContext('2d');

	var x1 = 0, y1 = 0, x2 = 0, y2 = 0;//������ġ
	var velX1 = 0, velY1 = 0, velX2 = 0, velY2 = 0;//�̵�����
	var clickX1 = 0, clickY1 = 0, clickX2 = 0, clickY2 = 0;//�̵�����ġ

	var xBul1 = 0, yBul1 = 0, xBul2 = 0, yBul2 = 0;//������ġ
	var shootX1 = 0, shootY1 = 0, shootX2 = 0, shootY2 = 0;//�߻簢��
	var attX1 = 0, attY1 = 0, attX2 = 0, attY2 = 0;//�߻��� ��ġ
	
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
	
	//������ �߻��� �ð�
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
		
		gage1 = new Image();//�ʱ�ȭ�� �ʿ�		
		gage2 = new Image();//�ʱ�ȭ�� �ʿ�
		outBtn.style.display = 'none';
	}
	
	/*
	 * ȭ���� �׸���
	 */
	function draw() {
	    requestAnimationFrame(draw);
		ctx.clearRect(0, 0, can.width, can.height);//��� �����
		
		//�׸��� ����
	    ctx.beginPath();
	    //��� �׸���
	    ctx.fillStyle = "rgba(0,0,255,0.7)";
	    ctx.fillRect(0, 0, can.width, can.height);//���簢���� ���� ĥ�Ѵ�

	    //�̵��ӵ�, ���� ����
	    x1 += velX1;
	    y1 += velY1;
	    x2 += velX2;
	    y2 += velY2;
	    
	    //�������� ���� ������Ų��
	    if(Math.abs(clickX1 - x1) < 5 && Math.abs(clickY1 - y1) < 5){
	    	velX1 = 0;
	    	velY1 = 0;
	    }
	    //�������� ���� ������Ų��
	    if(Math.abs(clickX2 - x2) < 5 && Math.abs(clickY2 - y2) < 5){
	    	velX2 = 0;
	    	velY2 = 0;
	    }
	    
	    //�÷��̾�1 �׸���
	    if(gameOver1 == true){//���߾��� �׸���
	    	if(explo > 0) 
	    	ctx.drawImage(player1, x1, y1, explo, explo);
	    	explo--;
	    }else{
	    	ctx.drawImage(player1, x1, y1, 30, 30);//�踦 �׸���(img, x, y, w, h)
	    	ctx.drawImage(gage1, x1, y1+35, gage1.width, gage1.height);//������ ���¸� �׸���
	    }

	    //�÷��̾�2 �׸���
	    if(x2 != 0 && y2 != 0){
	    	if(gameOver2 == true){//���߾��� �׸���
	    	 	if(explo > 0)
	    		ctx.drawImage(player2, x2, y2, explo, explo);
	    	 	explo--;
	    	}else{
	    		ctx.drawImage(player2, x2, y2, 30, 30);//�踦 �׸���(img, x, y, w, h)
	    		ctx.drawImage(gage2, x2, y2-10, gage2.width, gage2.height);//������ ���¸� �׸���
	    	}
	    }
	    //�Լ����� �浹
		if(x1+25 > x2 && x1 < x2+25 && y1 < y2+25 && y1+25 > y2){
	    	velX1 = 0; velY1 = 0;
	    	velX2 = 0; velY2 = 0;
		}
	    //�̻��� �׸���
	    if(gameOver1 == false && gameOver2 == false)
	    	bulletDraw();
	    else
	    	outBtn.style.display = 'block';// ������ ��ư ����
	}
draw();