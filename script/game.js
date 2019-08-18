function Car(ctx){
	gameMonitor.im.loadImage(['images/player1.png']);
	this.width = 40;
	this.height = 80;
	this.left = gameMonitor.w/2 - this.width/2; //初始位置
	this.top = gameMonitor.h - 2*this.height; //初始位置
	this.player = gameMonitor.im.createImage('images/player1.png');

	this.paint = function(){
		ctx.drawImage(this.player, this.left, this.top, this.width, this.height);
	}

	this.setPosition = function(event){
		if(gameMonitor.isMobile()){
			var tarL = event.originalEvent.targetTouches[0].clientX;
			var tarT = event.originalEvent.targetTouches[0].clientY;
		}
		else{
			var tarL = event.offsetX;
			var tarT = event.offsetY;
		}
		//车初始位置
		this.left = tarL - this.width/2 - 16;
		this.top = tarT - this.height/2;
		//限定车不会超出屏幕
		if(this.left<0){
			this.left = 0;
		}
		if(this.left>320-this.width){
			this.left = 320-this.width;
		}
		if(this.top<0){
			this.top = 0;
		}
		if(this.top>gameMonitor.h - this.height){
			this.top = gameMonitor.h - this.height;
		}
		this.paint();
	}

	this.control = function(){
		var _this = this;
		var stage = $('#gamepanel');
		var currentX = this.left,
			currentY = this.top,
			move = false;
		stage.on(gameMonitor.eventType.start, function(event){
			_this.setPosition(event);
			move = true;
		}).on(gameMonitor.eventType.end, function(){
			move = false;
		}).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
			if(move){
				_this.setPosition(event);	
			}
			
		});
	}

	//eat
	// this.eat = function(letterlist){
	// 	var checkletterlist = check.split("");	
	// 	for(var tt = 0; tt<checkletterlist.length; tt++){
	// 	 				//判定字母
	//  		for(var i = letterlist.length-1; i>=0; i--){
	//  			var l = letterlist[i];
	//  			if(l){//勾股定理算直径
	// 	 			var l1 = this.top+this.height/2 - (l.top+l.height/2);
	// 	 			var l2 = this.left+this.width/2 - (l.left+l.width/2);
	// 	 			var l3 = Math.sqrt(l1*l1 + l2*l2);
	// 	 			if(l3<=(this.height-40)/2 + l.height/2){
	// 	 				//吃掉
	// 	 				letterlist[l.id] = null;
	// 	 				alert(checkletterlist[tt] + "," + l.type);
	// 	 				//letterlist[l.id] = null;
	// 	 				if(checkletterlist[tt] == l.type){
	 						
	//  						$("#english").append(l.type);
	 						
	// 	 				}
	// 	 			}
	// 	 		}
	// 	 		break;

	// 		}
	// 		continue;
	// 	}
	 	
	//  }

	 this.eat = function(letterlist){
	 	var sum = $("#english").text().length;
		var checkletterlist = check.split("");
	 	for(var i = letterlist.length-1; i>=0; i--){
	 		var l = letterlist[i];
	 		if(l){//勾股定理算直径
	 			var l1 = this.top+this.height/2 - (l.top+l.height/2);
	 			var l2 = this.left+this.width/2 - (l.left+l.width/2);
	 			var l3 = Math.sqrt(l1*l1 + l2*l2);
	 			if(l3<=(this.height-40)/2 + l.height/2){
	 				//吃掉
	 				letterlist[l.id] = null;
	 				//判定字母:正确
	 				if(checkletterlist[sum] == l.type){
	 					$("#english").append(l.type);
	 					sum++;
	 				}
	 				//判定字母:错误
	 				else{
	 					gameMonitor.stop();
	 					$('#gameoverPanel').show();

	 					setTimeout(function(){
	 						$('#gameoverPanel').hide();
	 						$('#resultPanel').show();
	 						$('#sChinese').text(wordlist[gameMonitor.wordId].translation);
							$('#sEnglish').text(check);
	 					}, 2000)
	 				}
	 				//判定当前单词是否完成
	 				if(sum == checkletterlist.length){
	 					gameMonitor.wordId++;
	 					sum = 0;
	 					//判定是否过关
		 				if(gameMonitor.wordId >= wordlist.length){
		 					gameMonitor.stop();
		 					$('#successPanel').show();
		 				}
		 				else{
		 					check = wordlist[gameMonitor.wordId].word;
		 					$("#chinese").text("").append(wordlist[gameMonitor.wordId].translation.substring(0, 10) + "...");
		 					$("#english").text("");
		 				}
	 				}

	 			}
	 		}
	 	}
	 }
}

function Letter(type,left,id){
	this.speedUpTime = 300;
	this.id = id;
	this.type = type;
	this.width = 40;
	this.height = 40;
	this.left = left;
	this.top = -50;
	this.speed = 0.04;
	this.loop = 0;

	var p = 'images/' + type + '.png';
	this.pic = gameMonitor.im.createImage(p);
}

Letter.prototype.paint = function(ctx){
	ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Letter.prototype.move = function(ctx){
	if(gameMonitor.time % this.speedUpTime == 0){
		this.speed *= 1.2;
	}
	//随着速度增加，每次绘制时多出的距离不同，loop相当于已经走过的帧数
	this.top += ++this.loop * this.speed;
	//超出画布的字母被删除
	if(this.top>gameMonitor.h){
	 	gameMonitor.letterList[this.id] = null;
	}
	else{
		this.paint(ctx);
	}
}

//图片加载器
function ImageMonitor(){
	var imgArray = [];
	return {
		createImage : function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src])
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback=='function'){
						callback();
					}
				}
				imgArray[img].src = img;
			}
		}
	}
}


var gameMonitor = {
	w: 320,
	h: 568,
	bgWidth: 320,
	bgHeight: 1126,
	//第几个单词
	wordId: 0,
	time: 0,
	timmer: null,
	bgSpeed: 2,
	bgloop: 0,
	im: new ImageMonitor(),
	letterList: [],
	bgDistance: 0,
	eventType:{
		start: 'touchstart',
		move: 'touchmove',
		end: 'touchend'
	},
	wordsArray: [],
	

	init: function(){
		window.check = "123";
		var _this = this;
		var canvas = document.getElementById('stage');
		var ctx = canvas.getContext('2d');

		//绘制背景
		var bg = new Image();
		_this.bg = bg;
		bg.onload = function(){
			ctx.drawImage(bg,0,0,_this.bgWidth,_this.bgHeight);
		}
		bg.src = 'images/bg.jpg';

		_this.initListener(ctx);
	},

	initListener: function(ctx){
		var _this = this;
		var body = $(document.body);
		//重新开始游戏时清除上次移动？
		// $(document).on(gameMonitor.eventType.move, function(event){
		// 	event.preventDefault();
		// });
		//重新开始时初始化小车:失败
		body.on(gameMonitor.eventType.start, '#scorecontent .btn1', function(){
			$('#resultPanel').hide();
			_this.letterList = [];
			_this.wordId = 0;

			_this.initCheck();
			_this.showWordList();
		});

		//重新开始时初始化小车:失败 new words
		body.on(gameMonitor.eventType.start, '#scorecontent .btn2', function(){
			$('#resultPanel').hide();
			_this.letterList = [];
			_this.wordId = 0;
			_this.initScene(ctx);

			_this.getWords(function () {
				$.each(_this.wordsArray, function(idx, obj) {
				    wordlist[idx] = obj;
				});

				_this.initCheck();

			    _this.showWordList();
			});
		});
		
		//重新开始时初始化小车:成功
		body.on(gameMonitor.eventType.start, '#successPanel .btn1', function(){
			$('#successPanel').hide();
			_this.letterList = [];
			_this.wordId = 0;

			_this.initCheck();
		    _this.showWordList();
		});

		//重新开始时初始化小车:成功 new word
		body.on(gameMonitor.eventType.start, '#successPanel .btn2', function(){
			$('#successPanel').hide();
			_this.letterList = [];
			_this.wordId = 0;
			_this.initScene(ctx);

			_this.getWords(function () {
				$.each(_this.wordsArray, function(idx, obj) {
				    wordlist[idx] = obj;
				});

				_this.initCheck();

			    _this.showWordList();
			});
		});

		body.on(gameMonitor.eventType.start, '#guidePanel', function(){
			$(this).hide();
			_this.getWords(function () {
				$.each(_this.wordsArray, function(idx, obj) {
				    wordlist[idx] = obj;
				});

				_this.initCheck();

			    _this.showWordList();
			});	
		});
		//第一次玩时初始化小车
		body.on(gameMonitor.eventType.start, '#start', function(){
			$('#wordListPanel').hide();
			_this.initScene(ctx);
			_this.run(ctx);
		});
	},
	initScene: function (ctx) {
		console.log("ctx", ctx);
		this.car = new Car(ctx);
		this.car.control();
		this.reset();
	},
	initCheck: function () {
		//打乱
	    wordlist.sort(function(){ return 0.5 - Math.random() });
	    //显示第一个中文
	    $("#chinese").text(wordlist[this.wordId].translation.substring(0, 10) + "...");
	    //放入第一个英文
	    check = wordlist[this.wordId].word;
	    $("#english").text("");
	},
	showWordList: function() {
		var appText = "<table>";
		for(var t = 0; t<wordlist.length; t++){
			appText += "<tr><td>"+ wordlist[t].word +"</td><td>" + wordlist[t].translation + "</td></tr>";
		}
		appText += "</table>";
		$('#wordList').html("");
		$('#wordList').append(appText);
		$('#wordListPanel').css('display', 'inline');
	},
	//绘制无缝背景
	rollBg : function(ctx){
		if(this.bgDistance>=this.bgHeight){
			this.bgloop = 0;
		}
		this.bgDistance = ++this.bgloop * this.bgSpeed;
		//每次移动一点
		ctx.drawImage(this.bg,0,this.bgDistance-this.bgHeight,this.bgWidth,this.bgHeight);
		ctx.drawImage(this.bg,0,this.bgDistance,this.bgWidth,this.bgHeight);
	},
	//跑起
	run : function(ctx){
		var _this = gameMonitor;
		//清除画布，否则会与上一次的叠加
		ctx.clearRect(0,0,_this.bgWidth,_this.bgHeight);
		_this.rollBg(ctx);

		//绘制汽车
		_this.car.paint();
		_this.car.eat(_this.letterList);

		//产生字母
		_this.generateLetter(check);

		//绘制字母
		//总后往前绘制，前面的已经被删掉了
		for(i=_this.letterList.length-1;i>=0;i--){
			var l = _this.letterList[i];
			if(l){
				l.paint(ctx);
				l.move(ctx);
			}
		}
		_this.timmer = setTimeout(function(){
			gameMonitor.run(ctx);
		},Math.round(1000/60));//60帧

		_this.time++;
	},
	stop : function(){
		var _this = this;
		$('#stage').off(gameMonitor.eventType.start + ' ' +gameMonitor.eventType.move);
		setTimeout(function(){
			clearTimeout(_this.timmer);
		}, 0);
		
	},
	generateLetter : function(word){
		var genRate = 20; //产生字母的频率
		var random = Math.random();
		if(random*genRate>genRate-1){
			//随机位置
			var left = Math.random()*(this.w - 50);
			//随机字母类型
			var type = "";
			var numList = [];//
			var wlist = word.split('');
			for(var x=0; word.length > x; x++){
			 	numList[x] = wlist[x].charCodeAt() - 97;	
			}
			numList.push(numList.length%26);
			// numList.push(numList.length%26);
			// numList.push(numList.length%26);
			// numList.push(numList.length%26);
			// numList.push(numList.length%26);
			// var seed = Math.floor(left)%(wlist.length + 5);
			var seed = Math.floor(left)%(wlist.length + 1);
			switch(numList[seed]) {
				case 0 : type = "a"; break;
				case 1 : type = "b"; break;
				case 2 : type = "c"; break;
				case 3 : type = "d"; break;
				case 4 : type = "e"; break;
				case 5 : type = "f"; break;
				case 6 : type = "g"; break;
				case 7 : type = "h"; break;
				case 8 : type = "i"; break;
				case 9 : type = "j"; break;
				case 10 : type = "k"; break;
				case 11 : type = "l"; break;
				case 12 : type = "m"; break;
				case 13 : type = "n"; break;
				case 14 : type = "o"; break;
				case 15 : type = "p"; break;
				case 16 : type = "q"; break;
				case 17 : type = "r"; break;
				case 18 : type = "s"; break;
				case 19 : type = "t"; break;
				case 20 : type = "u"; break;
				case 21 : type = "v"; break;
				case 22 : type = "w"; break;
				case 23 : type = "x"; break;
				case 24 : type = "y"; break;
				case 25 : type = "z"; break;
				default: type = "a";
			} 
			//
			var id = this.letterList.length;
			var l = new Letter(type, left, id);
			//延迟生成
			this.letterList.push(l);
		}
	},
	reset : function(){
		this.bgloop = 0;
		this.timmer = null;
		this.time = 0;
	},
	isMobile : function(){
		var sUserAgent= navigator.userAgent.toLowerCase(),
		bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp= sUserAgent.match(/midp/i) == "midp",
		bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid= sUserAgent.match(/android/i) == "android",
		bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
		bIsWebview = sUserAgent.match(/webview/i) == "webview";
		return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
     },
     getWords : function(callback) {
     	var _this = this;
     	$.get("http://codemoney.tech:8080/words", function(data) {
     		_this.wordsArray = data;
     		console.log(_this.wordsArray);
     		callback();
     	});

     	
     }
}
if(!gameMonitor.isMobile()){
	gameMonitor.eventType.start = 'mousedown';
	gameMonitor.eventType.move = 'mousemove';
	gameMonitor.eventType.end = 'mouseup';
}

var wordlist = [];
var check = "123";
gameMonitor.init();