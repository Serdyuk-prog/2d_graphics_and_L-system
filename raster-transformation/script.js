class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const mpColor = "#E63946";

function drawPoint(point, context, color) {
    radius = 7;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "black";
    context.lineWidth = 0;
    context.stroke();
}

function clearCanvas(context, canvas, base) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (base) {
        mountImage(base, context, canvas);
    }
}

function mountImage(image, context, canvas) {
    const SIZE = 350;
    let width = image.width;
    let height = image.height;

    if (width > SIZE || height > SIZE) {
        if (width > height) {
            height = (height / width) * SIZE;
            width = SIZE;
        } else {
            width = (width / height) * SIZE;
            height = SIZE;
        }
    }

    canvas.width = width;
    canvas.height = height;

    canvas.width = canvas.width;
    canvas.height = canvas.height;

    context.drawImage(image, 0, 0, width, height);
}

// Вычисление матрицы преобразования
function getTransformMatrix(base_points, res_points) {
    const base = [
        [base_points[0].x, base_points[1].x, base_points[2].x],
        [base_points[0].y, base_points[1].y, base_points[2].y],
        [1, 1, 1],
    ];

    const res = [
        [res_points[0].x, res_points[1].x, res_points[2].x],
        [res_points[0].y, res_points[1].y, res_points[2].y],
        [1, 1, 1],
    ];

    let result = math.multiply(res, math.inv(base));
    result[2][0] = 0;
    result[2][1] = 0;
    result[2][2] = 1;
    return result;
}

function getStyle(p) {
    return "rgba(" + p[0] + "," + p[1] + "," + p[2] + "," + p[3] / 255 + ")";
}

// Простой
function drawResultSimpl(transformMatrix, canvas, base_ctx, res_ctx) {
    // обратная матрица
    let newMatrix = math.inv(transformMatrix);
    const width = canvas.width;
    const height = canvas.height;

    // для каждого пикселя нового изображения находим соответствующий старого
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            let coord = math.multiply(newMatrix, [[x], [y], [1]]);
            let new_x = coord[0][0];
            let new_y = coord[1][0];
            if (new_x > 0 && new_y > 0 && new_x < width && new_y < height) {
                let p = base_ctx.getImageData(new_x, new_y, 1, 1).data;
                res_ctx.fillStyle = getStyle(p);
                res_ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// Билинейная
function drawResultBilinear(transformMatrix, canvas, base_ctx, res_ctx) {
    // обратная матрица
    let newMatrix = math.inv(transformMatrix);
    const width = canvas.width;
    const height = canvas.height;

    // для каждого пикселя нового изображения находим соответствующий старого
    // и получаем цвет усредненный с соседними пикселями
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            let coord = math.multiply(newMatrix, [[x], [y], [1]]);
            let new_x = coord[0][0];
            let new_y = coord[1][0];
            let x_f = Math.floor(new_x),
                x_c = Math.ceil(new_x),
                y_f = Math.floor(new_y),
                y_c = Math.ceil(new_y);
            if (x_f > 0 && y_f > 0 && x_c < width && y_c < height) {
                let color1 = base_ctx.getImageData(x_f, y_f, 1, 1).data,
                    color2 = base_ctx.getImageData(x_c, y_f, 1, 1).data,
                    color3 = base_ctx.getImageData(x_f, y_c, 1, 1).data,
                    color4 = base_ctx.getImageData(x_c, y_c, 1, 1).data;
                let p_color = [0, 0, 0, 255];
                for (let i = 0; i < 3; i++) {
                    p_color[i] =
                        (color1[i] * (x_c - new_x) +
                            color2[i] * (new_x - x_f)) *
                            (y_c - new_y) +
                        (color3[i] * (x_c - new_x) +
                            color4[i] * (new_x - x_f)) *
                            (new_y - y_f);
                }
                res_ctx.fillStyle = getStyle(p_color);
                res_ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// Проверка на приближение
function isZoom(transformMatrix) {
    return (
        (Math.abs(transformMatrix[0][0]) > 1 &&
            Math.abs(transformMatrix[1][1]) > 1) ||
        (Math.abs(transformMatrix[0][1]) > 1 &&
            Math.abs(transformMatrix[1][0]) > 1)
    );
}

window.onload = function () {
    const base_canvas = document.querySelector("#base");
    const base_ctx = base_canvas.getContext("2d");
    const base_temp_ctx = base_canvas.getContext("2d");
    const res_canvas = document.querySelector("#result");
    const res_ctx = res_canvas.getContext("2d");
    const res_temp_ctx = res_canvas.getContext("2d");

    let points_base = [];
    let points_res = [];

    const image = new Image();
    image.src = "./imgs/cat_2.jpg";
    // base_image.src = "./imgs/cat.png";

    image.onload = function () {
        mountImage(image, base_ctx, base_canvas);
        res_canvas.width = base_canvas.width;
        res_canvas.height = base_canvas.height;
    };

    base_canvas.addEventListener("mousedown", function (event) {
        const curPoint = new Point(event.offsetX, event.offsetY);
        drawPoint(curPoint, base_temp_ctx, mpColor);
        points_base.push(curPoint);

        if (points_base.length == 3) {
            console.log("Yep 1!");
        }

        if (points_base.length == 4) {
            points_base = [];
            clearCanvas(base_ctx, base_canvas, image);
        }
    });

    res_canvas.addEventListener("mousedown", function (event) {
        const curPoint = new Point(event.offsetX, event.offsetY);
        drawPoint(curPoint, res_temp_ctx, mpColor);
        points_res.push(curPoint);

        // Если есть все 6 точек вычисляем матрице преобразования и рисуем результат
        if (points_res.length == 3) {
            console.log("Yep 2!");
            if (points_base.length == 3) {
                let transformMatrix = getTransformMatrix(
                    points_base,
                    points_res
                );
                clearCanvas(base_ctx, base_canvas, image);
                clearCanvas(res_ctx, res_canvas, null);
                // Если приближение то билинейная если нет, то простой алгоритм
                if (isZoom(transformMatrix)) {
                    console.log("zoom");
                    drawResultBilinear(
                        transformMatrix,
                        res_canvas,
                        base_ctx,
                        res_ctx
                    );
                    // drawResultSimpl(
                    //     transformMatrix,
                    //     res_canvas,
                    //     base_ctx,
                    //     res_ctx
                    // );
                } else {
                    drawResultSimpl(
                        transformMatrix,
                        res_canvas,
                        base_ctx,
                        res_ctx
                    );
                }
            }
        }

        if (points_res.length == 4) {
            points_res = [];
            clearCanvas(res_ctx, res_canvas, null);
        }
    });

    const file_input = document.querySelector("#formFile");

    file_input.addEventListener("input", function () {
        image.src = URL.createObjectURL(file_input.files[0]);
        image.onload = function () {
            mountImage(image, base_ctx, base_canvas);
            res_canvas.width = base_canvas.width;
            res_canvas.height = base_canvas.height;
        };
    });
};
