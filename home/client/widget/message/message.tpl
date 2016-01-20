<h1>量子</h1>
<button id="addwatch">连接量子</button>
<button id="clearwatch">断开量子</button>

{%script%}
$("#addwatch").click(function(){
  $.get("/watch?method=add");
});
$("#clearwatch").click(function(){
  $.get("/watch?method=clear");
});
{%endscript%}
