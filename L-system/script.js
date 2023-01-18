class Rules {
    constructor(S, F, X, Y) {
        this.S = S;
        this.F = F;
        this.X = X;
        this.Y = Y;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const commands = "Fb+-[]";

// params
let startPoint = new Point(0, 0);
let line_length = 5;
let curr_point = null;
let angle_change = 0;
let cur_gen = null;
let S = "";
let F = "";
let X = "";
let Y = "";
let new_r = null;

// variables
let curr_angle = 0;
let curr_buffer = [];
let gen_num = 0;

// let new_r = new Rules(S, F, null, null, 20);

function new_gen(data, rules) {
    let result = "";
    for (let char of data) {
        if ("FXY".includes(char)) {
            result = result + rules[char];
        } else {
            result = result + char;
        }
    }
    return result;
}

function toRadian(degree) {
    return (degree * Math.PI) / 180;
}

function drawLine() {
    const x1 = curr_point.x;
    const y1 = curr_point.y;
    const r = line_length;
    const theta = toRadian(curr_angle); // strait up
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
    ctx.stroke();
    curr_point = new Point(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
}

function movePoint() {
    const x1 = curr_point.x;
    const y1 = curr_point.y;
    const r = line_length;
    const theta = toRadian(curr_angle);
    curr_point = new Point(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
}

function rotate(angle) {
    curr_angle = curr_angle + angle;
}

function buffer() {
    curr_buffer.push([curr_point, curr_angle]);
}

function clearBuffer() {
    curr_buffer = [];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    curr_point = startPoint;
    clearBuffer();
}

function draw_main(commands) {
    clearCanvas();
    console.log(commands);
    for (let command of commands) {
        if (command == "F") {
            drawLine();
        }
        if (command == "b") {
            movePoint();
        }
        if (command == "+") {
            rotate(angle_change);
        }
        if (command == "-") {
            rotate(angle_change * -1);
        }
        if (command == "[") {
            buffer();
        }
        if (command == "]") {
            let buffer = curr_buffer.pop();
            curr_point = buffer[0];
            curr_angle = buffer[1];
        }
    }
}

function draw_gen() {
    draw_main(cur_gen);
    cur_gen = new_gen(cur_gen, new_r);
    gen_num++;
}

const draw_button = document.querySelector("#draw-button");
draw_button.addEventListener("click", () => {
    // printState()
    if (gen_num > 5) {
        alert("Too complex!");
    } else {
        draw_gen();
    }
});

const s_input = document.querySelector("#data-s");
const f_input = document.querySelector("#data-f");
const x_input = document.querySelector("#data-x");
const y_input = document.querySelector("#data-y");
const a_input = document.querySelector("#data-a");
const stroke_input = document.querySelector("#data-stroke");
const x0_input = document.querySelector("#data-x0");
const y0_input = document.querySelector("#data-y0");

function setDefaults() {
    s_input.value = "F";
    f_input.value = "F+F-F-F+F";
    x_input.value = null;
    y_input.value = null;
    a_input.value = 90;
    stroke_input.value = 10;
    x0_input.value = 0;
    y0_input.value = 0;
}

function getParams() {
    clearCanvas();
    gen_num = 0;
    let x = parseFloat(x0_input.value);
    let y = parseFloat(y0_input.value);
    startPoint = new Point(x, y);
    line_length = parseFloat(stroke_input.value);
    curr_point = startPoint;
    angle_change = parseFloat(a_input.value);
    S = s_input.value;
    F = f_input.value;
    X = x_input.value;
    Y = y_input.value;
    cur_gen = S;
    new_r = new Rules(S, F, X, Y);
}

function printState() {
    console.log(S, F, X, Y);
    console.log(line_length, curr_point, angle_change);
    console.log(cur_gen);
    console.log(gen_num);
    console.log(new_r.S, new_r.F, new_r.X, new_r.Y);
}

setDefaults();
getParams();

const inputs = document.querySelectorAll("input");
inputs.forEach((el) => {
    el.addEventListener("input", () => {
        getParams();
    });
});

function preset2() {
    s_input.value = "F++F++F";
    f_input.value = "F-F++F-F";
    x_input.value = null;
    y_input.value = null;
    a_input.value = 60;
    stroke_input.value = 5;
    x0_input.value = 250;
    y0_input.value = 250;
}

function preset3() {
    s_input.value = "X";
    f_input.value = "F";
    x_input.value = "-YF+XFX+FY-";
    y_input.value = "+XF-YFY-FX+";
    a_input.value = 90;
    stroke_input.value = 10;
    x0_input.value = 0;
    y0_input.value = 500;
}

function preset4() {
    s_input.value = "F";
    f_input.value = "F[+F]F[-F][F]";
    x_input.value = null;
    y_input.value = null;
    a_input.value = 20;
    stroke_input.value = 10;
    x0_input.value = 0;
    y0_input.value = 250;
}

document.querySelector("#preset-1").addEventListener("click", () => {
    setDefaults();
    getParams();
});

document.querySelector("#preset-2").addEventListener("click", () => {
    preset2();
    getParams();
});

document.querySelector("#preset-3").addEventListener("click", () => {
    preset3();
    getParams();
});

document.querySelector("#preset-4").addEventListener("click", () => {
    preset4();
    getParams();
});

