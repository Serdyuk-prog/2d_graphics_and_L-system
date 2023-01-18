function processImage(imgInfo) {
    const width = imgInfo.width;
    const height = imgInfo.height;
    // бинарный массив с данными каждого пикселя
    const src = new Uint32Array(imgInfo.data.buffer);

    // Отобразить измененную картинку и гистограмму
    processCanvas("canvasResult", width, height, (dst) => {
        // получение значений сдвига и расширения гистограммы
        let brightness = parseInt(
            document.querySelector("#rangeBrightness").value
        );
        let contrast =
            parseInt(document.querySelector("#rangeContrast").value) / 255;

        // вычисляем среднее значение серого для изображения
        let avgGray = 0;
        for (let i = 0; i < dst.length; i++) {
            let r = src[i] & 0xff;
            let g = (src[i] >> 8) & 0xff;
            let b = (src[i] >> 16) & 0xff;
            avgGray += r * 0.2126 + g * 0.7152 + b * 0.0722;
        }
        avgGray /= dst.length;

        for (let i = 0; i < dst.length; i++) {
            let r = src[i] & 0xff;
            let g = (src[i] >> 8) & 0xff;
            let b = (src[i] >> 16) & 0xff;

            // вычисление нового контраста
            r += (r - avgGray) * contrast;
            g += (g - avgGray) * contrast;
            b += (b - avgGray) * contrast;

            //  Новое значения яркости
            r += brightness;
            g += brightness;
            b += brightness;
            // Обработка выхода за пределы
            if (r > 255) r = 255;
            else if (r < 0) r = 0;
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
            if (b > 255) b = 255;
            else if (b < 0) b = 0;

            // записываем новый цвет пикселя
            dst[i] = (src[i] & 0xff000000) | (b << 16) | (g << 8) | r;
        }

        // Гистограмма
        // Заполним массив нулями и подсчитаем количество
        // вхождений каждого значения яркости (во всех каналах)
        let histBrightness = new Array(256).fill(0);
        for (let i = 0; i < dst.length; i++) {
            let r = dst[i] & 0xff;
            let g = (dst[i] >> 8) & 0xff;
            let b = (dst[i] >> 16) & 0xff;
            histBrightness[r]++;
            histBrightness[g]++;
            histBrightness[b]++;
        }

        // находим максимальное значение в гистограмме
        let maxBrightness = 0;
        for (let i = 1; i < 256; i++) {
            if (maxBrightness < histBrightness[i]) {
                maxBrightness = histBrightness[i];
            }
        }

        // Рисуем график
        const canvas = document.getElementById("canvasHistogram");
        const ctx = canvas.getContext("2d");
        let dx = canvas.width / 256;
        let dy = canvas.height / maxBrightness;
        ctx.lineWidth = dx;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 256; i++) {
            let x = i * dx;
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(x, canvas.height);
            ctx.lineTo(x, canvas.height - histBrightness[i] * dy);
            ctx.closePath();
            ctx.stroke();
        }
    });
}

// Получение данных о изображении (в том числе цвета каждого пикселя)
function getImageData(el) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = document.getElementById(el);
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height);
}

function processCanvas(canvasId, width, height, func) {
    const canvas = document.getElementById(canvasId);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const outImg = ctx.createImageData(width, height);
    const dst = new Uint32Array(outImg.data.buffer);
    func(dst);
    ctx.putImageData(outImg, 0, 0);
}

// Обработка загрузки кастомного изображения
document.getElementById("input").addEventListener("change", function () {
    if (this.files && this.files[0]) {
        var img = document.getElementById("img");
        img.src = URL.createObjectURL(this.files[0]);
        img.onload = update;
    }
});

// Обработка ползунков
document.querySelectorAll(".range-input").forEach((item) => {
    item.addEventListener("input", update);
});

// Обновление значения ползунков и содержания холста
function update(e) {
    document.querySelector("#valueBrightness").innerText =
        document.querySelector("#rangeBrightness").value;
    document.querySelector("#valueContrast").innerText =
        document.querySelector("#rangeContrast").value;
    processImage(getImageData("img"));
}
const img = document.getElementById("img");
img.onload = function () {
    update();
};
