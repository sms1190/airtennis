$(function(){
	var socket = io.connect("10.25.168.32:8080");
	var code = null, id = null, youserver = 1;
	if(window.location.hash !== "") {
		var code = window.location.hash.slice(1);
		youserver=0;
	}
	socket.emit('gencode', { code : code }, function(c, i) {
		if(code === null) {
			var div = $("#link");
			div.html("Invite another player to : " + window.location.href + "#" + c);
		}
		code = c;
		id = i;
	});
	canvas=document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	W=800;
	H=600;
	
	
	ballX=W/2-12;
	ballY=H/2-12;
	ballOffsetW=24;
	ballOffsetH=24;
	player1={};
	player2={};
	fps = 60;
	flag = 0;
	dx=0;
	dy=0;
	speed=3;
	startBtn = {};
	restartBtn = {};
	over = 0;
	dx=dy=speed;
	join_second_player=0;
	p1Score = 0;
	p2Score = 0;
	
	var img = new Image;
	img.src = "ball.png";
	var bg_img=new Image;
	bg_img.src="bg.jpg";
	var p1_img=new Image;
	p1_img.src="r.png";
	var p2_img=new Image;
	p2_img.src="l.png";
		player1['h']=64;
		player1['w']=64;
		player1['x']=W-player1['w']-25;
		player1['y']=H/2;

		player2['h']=64;
		player2['w']=64;
		player2['x']=25;
		player2['y']=H/2;

	// Function to paint paintCanvas
	function paintCanvas() {
	ctx.drawImage(bg_img,3,3);
		ctx.beginPath();
      ctx.rect(0,0,W,H);
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'white';
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.moveTo(W/2,0);
      ctx.lineTo(W/2,H);
      ctx.stroke();
      ctx.moveTo(0,100);
      ctx.lineTo(W,100);
      ctx.stroke();
      ctx.moveTo(0,H-100);
      ctx.lineTo(W,H-100);
      ctx.stroke();
      ctx.moveTo(200,100);
      ctx.lineTo(200,H-100);
      ctx.stroke();
      ctx.moveTo(W-200,100);
      ctx.lineTo(W-200,H-100);
      ctx.stroke();
      ctx.moveTo(200,H/2);
      ctx.lineTo(W-200,H/2);
      ctx.stroke();
	}

	// Draw everything on canvas
	function draw() {
			paintCanvas();	
			player1draw();
			player2draw();
			balldraw();	
	}

	function player1draw(){
		ctx.drawImage(p1_img,player1['x'], player1['y'],64,64);
	}

	function player2draw(){
		ctx.drawImage(p2_img,player2['x'], player2['y'],64,64);
	}

	function balldraw(){
		ctx.drawImage(img,ballX,ballY,24,24);
	}

	function start(){
		setInterval(function ()
		{
		   // MOVE BALL
		   ballX += dx;
		   ballY += dy;

		   // See if ball is past player paddle

		   if(ballX < 0)
		   {
			  p1Score = p1Score + 15;
		   	  syncScore("p1Score", p1Score);
		   	  changeScore("p1Score", p1Score);
		      if(p1Score == 45) {
		      	alert("Player 1 Wins!!");
		      }
		      //init();
		      ballX=W/2-12;
		      ballY=H/2-12;
		   }

		   // See if ball is past CPU paddle

		   if((ballX + ballOffsetW) > W)
		   {
		   	  p2Score = p2Score + 15;
		   	  syncScore("p2Score", p2Score);
		   	  changeScore("p2Score", p2Score);
		   	  	if(p2Score == 45) {
				    alert("Player Wins!!");
				}
		      //alert("You win");
		      //init();
		      ballX=W/2-12;
		      ballY=H/2-12;
		   }

		   // COLLISION DETECTION

		   // If ball hits upper or lower wall
		   if(ballY < 0 || ((ballY + ballOffsetH) > H))
		      dy = -dy; // Make y direction opposite

		   // If ball hits player paddle

		   	if(((ballY + ballOffsetH) > player1['y']) && ballY < (player1['y'] + player1['h']) && ballX+ballOffsetW > (player1['x'])){
		         dx = -dx;
		     }
		    

		   
		   	if(((ballY+ballOffsetH) > player2['y']) && ballY < (player2['y'] + player2['h']) && (ballX) < player2['x']+player2['w']){
		         dx = -dx;
		   	}
		      
		   // Place ball at calculated positions
		   data={};
		   data['x']=ballX;
		   data['y']=ballY;
		   data['dx']=dx;
		   data['dy']=dy;
		   moveBallPosition(data);
		   draw();
		},10);
	}

	var control_player;
	if(youserver==1){
	control_player = player1;
	}
	else{
	control_player = player2;
	}

	var controller = new Leap.Controller();
    var start_flag=0;
    var start_frame='';
    var start_frame_id='';
    var i=0;
    var prev=0;
    var prevx=0;
    controller.on( 'frame' , function(frame){

      if(frame.hands.length==1){
      		if(frame.hands[0].fingers.length==1){
      			finger=frame.hands[0].fingers[0];

      			currentPosition = finger.tipPosition;
      		
      				paddle=control_player;
      				
      				if(youserver==1){
						if(Math.abs(currentPosition[1]-prev)>2 || Math.abs(currentPosition[0]-prevx)>2){
												
							if(currentPosition[1]-prev>0){
								if(paddle['y']-10>0){
									paddle['y']=paddle['y']-10;
								}
							}
							else{
								if(paddle['y']+10+paddle['h']<H){
									paddle['y']=paddle['y']+10;
								}
							}

							if(currentPosition[0]-prevx>0){
								if(paddle['x']+64<W-2){
									paddle['x']=paddle['x']+10;
								}
							}
							else{
								if(paddle['x']-5>W/2){
									paddle['x']=paddle['x']-10;
								}
							}
							prev=currentPosition[1];
							prevx=currentPosition[0];	
							
	      					control_player=paddle;
	      					moveMyPosition(control_player);
							draw();
						}
					}
					else{
						if(Math.abs(currentPosition[1]-prev)>2 || Math.abs(currentPosition[0]-prevx)>2){
												
							if(currentPosition[1]-prev>0){
								if(paddle['y']-10>0){
									paddle['y']=paddle['y']-10;
								}
							}
							else{
								if(paddle['y']+10+paddle['h']<H){
									paddle['y']=paddle['y']+10;
								}
							}

							if(currentPosition[0]-prevx>0){
								if(paddle['x']+64<W/2){
									paddle['x']=paddle['x']+10;
								}
							}
							else{
								if(paddle['x']-64>2){
									paddle['x']=paddle['x']-10;
								}
							}
							prev=currentPosition[1];
							prevx=currentPosition[0];	
							
	      					control_player=paddle;
	    					moveMyPosition(control_player);  					
							draw();
						}	
					}
      		}
      }
	});
	controller.connect();
	img.onload=function(){
		draw();
	};
	/*if(youserver==1){
		start();
	}*/
	
	socket.on("moveball", function(data) {
		if(youserver==1){
		
		}
		else{
			ballX=data['x'];
			ballY=data['y'];
			dx=data['dx'];
			dy=data['dy'];
			draw();
		}
		
	});

	function moveMyPosition(position) {
		var data = $.extend(position, { gameid: ""+code, id: id });
		socket.emit("moveplayer", data);
	}

	function moveBallPosition(position) {
		var data = $.extend(position, { gameid: ""+code, id: id });
		socket.emit("moveball", data);
	}

	function syncScore(name, score) {
		var data = $.extend({name: name, score: score }, { gameid: ""+code, id: id });
		socket.emit("syncScore", data);
	}

	function changeScore(name,score) {
		$("#"+name).html(score);
	}

	socket.on("syncScore", function(data) {
		changeScore(data.name, data.score);
	});

	socket.on("partner_joined", function() {
		if(join_second_player==0){
				start();
				join_second_player=1;
			}
			draw();
	});
	socket.on("moveplayer", function(data) {
		console.log(data);
		if(youserver==1){
			player2=data;
		}
		else{
			player1=data;
		}
		draw();
	});
});