class Rules {
    constructor(S, F, X, Y, a) {
        this.S = S;
        this.F = F;
        this.X = X;
        this.Y = Y;
        this.a = a;
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const commands = "F"

const startPoint = new Point(250, 250);
let curr_angle = 270;
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const line_length = 50;
let curr_buffer = null;
let curr_point = startPoint;

let S = "F";
let F = "F+F−F−F+F";

let new_r = new Rules(S, F, null, null, 20);

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

function drawLine(point) {
    const x1 = point.x;
    const y1 = point.y;
    const r = line_length;
    const theta = toRadian(curr_angle); // strait up
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
    ctx.stroke();
    return new Point(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
}

function rotate(angle) {
    curr_angle = curr_angle + angle;
}

function buffer() {
    curr_buffer = curr_point;
}

function clearBuffer() {
    curr_buffer = null;
}

function draw_main(commands){
    for(let command of commands){

    }
}


console.log(new_gen("F+F−F−F+F", new_r));

// x1 = 250;
// y1 = 250;
// r = 50;
// theta = toRadian(270); // strait up
// ctx.moveTo(x1, y1);
// ctx.lineTo(x1 + r * Math.cos(theta), y1 + r * Math.sin(theta));
// ctx.stroke();
let point = startPoint;
point = drawLine(point);
rotate(90);
point = drawLine(point);
rotate(90);
point = drawLine(point);
rotate(90);
point = drawLine(point);
