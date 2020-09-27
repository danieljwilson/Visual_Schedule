var myFont;
var sound;
var previous_event = 0;
var version = "full";

let table;
let sub_table;
let rect_color;

function preload() {
  table = loadTable('assets/schedule.csv', 'csv', 'header'); // table structure: https://docs.google.com/spreadsheets/d/1O-Ixi8d5Gf1nmgDBYvxo0RLJXK1R2jfMXBvSlnuaFuU/edit?usp=sharing
  myFont = loadFont('assets/Hasklig-ExtraLight.otf');
  sound = loadSound('assets/Electronic_Chime.mp4');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textFont(myFont);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(204);

  // GET DAY/TIME
  var date = new Date();
  var s = second();
  var m = minute();                    // Values from 0 - 59
  var h = (24 + date.getUTCHours() - 4) % 24;      // Values from 0 - 23, UTC, CHANGE FOR YOUR OWN TIMEZONE!!
  var d = date.getDay();               // d is an int from 0-6

  // Create subtable based on weekday
  if (d>0 & d<6) {          // is it a weekday
    sub_table = table.findRows(str(d), 'day');
  }

  // IF WEEKDAY
  if (typeof sub_table != "undefined") {
    if (version=="full") { // full schedule version
      for (var i = 0; i<Object.keys(sub_table).length; i = i+1) {
        var task_time_start = sub_table[str(i)].obj.start_hour * 3600 + sub_table[str(i)].obj.start_minute * 60; // in seconds
        var task_time_end = sub_table[str(i)].obj.end_hour * 3600 + sub_table[str(i)].obj.end_minute * 60;       // in seconds
        var current_time = s + 60*(m + 60*h);
        
        // calculate x coords of boxes
        var full_width = 24 * 3600;
        var x1 = task_time_start/full_width;
        var x2 = task_time_end/full_width;

        // COMPLETED ACTIVITIES
        if (current_time > task_time_start && current_time > task_time_end) { // check if over
          // draw rect
          rect_color = color(sub_table[str(i)].obj.color);
          rect_color.setAlpha(210);
          fill(rect_color);
          rect(x1*width, 0, x2*width-x1*width, height);
        }

        // ALL ACTIVITIES
        // draw rect
        rect_color = color(sub_table[str(i)].obj.color);
        rect_color.setAlpha(50);
        fill(rect_color);
        rect(x1*width, 0, x2*width-x1*width, height);

        // add text on mouseover
        if (current_time <= task_time_start || current_time > task_time_end) { //only on inactive activities
          textSize(30);
          fill(0);
          var current_task = sub_table[str(i)].obj.activity;
          // find activity that has cursor
          if (winMouseX > x1*width && winMouseX < x1*width + (x2*width-x1*width)) {
            text(addNewlines(current_task), x1*width + (x2*width-x1*width)/2, height/2);
          }
        }

        // ACTIVE ACTIVITY
        if (current_time >= task_time_start && current_time < task_time_end) { // check which activity is currently happening
          //print('wrong');
          var current_task = str(sub_table[str(i)].obj.activity);
          var duration = task_time_end - task_time_start;
          var elapsed = current_time - task_time_start;
          var current_event = i;

          // PLAY SOUND ON ACTIVITY CHANGE
          if (current_event != previous_event) {
            sound.play();
          }
          previous_event = current_event;

          // SET COLOR
          rect_color = color(sub_table[str(i)].obj.color);
          rect_color.setAlpha(210);
          fill(rect_color);

          // DRAW RECT
          full_width = 24 * 3600;
          x1 = task_time_start/full_width;
          x2 = task_time_end/full_width;
          stroke(0);
          //rect(x1*width, height - (elapsed * height/duration), x2*width-x1*width, height); version that fills "up"
          rect(x1*width, 0, x2*width-x1*width, elapsed * height/duration); // version that fills "down"
          //noStroke();

          // TEXT
          textSize(map(sin(frameCount*0.04), -1, 1, 30, 32));
          fill(0);
          text(addNewlines(current_task), x1*width + (x2*width-x1*width)/2, height/2);
        } 
        // add break rects
        var activity = sub_table[str(i)].obj.activity;
        var act_dur = sub_table[str(i)].obj.duration;
        if (activity == "learn 1" || activity == "learn 2" || activity == "school 1" || activity == "school 2") {
          push();
          noStroke();
          rect_color = color(0);
          rect_color.setAlpha(40);
          fill(rect_color);

          var breaks = Math.floor(act_dur/69);
          for (const x of Array(breaks).keys()) {
            rect(x1*width, ((69*(x+1))/act_dur)*height - (17/act_dur)*height, x2*width-x1*width, (17/act_dur)*height);
          }
          pop();
        }
        // hour markers
        push();
        textSize(12);
        fill(0);
        strokeWeight(0.1);
        for (let step = 1; step < 24; step++) {
          text(str(step), step/24*width, 0.98*height)
        }
        pop();
      }
    }
    // SINGLE VIEW VERSION  
    if (version=="single") {
      for (var i = 0; i<Object.keys(sub_table).length; i = i+1) {
        var task_time_start = sub_table[str(i)].obj.start_hour * 3600 + sub_table[str(i)].obj.start_minute * 60; // in seconds
        var task_time_end = sub_table[str(i)].obj.end_hour * 3600 + sub_table[str(i)].obj.end_minute * 60; // in seconds
        var current_time = s + 60*(m + 60*h);

        var full_width = 24 * 3600;
        var x1 = task_time_start/full_width;
        var x2 = task_time_end/full_width;
        
        // ACTIVE ACTIVITY
        if (current_time >= task_time_start && current_time < task_time_end) {
          var current_task = str(sub_table[str(i)].obj.activity);
          var duration = task_time_end - task_time_start;
          var elapsed = current_time - task_time_start;
          var current_event = i;

          // PLAY SOUND ON ACTIVITY CHANGE
          if (current_event != previous_event) {
            sound.play();
          }
          previous_event = current_event;
          
          // DRAW FULL RECT
          // set color
          stroke(0);
          rect_color = color(sub_table[str(i)].obj.color);
          rect_color.setAlpha(60);
          fill(rect_color);
          rect(0, 0, width, height);
          noStroke();
          // DRAW PROGRESS RECT
          rect_color.setAlpha(200);
          fill(rect_color);
          rect(0, 0, (elapsed/duration) * width, height);

          // TEXT
          textSize(map(sin(frameCount*0.04), -1, 1, 48, 50));
          fill(0);
          text(current_task, width/2, height/2);
          textSize(12);
          text(str(parseInt(elapsed/60))+"\n-\n" + str(parseInt(duration/60)), elapsed/duration*width, 2*height/3);
          // add break rects
          var activity = sub_table[str(i)].obj.activity;
          var act_dur = sub_table[str(i)].obj.duration;
          if (activity == "learn 1" || activity == "learn 2" || activity == "school 1" || activity == "school 2") {
            push();
            noStroke();
            rect_color = color(0);
            rect_color.setAlpha(20);
            fill(rect_color);

            var breaks = Math.floor(act_dur/69);
            for (const x of Array(breaks).keys()) {
              rect(((52*(x+1)+x*17)/act_dur)*width, 0, (17/act_dur)*width, height);
            }
            pop();
          }
        } 
      }
    }
  }

  // IF NOT WEEKDAY
  else {
    //WEEKEND
    fill(15);
    rect(0, 0, width, height);
    fill(230);
    textSize(24);
    text('WEEKEND', width/2, height/2);
  }
  // CHECK FOR ORIENTATION CHANGE
  if (window.DeviceOrientationEvent) { window.addEventListener('orientationchange', function() { location.reload(); }, false); }
}

function touchStarted() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (version != "single") {
      version = "single";
    } else {
      version = "full";
    }
    //var fs = fullscreen();
    //fullscreen(!fs);
    sound.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function addNewlines(str) {
  var result = '';
  while (str.length > 0) {
    result += str.substring(0, 1) + '\n';
    str = str.substring(1);
  }
  return result;
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};
