import { ipcRenderer } from "electron";
import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

// create root through react and render main
createRoot(document.getElementById("root")).render(<Main />);

export default function Main() {
  const minElement = useRef<HTMLInputElement>(null);
  const secElement = useRef<HTMLInputElement>(null);

  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  const timer = useRef<NodeJS.Timeout>();

  const fontSize = (value: number) =>
    Math.min(80 / 2, 80 / value.toString().length);

  function handleTimerKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (!isRunning) {
        StartTimer(minutes, seconds);
        setIsRunning(true);
      } else {
        clearInterval(timer.current);
        setIsRunning(false);
      }
    }
  }

  const handleMouseMove = throttle(
    (event: React.FormEvent<HTMLInputElement> | MouseEvent) => {
      if (dragging) {
        const e = event as MouseEvent;
        const x = e.screenX - initialPosition.x;
        const y = e.screenY - initialPosition.y;
        ipcRenderer.send("move-window", { x, y });
        setInitialPosition({ x: e.screenX, y: e.screenY });
      }
    },
    100
  );

  function callSetSeconds(event: React.FormEvent<HTMLInputElement>) {
    const secs = parseInt(event.currentTarget.value);
    setSeconds(secs >= 0 ? (secs < 60 ? secs : 59) : 0);
  }

  function callSetMinutes(event: React.FormEvent<HTMLInputElement>) {
    const mins = parseInt(event.currentTarget.value);
    setMinutes(mins >= 0 ? mins : 0);
  }

  function StartTimer(minutes: number, seconds: number) {
    let totalSeconds = minutes * 60 + seconds;
    timer.current = setInterval(() => {
      totalSeconds--;
      setMinutes(Math.floor(totalSeconds / 60));
      setSeconds(totalSeconds % 60);
      if (totalSeconds <= 0) {
        clearInterval(timer.current);
      }
    }, 1000);
  }

  function throttle(
    func: {
      (event: React.FormEvent<HTMLInputElement>): void;
      (event: MouseEvent): void;
    },
    delay: number
  ) {
    let lastCall = 0;
    return function (...args: Parameters<typeof func>) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return func(...(args as Parameters<typeof func>));
    };
  }

  const focusElement = (element: HTMLElement) => element.focus();

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (minElement.current)
      minElement.current.addEventListener("mouseover", () =>
        focusElement(minElement.current)
      );

    return () => {
      minElement.current?.removeEventListener("mouseover", () =>
        focusElement(minElement.current)
      );
    };
  }, [minElement]);

  useEffect(() => {
    if (secElement.current)
      secElement.current.addEventListener("mouseover", () =>
        focusElement(secElement.current)
      );

    return () => {
      secElement.current?.removeEventListener("mouseover", () =>
        focusElement(secElement.current)
      );
    };
  }, [secElement]);

  useEffect(() => {
    minElement.current.style.fontSize = `min(${fontSize(minutes)}vw, 100vh)`;
    secElement.current.style.fontSize = `min(${fontSize(seconds)}vw, 100vh)`;
  }, [minutes, seconds]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        id="drag-handle"
        onMouseDown={(e) => {
          setDragging(true);
          setInitialPosition({ x: e.screenX, y: e.screenY });
        }}
      ></div>
      <div className="center row">
        <input
          id="minutes"
          name="minutes"
          ref={minElement}
          type="number"
          draggable={false}
          onDrag={(e) => e.preventDefault()}
          onDragCapture={(e) => e.preventDefault()}
          onDragEnd={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDragExit={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onInput={(e) => callSetMinutes(e)}
          onKeyUp={(e) => handleTimerKeyPress(e)}
          style={{ textAlign: "right" }}
          value={minutes.toString().padStart(2, "0")}
        ></input>
        <div className="center fourty">:</div>
        <input
          id="seconds"
          name="seconds"
          ref={secElement}
          type="number"
          className="center fourty"
          onInput={(e) => callSetSeconds(e)}
          onKeyUp={(e) => handleTimerKeyPress(e)}
          style={{ textAlign: "left" }}
          value={seconds.toString().padStart(2, "0")}
        ></input>
      </div>
    </div>
  );
}
