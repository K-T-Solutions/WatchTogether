import { useRef, useEffect } from "react";
import kaifStarship from "../assets/kaifStarship.png";
import pinkStarship from "../assets/pinkStarship.png";
import purpleStarship from "../assets/purpleStarship.png";

const NUM_SHIPS = 9;
const minY = 60;
const maxY = 250; // высота области, где летают кораблики
const minSize = 32;
const maxSize = 64;

const shipImages = [kaifStarship, pinkStarship, purpleStarship];

function getLanes(num, min, max, minSize, maxSize) {
  // Чтобы кораблик не выходил за пределы области, учитываем максимальный размер
  const areaMin = min + maxSize / 2;
  const areaMax = max - maxSize / 2;
  if (num === 1) return [min + (max - min) / 2];
  const step = (areaMax - areaMin) / (num - 1);
  return Array.from({ length: num }, (_, i) => areaMin + i * step);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FlyingShips() {
  const canvasRef = useRef(null);
  const ships = useRef([]);
  const imagesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Получаем дорожки (laneY)
    const lanes = getLanes(NUM_SHIPS, minY, maxY, minSize, maxSize);

    // Загружаем все картинки корабликов
    const loadedImages = shipImages.map((src) => {
      const img = new window.Image();
      img.src = src;
      return img;
    });
    imagesRef.current = loadedImages;

    // Массив типов корабликов: по 3 каждого
    const shipTypes = [0, 0, 0, 1, 1, 1, 2, 2, 2];

    // Перемешаем порядок корабликов для разнообразия
    for (let i = shipTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shipTypes[i], shipTypes[j]] = [shipTypes[j], shipTypes[i]];
    }

    // Инициализация корабликов: каждый на своей дорожке
    ships.current = Array.from({ length: NUM_SHIPS }).map((_, i) => {
      const size = random(minSize, maxSize);
      // Случайное направление: 1 (вправо) или -1 (влево)
      const direction = Math.random() < 0.5 ? 1 : -1;
      // Начальная позиция x зависит от направления
      const x = direction === 1 ? random(0, width) : random(0, width);
      return {
        x,
        y: lanes[i],
        speed: random(0.2, 0.6) * direction,
        size,
        lane: i,
        type: shipTypes[i], // 0, 1 или 2
        direction, // 1 — вправо, -1 — влево
      };
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      ships.current.forEach((ship) => {
        ship.x += ship.speed;
        // Если корабль вышел за пределы экрана, возвращаем его с другой стороны
        if (ship.direction === 1 && ship.x > width + 60) {
          ship.x = -60;
        } else if (ship.direction === -1 && ship.x < -60) {
          ship.x = width + 60;
        }
        ctx.save();
        ctx.globalAlpha = 0.7;
        const img = imagesRef.current[ship.type];
        // Для движения влево отражаем картинку по горизонтали
        if (ship.direction === -1) {
          ctx.translate(ship.x + ship.size, ship.y - ship.size / 2 - scrollY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, ship.size, ship.size);
        } else {
          ctx.drawImage(
            img,
            ship.x,
            ship.y - ship.size / 2 - scrollY,
            ship.size,
            ship.size
          );
        }
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }

    // Дождёмся загрузки всех картинок
    let loadedCount = 0;
    loadedImages.forEach((img) => {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === loadedImages.length) {
          draw();
        }
      };
    });

    // Обработка ресайза
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 3,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
} 