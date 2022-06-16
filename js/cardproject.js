var db = null;
var var_no = null;
var position = null;


// 데이터베이스 생성 및 오픈
function openDB(){
   db = window.openDatabase('cardDB', '1.0', '카드DB', 5*1024*1024); 
   console.log('1_DB 생성...'); 
} 

// 테이블 생성 트랜잭션 실행
function createTable() {
   db.transaction(function(ps){
   var createSQL = 'create table if not exists card('
   createSQL += 'num integer primary key autoincrement,'
   createSQL += ' company, name, engname, phone, position, team, other)';       
   ps.executeSql(createSQL, [], function(){
      console.log('2_1_테이블생성_sql 실행 성공...');        
	   }, function(){
      console.log('2_1_테이블생성_sql 실행 실패...');            
	   });
	   }, function(){
      console.log('2_2_테이블 생성 트랜잭션 실패...롤백은 자동');
	   }, function(){
      console.log('2_2_테이블 생성 트랜잭션 성공...');
   });
} 

 // 데이터 입력 트랜잭션 실행
function insertCard(){ 
      db.transaction(function(ps){
         var company = $('#inputcompany').val();
         var name = $('#inputname').val();
         var engname = $('#inputengname').val();
         var phone = $('#inputphone').val();
         var position = $('#inputposition').val();
         var team = $('#inputteam').val();
         var other = $('#inputother').val();
         if(name === '') {
            alert('이름을 입력해주세요.');
         } else if(phone === '') {
            alert('전화번호를 입력해주세요');
         } else if(phone.indexOf('-') != -1) {
            alert('전화번호는 - 를 제외하고 입력해주세요.');
         } else {
            var insertSQL = 'insert into card(company, name, engname, phone, position, team, other) values(?, ?, ?, ?, ?, ?, ?)';      
            ps.executeSql(insertSQL, [company, name, engname, phone, position, team, other], function(ps, rs){   
            console.log('3_ 명함 등록...no: ');
            console.log(rs);
            alert($('#inputname').val() + '님이 입력되었습니다');      	       
            $('#inputcompany').val('');
            $('#inputname').val('');
            $('#inputengname').val('');
            $('#inputphone').val('');
            $('#inputposition').val('');
            $('#inputteam').val('');
            $('#inputother').val('');      
            location.reload(true);		   		   	      
            }, function(ps, err){
               alert('DB오류 ' + err.message + err.code);
            }
            );
         }
      });      
}

//전체목록 실행
function totalList(){
	db.transaction(function(ps){
		var selectCntSQL = 'select * from card order by num desc';
		let cnt = 0;
		$('#cardalllist').empty();
		ps.executeSql(selectCntSQL, [], function(ps, rs){ 
			cnt = rs.rows.length;
			console.log("전체 목록 개수: "+cnt);
			console.log("전체 목록");
			console.log(rs);
			if(cnt==0){
				$('#cardalllist').append("<h4>명함 목록이 없습니다.</h4>"); 
			}else{
				var selectSQL = 'select * from card order by num desc';    
				ps.executeSql(selectSQL, [], function(ps, rs){ 
					var len = rs.rows.length; 
					console.log("총튜플 수");
					console.log(rs);
					for (i = 0; i < len; i++) { 
                  $('#cardalllist').append("<li class='cardLi'><a class='cardLiA' href='#dialog_card' onclick='cardDetail("+rs.rows.item(i).num+")' data-rel='dialog'>"+rs.rows.item(i).name+" "+rs.rows.item(i).phone+"</a></li>");
					}
               $('#cardalllist').listview('refresh');
				});
			}
		});
	});
}


// 명함 상제 정보
var dNum, dCompany, dName, dEngname, dPhone, dPosition, dTeam, dOther;
function detailPage(numid) {
   db.transaction(function(ps) {
      $('#detailcompany').empty();
      $('#detailname').empty();
      $('#detailengname').empty();
      $('#detailphone').empty();
      $('#detailposition').empty();
      $('#detailteam').empty();
      $('#detailother').empty();
      var selectSQL = 'select * from card where num=?';
      ps.executeSql(selectSQL, [numid], function(ps, rs) {
         console.log(rs);
         dNum = rs.rows.item(0).num;
         dCompany = rs.rows.item(0).company;
         dName = rs.rows.item(0).name;
         dEngname = rs.rows.item(0).engname;
         dPhone = rs.rows.item(0).phone;
         dPosition = rs.rows.item(0).position;
         dTeam = rs.rows.item(0).team;
         dOther = rs.rows.item(0).other;
         $('#detailcompany').append(dCompany);
         $('#detailname').append(dName);
         $('#detailengname').append(dEngname);
         $('#detailphone').append("<a href='tel:"+dPhone+"'>"+dPhone+'</a>');
         $('#detailposition').append(dPosition);
         $('#detailteam').append(dTeam);
         if(dOther.indexOf('@') != -1){
            $('#detailother').append("<a href='mailto:"+dOther+"'>"+dOther+'</a>');
         } else {
            $('#detailother').append(dOther);
         }
      });
   });
}

// 명함 수정 페이지
function revise() {
   $('#revisenum').val(dNum);
   $('#revisecompany').val(dCompany);
   $('#revisename').val(dName);
   $('#reviseengname').val(dEngname);
   $('#revisephone').val(dPhone);
   $('#reviseposition').val(dPosition);
   $('#reviseteam').val(dTeam);
   $('#reviseother').val(dOther);
}

// 명함 수정
function revisecomplete() {
   db.transaction(function(ps) {
      var revisenum = $('#revisenum').val();
      var revisecompany = $('#revisecompany').val();
      var revisename = $('#revisename').val();
      var reviseengname = $('#reviseengname').val();
      var revisephone = $('#revisephone').val();
      var reviseposition = $('#reviseposition').val();
      var reviseteam = $('#reviseteam').val();
      var reviseother = $('#reviseother').val();
      var updateSQL = 'update card set company = ?, name = ?, engname = ?, phone = ?, position = ?, team = ?, other = ? where num = ?';
      ps.executeSql(updateSQL, [revisecompany, revisename, reviseengname, revisephone, reviseposition, reviseteam, reviseother, revisenum], function(ps, rs) {
         console.log('명함 수정...');
         alert('수정 완료');
         if($('#searchcontent').val() !== '') {
            cardsearch();
         }
      }, function(ps, err) {
         alert('DB오류 ' + err.message + err.code);
      });
   });
}

// 명함 검색
function cardsearch() {
   $('#cardsearchlist').empty();
   var category = $("#selectcategory option:selected").val();
   var searchcontent = $('#searchcontent').val();
   if(searchcontent == '') {
      alert('검색하실 사항을 입력하세요');
   } else {
      db.transaction(function(ps){
         var selectSQL = "select * from card where "+category+" like '%'||?||'%'";
               ps.executeSql(selectSQL, [searchcontent], function(ps, rs){ 
                  var len = rs.rows.length;
                  if(len === 0) {
                     $('#cardsearchlist').append("<b>명함 검색 목록이 없습니다.</b>");
                  }
                  console.log("총튜플 수");
                  console.log(rs);
                  for (i = 0; i < len; i++) { 
                     $('#cardsearchlist').append("<li class='cardLi'><a class='cardLiA' href='#dialog_card' onclick='cardDetail("+rs.rows.item(i).num+")' data-rel='dialog'>"+rs.rows.item(i).name+" "+rs.rows.item(i).phone+"</a></li>");
                  }
                  $('#cardsearchlist').listview('refresh');
               });
         });         
   }
}

// 명함 삭제
function deletecard() {
   var result = confirm('정말 삭제하시겠습니까?');
   if(result) {
      db.transaction(function(ps) {
         var deleteSQL = 'delete from card where num = ?';
         ps.executeSql(deleteSQL, [dNum], function(ps, rs) {
            console.log('명함 삭제...');
            console.log(rs);
            alert('삭제되었습니다.');
            cardsearch();
            totalList();
            $('#dialog_card').dialog('close');
         })
      });
   } else {

   }
}