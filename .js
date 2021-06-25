(function() {
    //polyfills
    window.console._log=window.console.log;
function Event(e, t) {
    this.script = e, this.target = t, this._cancel = !1, this._replace = null, this._stop = !1
}
Event.prototype.preventDefault = function() {
    this._cancel = !0
}, Event.prototype.stopPropagation = function() {
    this._stop = !0
}, Event.prototype.replacePayload = function(e) {
    this._replace = e
};
var callbacks = [],
    addBeforeScriptExecuteListener = function(e) {
        if (!e instanceof Function) throw new Error("Event handler must be a function.");
        callbacks.push(e)
    },
    removeBeforeScriptExecuteListener = function(e) {
        for (var t = callbacks.length; t--;) callbacks[t] === e && callbacks.splice(t, 1)
    },
    addev = window.addEventListener.bind(window),
    rmev = window.removeEventListener.bind(window);
window.addEventListener = function() {
    "beforescriptexecute" === arguments[0].toLowerCase() ? addBeforeScriptExecuteListener(arguments[1]) : addev.apply(null, arguments)
}, window.removeEventListener = function() {
    "beforescriptexecute" === arguments[0].toLowerCase() ? removeBeforeScriptExecuteListener(arguments[1]) : rmev.apply(null, arguments)
};
var dispatch = function(e, t) {
        var r = new Event(e, t);
        if (window.onbeforescriptexecute instanceof Function) try {
            window.onbeforescriptexecute(r)
        } catch (e) {
            console.error(e)
        }
        for (var n = 0; n < callbacks.length && !r._stop; n++) try {
            callbacks[n](r)
        } catch (e) {
            console.error(e)
        }
        return r
    },
    observer = new MutationObserver(e => {
        for (var t = 0; t < e.length; t++)
            for (var r = 0; r < e[t].addedNodes.length; r++) {
                var n = e[t].addedNodes[r];
                if ("SCRIPT" === n.tagName) {
                    var o = dispatch(n, e[t].target);
                    o._cancel ? n.remove() : "string" == typeof o._replace && (n.textContent = o._replace)
                }
            }
    });
observer.observe(document, {
    childList: !0,
    subtree: !0
});
    //polyfills
    //options
    const weapons=[0,57,5,6,30,19,9,62,63,64,65,66,67,68,69,70,92,93,12,13,14,15,33,16,17,34,18];
    const swords=[57,0,5,6,30,19,9,62,63];
    const spears=[12,13,14,15,33,16,17,34,18];
    const pickAxes=[8,1,3,4,31,32];
    const helms=[60, 59, 44, 43, 61, 27, 26, 25, 58];
    let lastDropItemId=103,isAttacking=false;
    let lastBuild=`[10,119,136,0]`;
    let enemyList;
    let enemy;
    let oldClothing
    let events={blizzard:{status:false,in:false},sandStorm:{status:false,in:false}};
    let myPlayerId;
    let myPlayer;
    let playerStatus;
    let myInventory;
    let aimbot=false;
    let options={
        circleTimerFuncName:"hh",
        timeoutLastPlayerUI:undefined
    };
    let circleTime;
    let commands={lastCraftCommand:{keyCode:"KeyE",wsSend:"[7,49]"},
                  meatCraft:{keyCode:"KeyZ",wsSend:"[7,49]"},
                  bandageCraft:{keyCode:"KeyX",wsSend:"[7,54]"},
                  fillBottle:{keyCode:"KeyC",wsSend:"[7,111]"},
                  autoClick:{keyCode:"KeyQ",active:false,wsSend:0}
                 }
    let oldfunc={};
    let newfunc={};
    //options
    //functions
    function run(){
        history.pushState();
    }
    const dist2d = (p1, p2) => {
        return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
    }

    const calcAngle = (p1, p2) => {
        var dy = p1.y - p2.y;
        var dx = p2.x - p1.x;
        var theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return theta;
    }
    const angle360 = (p1,p2) => {
        var theta = calcAngle(p1,p2);
        if (theta < 0) theta = 360 + theta;
        return theta;
    }
    function checkInEnemyRange(range){
        let dist=dist2d(myPlayer,enemy);
        if(dist<range){
            return true;
        }
        return false;
    }
    function findEnemyAngle(angle){
        let minDist=99999,isEnemy=false
        enemyList.forEach((value, key,)=>{
            let dist=dist2d(myPlayer,value);
            let id=value[Object.keys(value)[1]];
            if( dist < 230 && dist<minDist && id!==myPlayerId && !checkAlly(id)){
                if((swords.includes(myPlayer.right) && dist < 110) || (spears.includes(myPlayer.right) && dist < 240)){
                    if(!isAttacking){
                        ws.send(`[4,${commands.autoClick.wsSend}]`);
                        isAttacking=true;
                    }
                }else{
                ws.send(`[14]`);
                        isAttacking=false;
                }
                isEnemy=true;
                minDist=dist;
                enemy=value;
            }else{
                ws.send(`[14]`);
                        isAttacking=false;

            }
        });
        if(isEnemy){
            angle = Math.floor(angle360(myPlayer,enemy)*255/360);
            angle=(angle<255/2) ? -2*Math.PI*angle/255 :(255-angle)*Math.PI*2/255;
        }
        return angle;
    }
    function checkAlly(id){
        return Object.values(window.p)[21].some((ally)=>{
            return ally==id
        });
    }
    function autoHelm(){
        helms.some((helm)=>{
            return myInventory.some((item)=>{
                if(helm==item.id && Object.values(myPlayer)[63]!==item.id){
                    oldClothing=Object.values(myPlayer)[63];
                    ws.send(['[5,'+item.id+']']);
                    return true;
                }
                return false ;
            });
        });}
    //functions
    //hooks
    oldfunc.webSocket=window.WebSocket;
    window.WebSocket=newfunc.webSocket=new Proxy(window.WebSocket,{
        construct:function(target,args){
            enemy=undefined;
            ws = new target(...args);
            setTimeout(()=>{
                myInventory=Object.values(Object.values(window.p)[35])[4];
                var event = document.createEvent('Event');
                event.data=[22,0];
                event.initEvent('message', false, false);
                ws.dispatchEvent(event);},200);
            const messageHandler = (e) => {
                if ("string" === typeof e.data){
                    e = JSON.parse(e.data);
                    switch (e[0]) {
                        case 3:
                            myPlayerId=e[9];
                            events.blizzard.status=Boolean(e[27]);
                            events.sandStorm.status=Boolean(e[26]);
                            break;
                    }
                }else{
                    var d = new Uint8Array(e.data);
                    switch (d[0]) {
                        case 16:
                            circleTime=Date.now();
                            playerStatus={hp:d[1],food:d[2],temp:d[3],water:d[4], air:d[5], heat:d[6]};
                            if(d[6]===0){
                                ws.send('[5,136]');
                            }
                            break;
                        case 17:
                            myPlayer=undefined;
                            enemyList=undefined;
                            break;
                        case 22:
                            if(d[1]==1 &&!(e.data instanceof Array)){
                                setTimeout(()=>{var event = document.createEvent('Event');
                                                event.data=[22,0];
                                                event.initEvent('message', false, false);
                                                ws.dispatchEvent(event);},200);
                            }
                             break;
                        case 36:
                            if(d[1]===1){
                                myInventory && myInventory.some((item)=>{
                                    if(item.id==47 || item.id==48){
                                        oldClothing=Object.values(myPlayer)[63];
                                        Object.values(myPlayer)[63]!== item.id && ws.send(['[5,'+item.id+']']);
                                    }
                                });
                            }else if(Object.values(myPlayer)[63]==47 || Object.values(myPlayer)[63]==48){
                                Number.isInteger(oldClothing) && ws.send('[5,'+(oldClothing?oldClothing:Object.values(myPlayer)[63])+']');
                            }

                            break;
                        case 37:
                            if(playerStatus && playerStatus.hp>d[1] && playerStatus.food!== 0 && playerStatus.temp!== 0 && playerStatus.water!== 0 && playerStatus.air!== 0 && !events.blizzard.in){
                                autoHelm();
                            }
                            playerStatus ? playerStatus.hp=d[1]: playerStatus={hp:d[1]};
                            break;
                        case 68:
                            events.sandStorm.status= (d[1]==1) ? (true) : (false);
                            break;
                        case 69:
                            events.blizzard.status= (d[1]==1) ? (true) : (false);
                            break;
                        case 70:
                            events.blizzard.in= (d[1]==1) ? (true) : (false);
                            break;
                    }
                 }
            };

            const closeHandler = (event) => {
                console.log('Close', event);
                aimbot=false;
                enemyList=undefined;
                myPlayer=undefined;
                myInventory=undefined;
                ws.removeEventListener('message', messageHandler);
                ws.removeEventListener('close', closeHandler);
                ws.send= oldfunc['ws.send'];
            };
            ws.addEventListener('message', messageHandler);
            ws.addEventListener('close', closeHandler);

            oldfunc['ws.send']=ws.send;
            newfunc['ws.send']= ws.send= new Proxy(ws.send, {
                apply: function(target, _this, _arguments) {
                    if(typeof _arguments[0]==='string' ){
                        try{
                            arr =JSON.parse(_arguments[0]);
                        }catch(err){}
                        if(arr){       //22 degirmen 25 ocak odun 24 ocak un 12 ateş chest 8 arg 3
                            if(arr[0]===document.getElementById(atob('bmlja25hbWVfaW5wdXQ=')).value){
                                 arr[0]=arr[0].substring(0,7)+atob("");
                                 arr[1]=arr[1]*8;
                                 arr[2]=arr[2]*8;
                                 _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===7){
                                target.apply(_this, ['[5,28]']);
                                commands.lastCraftCommand.wsSend=_arguments[0];
                            }else if(arr[0]===3){
                                commands.autoClick.wsSend=arr[1];
                            }else if(arr[0]===4){
                                isAttacking=true;
                            }else if(arr[0]===14){
                                isAttacking=false;
                            }else if(arr[0]===38){
                                arr[1]=50;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===8){
                                arr[2]=50;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===10){
                                lastBuild=_arguments[0];
                            }else if(arr[0]===12){//furnace
                                arr[1]=35;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===22){//windmill
                                arr[1]=255;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===25){//oven wood
                                arr[1]=31;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===24){//oven flour
                                arr[1]=31;
                                _arguments[0]=JSON.stringify(arr);
                            }else if(arr[0]===28){
                                lastDropItemId=arr[1];
                            }else if(arr[0]===5){
                                if(myInventory && weapons.includes(arr[1])){
                                    autoHelm();
                                }
                            }
                        }
                    }
                    ws.readyState === ws.OPEN && Function.prototype.apply.apply(target, [_this, _arguments]);
                }
            });
            return ws;
        }
    });
    oldfunc['array.push'] = Array.prototype.push;
    newfunc['array.push'] = Array.prototype.push= new Proxy(Array.prototype.push, {
        apply: function(target, _this, _arguments) {
            const data=_arguments[0];
            if (data && data.type != null && data.id != null && data.x && data.y && data.update && myPlayer==undefined) {
                if(enemyList==undefined){
                    enemyList=_this;
                }
                let id=data[Object.keys(data)[1]];
                if(id===myPlayerId){
                    myPlayer=data;
                }
            }else if(data && data.hasOwnProperty('id') && typeof data.info==='object' && 'active' in data.info && 'state' in data.info && arguments.callee.caller.arguments[0] instanceof Array){
                if(myInventory==undefined){
                    myInventory= myInventory=_this;
                }
                if(weapons.includes(data.id) && _this.length>2){
                    _this.splice(1, 0,data);
                    return data;
                }else if(pickAxes.includes(data.id) && _this.length>1){
                    _this.splice(0, 0,data);
                    return data;
                }else if(_this.length>4){
                    _this.splice(4, 0,data);
                    return data;
                }
            }
            return Function.prototype.apply.apply(target, [_this, _arguments]);
        }
    });
    oldfunc['Math.asin'] = Math.acos;
    newfunc['Math.asin'] = Math.acos= new Proxy(Math.acos, {
        apply: function(target, _this, _arguments) {
            let ret=Function.prototype.apply.apply(target, [_this, _arguments]);
            if(arguments.callee.caller.caller.caller.name==='update' && aimbot && weapons && weapons.includes(myPlayer.right)){
                let args=arguments.callee.caller.arguments[0];
                let a=arguments.callee.caller.arguments[0];
                let e=arguments.callee.caller.arguments[1];
                let sing=(0 > (a.x * e.y) - (a.y * e.x)) ? -1 : 1
                let angle=findEnemyAngle(ret*sing);
                return angle*sing;
            }
            if(isAttacking){
                //ws.send("[14]");
                isAttacking=false;
            }
            return ret;
        }
    });
    oldfunc['canvas.drawImage'] = CanvasRenderingContext2D.prototype.drawImage;
    newfunc['canvas.drawImage'] = CanvasRenderingContext2D.prototype.drawImage= new Proxy(CanvasRenderingContext2D.prototype.drawImage, {
        apply: function(target, _this, _arguments) {
            if(typeof myPlayer==='object' && _arguments[0].tagName=='CANVAS' && arguments.callee.caller.caller.name=='a' ){
                 try{
                _this.beginPath();
                _this.lineWidth = 1;
                _this.strokeStyle = aimbot?'#27F34A':'red';
                //_this.arc(myPlayer.x+Object.values(window.p)[28].x, myPlayer.y+Object.values(window.p)[28].y, 230, 0, 2 * Math.PI, false);
                _this.stroke();
                _this.beginPath();
                _this.strokeStyle = Object.values(p)[27].wait?'#27F34A':'#27F34A';
                //_this.arc(myPlayer.x+Object.values(window.p)[28].x, myPlayer.y+Object.values(window.p)[28].y, 100, 0, 2 * Math.PI, false);
                _this.stroke();

                Array.isArray(enemyList) && enemyList.forEach((enemy)=>{
                    let id=enemy[Object.keys(enemy)[1]];
                    if(!checkAlly(id) && id!==myPlayer && enemy.type===0){
                        _this.beginPath();
                        _this.strokeStyle = Object.values(Object.values(window.p)[41])[1].includes(id)?'#27F34A':'red';
                        _this.moveTo(myPlayer.x+Object.values(window.p)[28].x, myPlayer.y+Object.values(window.p)[28].y);
                        _this.lineTo(enemy.x+Object.values(window.p)[28].x, enemy.y+Object.values(window.p)[28].y);
                        _this.stroke();
                    }
                });
                     }catch{}
            }
            return Function.prototype.apply.apply(target, [_this, _arguments]);
        }
    });
    oldfunc['canvas.fillRect'] = CanvasRenderingContext2D.prototype.fillRect;
    newfunc['canvas.fillRect'] = CanvasRenderingContext2D.prototype.fillRect= new Proxy(CanvasRenderingContext2D.prototype.fillRect, {
        apply: function(target, _this, _arguments) {
           if(arguments.callee.caller && _this.fillStyle==="#669bb1"){
                _this.fillStyle = "#27F34A";
                _this.font = "bold 35px Arial";
                _this.fillText(`${circleTime? (5-(Date.now()-circleTime)/1000).toFixed(0):'5'}s`,_arguments[0]-60,_arguments[1]+20);
                _this.fillText(`${playerStatus ? playerStatus.hp*2:"200"}hp`,_arguments[0]-600,_arguments[1]+20);
                _this.fillStyle="#669bb1"
            }else if(arguments.callee.caller  && _this.fillStyle==="#69a148"){
                _this.fillStyle = "#27F34A";
                _this.font = "bold 25px Arial";
                _this.fillText(`Blizzard:${events.blizzard.status ?'ON':'OFF'}`,_arguments[0]-320,_arguments[1]+15);
                _this.fillText(`Sand Storm:${events.sandStorm.status ?'ON':'OFF'}`,_arguments[0]-320,_arguments[1]-15);

                _this.fillStyle="#69a148"
            }
            return Function.prototype.apply.apply(target, [_this, _arguments]);
        }
    });
    //hooks
    //handler
    window.addEventListener('beforescriptexecute',e => {
        if (e.script.src.includes('vin') && e.target.tagName=='BODY') {
            e.preventDefault();
            fetch('https://starve.io/js/vin.js').then(response=>response.text()).then((dataStr) => {
                let regx=new RegExp('([\\w]*=new [\\w]*;)([\\w]*=new [\\w\$]*;)','gi');
                const script=dataStr.replace(regx,'window.r=$1window.p=$2');
                const b = new Blob([script], { type: 'text/javascript' });
                const u = URL.createObjectURL(b);
                const s = document.createElement('script');
                s.src = u;
                document.body.appendChild(s);
                document.body.removeChild(s);
                URL.revokeObjectURL(u);
            })
        }
    });
    document.addEventListener('keydown', (event)=>{
        if( document.getElementById('chat_block').style.display!=='inline-block' && myPlayer!==undefined){
            if(event.code==="KeyQ"){
                let autoClickF=()=>{
                    if(commands.autoClick.active){
                        ws.send(`[4,${commands.autoClick.wsSend}]`);
                        ws.send("[14]");
                        setTimeout(autoClickF,550);
                    }
                }


                commands.autoClick.active=!commands.autoClick.active;
                autoClickF();
                setTimeout(autoClickF,550);
            }else if(event.code==='KeyT'){
                aimbot=!aimbot;
            }else if(event.code==='KeyG'){
                ws.send('[28,'+lastDropItemId+']');
            }else if(event.code==='KeyF' && lastBuild){
                const arr=JSON.parse(lastBuild);
                arr[2]=commands.autoClick.wsSend;
                ws.send(JSON.stringify(arr));
            }else{
                for (const [key, value] of Object.entries(commands)) {
                    if(value.keyCode===event.code){
                        ws.send(value.wsSend);
                    }
                }
            }
        }
    });
    document.addEventListener("DOMContentLoaded", function(event) {
        document.getElementById("game_canvas") && document.getElementById("game_canvas").style && (function(){document.getElementById("game_canvas").style.filter = "brightness(1.2)"})();
        document.getElementsByClassName('content')[0].addEventListener('click',(e)=>{
        });

        document.getElementById('game_canvas').addEventListener('contextmenu', function(e) {
            ws.send(`[5,7]`);
            commands.autoClick.active=false;
        });


    });
    document.addEventListener('click', (event)=>{
        commands.autoClick.active=false;
    })



    //handler
    //app
    run();
    //app
})();
