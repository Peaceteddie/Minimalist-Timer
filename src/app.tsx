import { BrowserWindow } from "electron";
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

  function callSetMinutes(event: React.FormEvent<HTMLInputElement>) {
    const mins = parseInt(event.currentTarget.value);
    setMinutes(mins >= 0 ? mins : 0);
  }

  function callSetSeconds(event: React.FormEvent<HTMLInputElement>) {
    const secs = parseInt(event.currentTarget.value);
    setSeconds(secs >= 0 ? (secs < 60 ? secs : 59) : 0);
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

  const focusElement = (element: HTMLElement) => element.focus();

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
        draggable={true}
        onDrag={(e) => {
          BrowserWindow.getFocusedWindow()?.setPosition(e.screenX, e.screenY);
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
