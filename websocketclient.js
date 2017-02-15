

/*
 * ������ �ε��� �Ϸ�Ǹ� ȣ��
 */
function setupGame() {
	ws = new WebSocket("ws://127.0.0.1:9999/");//������ �����ϱ� - ������ �������
	
	setupInput(ws);
	
	ws.addEventListener("open", function (e) {//open�̺�Ʈ �߻���
		console.log("OPEN!");
		ws.send("101|");//������ �޽��� ������ - ����&�湮��ID ��û
	}, false);
	
	ws.addEventListener("message", function(e) {//message�̺�Ʈ �߻���(�����κ��� ������-data ����)
		var firstkey = e.data.split("|")[0];
		console.log("commandkey===>"+firstkey);
		switch(firstkey){
			case "101" ://���� ���� ����
				console.log("101���� : "+e.data);
				roomList(e.data.split("|")[1]);//������ ���������� �Ѱ��ش�
				break;
			case "102" ://�׼�
				console.log("102���� : "+e.data);
			    if(gameOver1 == true || gameOver2 == true) return;//���ӿ����̸� �������� �ʰ� ����
				if(e.data.split("|")[6] == "true"){//�̵����ΰ� true�̸� �̵�
					move(e.data);
				}else{//�׷��� ������ �߻�
				    if(new Date().getTime() - lastShoot >= 3000)
						attack(e.data);
				}
				break;
			case "103" ://���̸� �ߺ�üũ�� ���忩�� ����
				console.log("103���� : "+e.data);
				var msg = e.data.split("|")[1];
				if(msg == "dupl") alert("���̸��� �ߺ��˴ϴ�."); //���̸��� �ߺ��ɶ�
				else entry(msg);//�游������ �����̹Ƿ� �������
				break;
			case "104" ://������� �ʱ�ȭ
				console.log("104���� : "+e.data);
				//e.data - 1:���, 2:���̸�, 3:x1, 4:y1
				x1 = parseInt(e.data.split("|")[2]);
				y1 = parseInt(e.data.split("|")[3]);
				x2 = 0;
				y2 = 0;
				init();
				break;
			case "105" ://�������� �ʱ�ȭ
				console.log("105���� : "+e.data);
				//�����ѹ� �ο��� ����
				//(1:���, 2:���̸�, 3:x1, 4:y1, 5:x2, 6:y2)
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
	
	ws.addEventListener("close", function(e) {//close�̺�Ʈ �߻���
		console.log(e);
	}, false);
}

/*
 * �����κ��� ���Ź��� ���ӹ� �����͸� ȭ�鿡 �����ش�
 */
function roomList(str){
	var array = str.split(",");
	var table = '';
	console.log("���ϼ� : "+array.length);
	array.forEach(function(room) {
		if(room == '' || room == null) table = '';
		else table += "<tr class='record'><td>" +
				"<button onclick=javascript:join('"+room+"'); class='roombutton'>"+room+"</button>" +
						"</td></tr>";
	});

	$("#rmlistTable tr:gt(0)").remove();// ���̺��� ù���� �����ϰ� ��� �����Ѵ�.
	$("#rmlistTable tr:eq(0)").after(table);// ���̺��� ù��° �� �ڿ� table �߰��Ѵ�.
}

/*
 * �����κ��� ���Ź��� ���� �����͸� ȭ�鿡 �����ش�
 */
//function userCurrent(str){
//	var list = str.split(",");
//	var userName = '';
//	list.forEach(function(user){
//		userName += "<tr><td>"+ user +"</td></tr>";
//	});
//	
//	$("#userTable tr:gt(0)").remove();// ���̺��� ù���� �����ϰ� ��� �����Ѵ�.
//	$("#userTable tr:eq(0)").after(userName);// ���̺��� ù��° �� �ڿ� table �߰��Ѵ�.
//}

/*
 * ���� ���� - ȭ����ȯ & ������ ������ ������ ���̸����� 
 */
function entry(room){
	console.log(room + "�� ����!");
	document.getElementById("top").style.display = 'none';
	document.getElementById("panel").style.display = 'block';
	roomName = room;//������ ���̸��� �����Ѵ�
	ws.send("104|"+room);//�������� ������ �˸�
}

/*
 * �� ���� - ȭ����ȯ & ������ �����ڰ� ������ ���̸� ����
 */
function join(room){
	console.log(room + "�� ����!");
	document.getElementById("top").style.display = 'none';
	document.getElementById("panel").style.display = 'block';
	roomName = room;//������ ���̸��� �����Ѵ�
	ws.send("105|"+room);//�������� ������ �˸�
}


window.addEventListener("load", setupGame, false);//�����찡 �ε�ɶ� setupChat�޼��� ȣ��