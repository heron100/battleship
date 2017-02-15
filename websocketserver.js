
var server = require("http").createServer(),//HTTP������ ����
	ws = new (require("websocket").server)({//������ ������ ���� - ws.mount()�޼��带 ������� �ʰ� WebSocketServer�����ڿ� �������� ��ü�� ����
		httpServer : server,
		autoAcceptConnections : true //�������ݰ� �����ϰ� �������
	}), clients = [];//Ŭ���̾�Ʈ ���
	
	idx = 0;//Ŭ���̾�Ʈ ��� �ε���(0���̽� �ƴ�)
	room_list = [];//����
	where_list = new Map();//��ġ���(key : �г���, value : ���̸�)
	//Ŭ���̾�Ʈ�� ���� ��ġ��ǥ �ʱⰪ
	firstX1 = 450;
	firstY1 = 550;
	firstX2 = 30;
	firstY2 = 100;
	//������
	master = [];
	//�÷��̾� �̵����� ����
	moveOk = [];

/*
 * ��� Ŭ���̾�Ʈ���� �޽��� ����
 */
function broadcast(data) {
	clients.forEach(function(client) {
		client.sendUTF(data);
	});
}	

/*
 * ������ Ŭ���̾�Ʈ���� �޽��� ����
 */
function selectcast(data) {
	var loc = data.split("|")[3];//���̸�
	var player = data.split("|")[4];//Ŭ���� ������
	var flag = false;
	//Ŭ���� ������ �������� ����üũ
	master.forEach(function(user){
		if(user == player) flag = true; 
	});
	
	where_list.forEach(function(wh, name){//���̸��� ���� �������Ը� ������
		//(1:���, 2:x��ǥ, 3:y��ǥ, 4:���̸�, 5:Ŭ���� ������, 6:���忩��, 7:�̵�����)
		if(wh == loc) clients[name-1].sendUTF(data+"|"+flag+"|"+moveOk[player-1]);
	});
}

/*
 * ������� Ŭ���̾�Ʈ���� ���� ����
 */
function waitcast(data) {
	where_list.forEach(function(wh, name){//���̸��� ���� �������Ը� ������
		if(wh == "WAIT") clients[name-1].sendUTF(data);
	});
}


/*
 * connect�̺�Ʈ �߻��ÿ� Ŭ���̾�Ʈ�� ����ϴµ� �ʿ��� ���ᰴü�� ���޵ȴ�
 */
function connectHandler(conn) {
	//conn.nickname = conn.remoteAddress;//Ŭ���̾�ƮIP�� �������� ����Ѵ�
	conn.on("message", messageHandler);
    conn.on("close", closeHandler);
	idx = clients.push(conn);//Ŭ���̾�Ʈ ��Ͽ� ������ �߰��Ѵ�
	conn.nickname = idx;
	moveOk.push(true);//�̵��������� �ʱ�ȭ
	where_list.set(conn.nickname, "WAIT");
}

/*
 * ������ ���� Ŭ���̾�Ʈ �����ϱ�
 */
function closeHandler() {
	var index = clients.indexOf(this);
	if (index > -1) {
		clients.splice(index, 1);
	}
}

/*
 * Ŭ���̾�Ʈ�� ������ ������ �����͸� �����ϸ�
 * Ŭ���̾�Ʈ ���ᰴü�� message�̺�Ʈ �߻�
 */
function messageHandler(message) {
	var data = message.utf8Data.toString(),//utf8Data�Ӽ��� ���� ���ڿ��޽����� ����
		firstWord = data.split("|")[0];
		switch (firstWord) {
			case "101" ://���� OPEN
				waitcast("101|"+roomList());//����ڵ鿡�� ������ �����Ѵ�
				break;
			case "102" ://�̵��ϱ�
				//(1:���, 2:x��ǥ, 3:y��ǥ, 4:���̸�, 5:Ŭ���� ������)
				selectcast(data+"|"+this.nickname);//���̸��� Ŭ���� �������� �����ؼ� �� �����ڿ��Ը� ����
				break;
			case "103" ://���� �߰� - ���̸��� �ߺ����� ������ ��������
				var roomName = data.split("|")[1];
				var ch = checkRoomNm(roomName);//���̸� �ߺ�����üũ
				if(ch != true){//������ �ߺ����� ���� ��
					room_list.push(roomName);//���� �߰�
					var roomlist = roomList();
					waitcast("101|"+roomlist);//����ڴ� ������ �����ϵ��� ����
					clients[this.nickname-1].sendUTF("103|"+roomName);//������ �����ϵ��� ����
				}else{
					//Ŭ���� �������Ը� ������(���̸� �ߺ��޽���)
					clients[this.nickname-1].sendUTF("103|dupl");
				}
				break;
			case "104" ://���� ���� - �ʱⰪ ����
				var rmName = data.split("|")[1];//������ ���̸�
				where_list.set(this.nickname, rmName);//�����¿��� ������ ���̸����� ��ġ���� ����
				master.push(this.nickname);//���� ��ο� �߰�
				//�濡 ������ ������Ը� ������ �޽���(1:���, 2:���̸�, 3:x1, 4:y1) 
				clients[this.nickname-1].sendUTF(data +"|"+ firstX1 +"|"+ firstY1);//������ ��ġ �ʱⰪ
				break;
			case "105" ://������ ������ - ���ӽ���(�ʱⰪ����&���ϻ���) 
				var rmName = data.split("|")[1];//������ ���̸�
				where_list.set(this.nickname, rmName);//�����¿��� ������ ���̸����� ��ġ���� ����
				where_list.forEach(function(wh, name){//���̸��� ���� �������Ը� ������
					if(wh == rmName){
						//��û�� ��ǥ�� ��ü(1:���, 2:���̸�, 3:x1, 4:y1, 5:x2, 6:y2)
						clients[name-1].sendUTF(data + "|"+ firstX1 +"|"+ firstY1+ "|"+ firstX2 +"|"+ firstY2);
					}
				});
				//���Ͽ��� ���� => ���ӽ���
				var idn = room_list.indexOf(rmName);
				if(idn != -1) room_list.splice(idn, 1);//(1:start, 2:deleteCnt)
				waitcast("101|"+roomList());//����ڵ鿡�� ������ �����ϵ��� �����ش�
				break;
			case "106" : //�̵��ϱ� ��ưŬ��
				moveOk[this.nickname-1] = true;
				break;
			case "107" : //�̻��� �߻��ϱ� ��ưŬ��
				moveOk[this.nickname-1] = false;
				break;
			case "108" ://�泪����
				where_list.set(this.nickname, "WAIT");//������ ���̸��� �����·� ����
				var idx = master.indexOf(this.nickname);//���� ��ο��� ����
				if(idx != -1) master.splice(idx, 1);//(1:start, 2:deleteCnt)
				waitcast("101|"+roomList());//������ ���ϰ� ��������� �����Ѵ�
				break;
			case "/nick" : //�̸��� ���Ѵ�
				var newname = data.split(" ")[1];
				if (newname != "") {
					//broadcast(this.nickname + " changed name to " + newname);
					this.nickname = newname;
				}
				break;
			case "/shutdown" : //������ ������ �ݴ´�
				//broadcast("Server shutting down. Bye!");
				ws.shutDown();//������ ������ ��� �ݴ´�
				server.close();
				break;
			//default :
				//broadcast(data);
				//this.sendUTF("Unknown command: " + firstWord);
		}
}

/*
 * ������ ���̸� üũ
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
 * ������ ���
 */
function roomList(){
	var rmlist="";
	for(var i=0; i<room_list.length; i++){
		if(rmlist != "") rmlist += ","+room_list[i];
		else rmlist = room_list[i];
	}
	return rmlist;
}

//���ο� Ŭ���̾�Ʈ�� ������ ����Ǹ� WebSocketServer��ü���� connect�̺�Ʈ�� �߻��Ѵ�
ws.on("connect", connectHandler);

server.listen(9999);//�������