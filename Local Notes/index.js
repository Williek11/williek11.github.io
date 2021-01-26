document.addEventListener("contextmenu", function (e) { e.preventDefault(); }, false);

//////////////
// Function //
//////////////

(function () {
    const E = "addEventListener"
    var db;
    
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    var request = window.indexedDB.open("db", 3);
        request[E]("error",function(e){console.log("bruh")})
        request[E]("upgradeneeded",function(e){
            db = e.target.result;

            db.createObjectStore("cards", {keyPath:"id"})
        })
        request[E]("success",function(e){
            db = e.target.result;
            
            onDBReadyState()
        })

    var body = document.body;
    var getClass = function (c, n) { return document.getElementsByClassName(c)[n] }
    var getId = function (id) { return document.getElementById(id) }
    var cardsInfo = [];

    ///////////
    // Cards //
    ///////////

    var cards = [];

    function onDBReadyState () {
        var transaction = db.transaction("cards").objectStore("cards").getAll()
        transaction.onsuccess = function () {cards = transaction.result;startUp()}
    }

    function startUp () {

        var onresize = function(){};

        // Frag
        var frag = document.createElement("div");
        var newCard = function (card, made) {
            var nC = document.createElement("div"); nC.className = "card"
            var cCaA = function (c, txt) { var t = document.createElement("div"); t.className = c; t.innerText = txt; nC.appendChild(t) }
            cCaA("card_title", card.title); cCaA("card_date", made.day + ' / ' + made.month + ' / ' + made.year); cCaA("card_txt", card.content); cCaA("card_edit button", "EDIT"); cCaA("card_erase button", "ERASE")
            frag.appendChild(nC)
        }
        var l = cards.length;

        for (var i = 0; i < l; i++) { newCard(cards[i], cards[i].made) }
        var addCard = document.createElement("div");
        addCard.id = "add_card";
        addCard.className = "card"
        addCard.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="position:relative;left:100px" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="100" height="400"><defs><path d="M640 420L420 420L420 640L220 640L220 420L0 420L0 220L220 220L220 0L420 0L420 220L640 220L640 220L640 420Z" id="b54OFTMGRM"/></defs><g><g><g><use xlink:href="#b54OFTMGRM" opacity="1" fill="#0003" /></g></g></g></svg>`
        frag.appendChild(addCard);
        body.appendChild(frag);

        //////////////////
        // Black Screen //
        //////////////////

        var bS = getId("black_screen")
        var bSS = bS.style;

        var popUp = function (name) {
            getId(name).style = "opacity:1;pointer-events:auto";
            bSS.opacity = "1"; bSS.pointerEvents = "auto";
        }

        getId("settings_button").addEventListener("click", function () { popUp("settings") })
        getId("contact_button").addEventListener("click", function () { popUp("contact") })

        var close_popUp = function (name) {
            getId(name).style = "opacity:0;pointer-events:none";
            bSS.opacity = "0"; bSS.pointerEvents = "none";
        }

        getId("settings_back").addEventListener("click", function () { close_popUp("settings") })
        getId("contact_back").addEventListener("click", function () { close_popUp("contact") })

        ///////////////
        // Edit Card //
        ///////////////

        var edit_card = function (i) {
            var cI = cardsInfo[i];
            cI[3].contentEditable = "true"; cI[5].contentEditable = "true";
            cI[3].className = "card_title card_title_expanded"; cI[5].className = "card_txt card_txt_expanded"

            cI[6].innerHTML = "DONE";

            bSS.opacity = "1"; bSS.pointerEvents = "auto";

            getClass('card', i).className = "card expanded"
        }

        var done_card_edit = function (i) {
            var cI = cardsInfo[i];
            cards[i].title = cI[3].innerHTML;
            cards[i].content = cI[5].innerHTML;
            console.log(cards)
            cI[3].contentEditable = "false"; cI[5].contentEditable = "false";
            cI[3].className = "card_title"; cI[5].className = "card_txt"

            cI[6].innerHTML = "EDIT";

            bSS.opacity = "0"; bSS.pointerEvents = "none";

            getClass('card', i).className = "card"

            var request = db.transaction("cards").objectStore("cards").get(i);
            request[E]("error",function(e){console.log(e)})
            request[E]("success",function(e){
                var data = e.target.result;

                data.title = cards[i].title;
                data.content = cards[i].content

                db.transaction(["cards"], "readwrite").objectStore("cards").put(data);
            })

            /* db.collection("cards").doc({ id: i }).update({ title: cards[i].title, content: cards[i].content }) */
        }

        function notesPerLine() {
            return Math.floor(window.innerWidth / 320);
        }

        function calcLine(i) {
            return Math.floor(i / notesPerLine())
        }
        function calcColumn(i) {
            while (i > notesPerLine()) { i = i - notesPerLine() }
            if (i === 0) { return 0 } else { return i - 1 }
        }

        onresize = function () {
            addCard.style.left = `${20 + calcColumn(l + 1) * (300 + 20)}px`;
            addCard.style.top = `${110 + calcLine(l) * (400 + 50)}px`;

            for (var i = 0; i < l; i++) {
                card = getClass("card", i);
                cardsInfo[i] = [
                    20 + calcColumn(i + 1) * (300 + 20),
                    110 + calcLine(i) * (400 + 50),
                    card.style,
                    getClass("card_title", i),
                    getClass("card_date", i),
                    getClass("card_txt", i),
                    getClass("card_edit", i)
                ]
            }

            getId("bottom-footer").style = `top:${20 + (calcLine(l)) * 450 + 400 + 40 + 100}px;display:block`;
            for (var i = 0; i < l; i++) {
                var card = getClass("card", i);
                card.setAttribute("data-id", i);
                card.setAttribute("data-line", calcColumn(i + 1));
                card.setAttribute("data-column", calcLine(i + 1) - 1);
                card.style.left = cardsInfo[i][0] + "px";
                card.style.top = cardsInfo[i][1] + "px"
            }
        }

        onresize()

        var cardsUpdate = function() {
            while (frag.lastElementChild) { frag.removeChild(frag.lastElementChild); }
            for (var i = 0; i < l; i++) { newCard(cards[i], cards[i].made) }
            addCard.id = "add_card";
            addCard.className = "card"
            addCard.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="position:relative;left:100px" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" width="100" height="400"><defs><path d="M640 420L420 420L420 640L220 640L220 420L0 420L0 220L220 220L220 0L420 0L420 220L640 220L640 220L640 420Z" id="b54OFTMGRM"/></defs><g><g><g><use xlink:href="#b54OFTMGRM" opacity="1" fill="#0003" /></g></g></g></svg>`
            frag.appendChild(addCard);
            for (var i = 0; i < l; i++) {
                const self = i; getClass("card_edit", self).addEventListener("click", function () {
                    if (getClass("card_edit", self).innerHTML === "EDIT") { edit_card(self) }
                    else { done_card_edit(self) }
                })
                getClass("card_erase", self).addEventListener("click", function () {
                    const len = l;
                    l--;
                    cards.splice(self, 1);
                    for (var j = self;j < len - 1;j++) {
                        cards[j].id-=1
                    }
                    var objStore = db.transaction(["cards"], "readwrite").objectStore("cards");
                    objStore.delete(len - 1);
                    for (var j = 0;j < len - 1;j++) {
                        objStore.put(cards[j]);
                    }
    
                    cardsUpdate();
                })
            }
            onresize()
        }

        var newCardEvent = function () {
            var dt = new Date();

            cards[l] = {
                id: l,
                title: "New",
                made: { day: dt.getDate() + 1, month: dt.getMonth() + 1, year: dt.getFullYear() },
                content: "Empty :c",
            }

            db.transaction(["cards"], "readwrite").objectStore("cards").add({
                id: l,
                title: "New",
                made: { day: dt.getDate() + 1, month: dt.getMonth() + 1, year: dt.getFullYear() },
                content: "Empty :c",
            })

            setTimeout(()=>{l++;cardsUpdate();},5)
        };

        for (var i = 0; i < l; i++) {
            const self = i; getClass("card_edit", self).addEventListener("click", function () {
                if (getClass("card_edit", self).innerHTML === "EDIT") { edit_card(self) }
                else { done_card_edit(self) }
            })
            getClass("card_erase", self).addEventListener("click", function () {
                const len = l;
                l--;
                cards.splice(self, 1);
                for (var j = self;j < len - 1;j++) {
                    cards[j].id-=1
                }
                var objStore = db.transaction(["cards"], "readwrite").objectStore("cards");
                objStore.delete(len - 1);
                for (var j = 0;j < len - 1;j++) {
                    objStore.put(cards[j]);
                }

                cardsUpdate();
            })
        }

        addCard.addEventListener("click", newCardEvent)

        //////////////
        // Settings //
        //////////////

        var settings = {
            "dark_mode": [, 0, function () {
                getId("dark-mode").innerHTML = `

body,html{background: #131315}
#top-footer{background: #343435;box-shadow: 0 10px #232325}
#bottom-footer{color:#ddd;text-align:center;background:#161719;position:absolute;width:100%}
#title{color:#ddd}
#title::selection,.button::selection {background: #fff6;color: #000;}
.card, #settings, #contact{text-shadow: 0 1px 0 #fff2;background:#343435;box-shadow: 0 10px #232325}
.card_title{color:#ccc}
.card_date{color:#aaa;border-bottom:2px #ccc solid}
.card_txt, .txt{color:#ddd;}
.button{background:#ccc;color: #333;box-shadow: 0 2px 0 #fff4}
.card_title_expanded{background: #0002}
.card_txt_expanded{background: #0002}
a{color:#ddd;display:block}
.header {border-bottom:5px solid;color:#eee;}

.switch {background: #999;width: 60px;height: 25px;margin: 20px;cursor:pointer}
.ball {background: #bbb;position: relative;bottom: 5px;width: 35px;height: 35px;right: 5px;border-radius: 5px;}
.switch.active {background:#64a75c;}
.ball.active {background:#90f784;left: 30px;}

`}, function () { getId("dark-mode").innerHTML = `` }],
            "top_footer_fixed": [, 1, function () { getId("top-footer").style.position = "fixed" }, function () { getId("top-footer").style.position = "absolute" }],
            "dynamic_card_changing": [, 2, function () { window.addEventListener("resize", onresize) }, function () { window.removeEventListener("resize", onresize) }]
        }

        var settingsStr = localStorage.settings;
        if (!settingsStr || settingsStr.length != 3) {
            settingsStr = "fff";
            localStorage.settings = settingsStr;
        }

        function updateSettings() {
            settingsStr = settings.dark_mode[0] + settings.top_footer_fixed[0] + settings.dynamic_card_changing[0];
            localStorage.settings = settingsStr;
        }

        var count = 0;

        for (var key in settings) {
            const s = key;
            const ball = getClass("ball", settings[s][1]);
            const swit = getClass("switch", settings[s][1]);

            settings[s][0] = localStorage.settings[count]

            count++

            if (settings[key][0] === "t") {
                ball.className = "ball active"
                swit.className = "switch active"
                settings[s][2]()
            }

            getClass("switch", settings[s][1]).addEventListener("click", function () {
                if (settings[s][0] === "f") {
                    ball.className = "ball active"
                    swit.className = "switch active"
                    settings[s][0] = "t"
                    settings[s][2]()
                    updateSettings()
                }
                else {
                    ball.className = "ball"
                    swit.className = "switch"
                    settings[s][0] = "f"
                    settings[s][3]()
                    updateSettings()
                }
            }
            )
        }

    }

}())