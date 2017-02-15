/*
 * keydown�̺�Ʈ�� ����Ǵ� �ڵ鷯 �Լ� 
 */
function setupInput(ws) {
	/*
	 * �游���
	 */
	var roomNm = document.getElementById("room");//���̸� �ؽ�Ʈ
	var roomBtn = document.getElementById("makeRoom");//�游��� ��ư
	roomBtn.addEventListener("click", function(e) {//Ű �̺�Ʈ �߻���
			//�Է�üũ
			if(roomNm.value == '' || roomNm.value == null){
				alert(' ���̸��� �Է����ּ���(��������). ');
		    	return false;
			}
			//����üũ
			var blank_pattern = /[\s]/g;
			if( blank_pattern.test(roomNm.value) == true){
			    alert(' ������ ����� �� �����ϴ�. ');
			    return false;
			}
			ws.send("103|"+roomNm.value);//������ ������� �˸�
			roomNm.value='';
	});
	
	/*
	 * �� ������
	 */
	outBtn = document.getElementById("outRoom");//������ ��ư
	outBtn.style.display = 'none';
	outBtn.addEventListener("click", function(e) {
		console.log("������ ��ưŬ��!!!");
		document.getElementById("top").style.display = 'block';
		document.getElementById("panel").style.display = 'none';
		console.log(roomName+"�� ������");
		ws.send("108|"+roomName);
	});
	
	/*
	 * �̵��ϱ� ��ư
	 */
	var moveBtn = document.getElementById("move");//������ ��ư
	moveBtn.addEventListener("click", function(e) {
		console.log("�̵��ϱ� ��ưŬ��!!!");
		if($(this).attr('src') == "img/movebtn.png"){
			moveBtn.src = "img/movebtn_p.png";
			bulletBtn.src = "img/bulletbtn.png"; 
		}
		ws.send("106|");
	});
	
	/*
	 * �̻��� ��ư
	 */
	var bulletBtn = document.getElementById("bullet");//������ ��ư
	bulletBtn.addEventListener("click", function(e) {
		console.log("�̻��� ��ưŬ��!!!");
		if($(this).attr('src') == "img/bulletbtn.png"){
			bulletBtn.src = "img/bulletbtn_p.png";
			moveBtn.src = "img/movebtn.png";
		}
		ws.send("107|");
	});
	
	/*
	 * ����ȭ�� - ���Ӿ׼�
	 */
	var input = document.getElementById("panel");//����ȭ��
	input.style.display = 'none';
	input.addEventListener("click", function(e) {//Ű �̺�Ʈ �߻���
		var clX = e.clientX;
		var clY = e.clientY;
		if(clX < 170 && clY > 625) return;//��ư ������ ����
		var str = "102|"+clX+"|"+clY+"|"+roomName;
		console.log("ȭ��Ŭ��! "+str);
		ws.send(str);//������ �޽��� ������
	});
}

/*
 * �̻��� �׸���
 */
function bulletDraw(){
    //�������� �ʾ����� �߻���ġ�� �����ϰ� ����
    if(shootX1 == 0 || shootY1 == 0 ){
    	xBul1 = x1+15;
    	yBul1 = y1+15;
    }else{//����������
	    xBul1 += shootX1;
	    yBul1 += shootY1;
	    //�÷��̾�1 �̻��� �׸���
	    ctx.drawImage(bullet1, xBul1, yBul1, 10, 10);
	    var result = checkCollision();//�浹����

	    //�������� ���ų� �浹������ ������Ų��
	    if((Math.abs(attX1 - xBul1) < 5 && Math.abs(attY1 - yBul1) < 5) || result == true){
	    	shootX1 = 0;
	    	shootY1 = 0;
	    	xBul1 = x1+15;
	    	yBul1 = y1+15;
	    }
    }
    //�������� �ʾ����� �߻���ġ�� �����ϰ� ����
    if(shootX2 == 0 || shootY2 == 0 ){
    	xBul2 = x2+15;
    	yBul2 = y2+15;
    }else{
	    xBul2 += shootX2;
	    yBul2 += shootY2;
	    //�÷��̾�2 �̻��� �׸���
	    ctx.drawImage(bullet2, xBul2, yBul2, 10, 10);
	    var result = checkCollision();//�浹����
	    //�������� ���ų� �浹������ ������Ų��
	    if((Math.abs(attX2 - xBul2) < 5 && Math.abs(attY2 - yBul2) < 5) || result == true){
	    	shootX2 = 0;
	    	shootY2 = 0;
	    	xBul2 = x2+15;
	    	yBul2 = y2+15;
	    }
    }
}

/*
 * �̵��� ����, �ӵ���� - (1:���, 2:x��ǥ, 3:y��ǥ, 4:���̸�, 5:Ŭ���� ������, 6:���忩��, 7:�̵�����)
 */
function move(str){
	var flag = str.split("|")[5];//���忩��
	if(flag == "true"){
		console.log("���� Ŭ��!");
		clickX1 = str.split("|")[1]-10;//Ŭ���� x��ǥ
		clickY1 = str.split("|")[2]-10;//Ŭ���� y��ǥ
		
		//Ŭ���� ��ġ�� �̵�������
		var theta1 = Math.atan2(clickY1 - y1, clickX1 - x1);
		velX1 = 0.5 * Math.cos(theta1);
		velY1 = 0.5 * Math.sin(theta1);
	}else{
		console.log("������ Ŭ��!");
		clickX2 = str.split("|")[1]-10;//Ŭ���� x��ǥ
		clickY2 = str.split("|")[2]-10;//Ŭ���� y��ǥ
		
		//Ŭ���� ��ġ�� �̵�������
		var theta2 = Math.atan2(clickY2 - y2, clickX2 - x2);
		velX2 = 0.5 * Math.cos(theta2);
		velY2 = 0.5 * Math.sin(theta2);
	}
	checkCollision();//�浹����
}

/*
 * ���ݽ� �̻��� ����, �ӵ���� - (1:���, 2:x��ǥ, 3:y��ǥ, 4:���̸�, 5:Ŭ���� ������, 6:���忩��, 7:�̵�����)
 */
function attack(str){
	lastShoot = new Date().getTime();//������ �߻�ð� ���
	var flag = str.split("|")[5];//���忩��
	if(flag == "true"){
		console.log("���� ����!");
		attX1 = str.split("|")[1]-10;//�������� x��ǥ
		attY1 = str.split("|")[2]-10;//�������� y��ǥ
		
		//Ŭ���� ��ġ�� �̵�������
		var theta1 = Math.atan2(attY1 - yBul1, attX1 - xBul1);
		shootX1 = 3 * Math.cos(theta1);
		shootY1 = 3 * Math.sin(theta1);
	}else{
		console.log("������ ����!");
		attX2 = str.split("|")[1]-10;//Ŭ���� x��ǥ
		attY2 = str.split("|")[2]-10;//Ŭ���� y��ǥ
		
		//Ŭ���� ��ġ�� �̵�������
		var theta2 = Math.atan2(attY2 - yBul2, attX2 - xBul2);
		shootX2 = 3 * Math.cos(theta2);
		shootY2 = 3 * Math.sin(theta2);
	}
}

/*
 * �浹 ����
 */
function checkCollision(){
	//�Լ��� �������� �̻����� ���ʺ��� ũ��, �Լ��� ������ �̻����� �����ʺ��� �۰�,
	//�Լ��� ���� �̻����� �ٴں��� �۰�, �Լ��� �ٴ��� �̻����� ������ Ŭ���
	if(x1+35 > xBul2 && x1 < xBul2+5 
			&& y1 < yBul2+5 && y1+35 > yBul2) {
		console.log("���� �浹");
		if(damageCnt1 == 0) gage1.src = "img/gageTwo.png";
		else if(damageCnt1 == 1) gage1.src = "img/gageOne.png";
		else{
			player1.src = "img/explosion.png";
			gameOver1 = true;
		}
		damageCnt1++;
		gage1.width = 30;//�̹��� ������ ����
		gage1.height = 5;
		return true;
	}
	
	if(x2+35 > xBul1 && x2 < xBul1+5 
			&& y2 < yBul1+5 && y2+35 > yBul1){
		console.log("������ �浹");
		if(damageCnt2 == 0) gage2.src = "img/gageTwo.png";
		else if(damageCnt2 == 1) gage2.src = "img/gageOne.png";
		else{
			player2.src = "img/explosion.png";
			gameOver2 = true;
		}
		damageCnt2++;
		gage2.width = 30;//�̹��� ������ ����
		gage2.height = 5;
		return true;
	}
	
	return false;
}

