import React from "react";
import { MdPauseCircle, MdPlayCircle, MdSkipNext } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import Color from "color";

import app from "@/app";
import utils from "@/utils";
import { ColorFormat } from "@/types";
import services from "@/app/services";
import Button from "@/components/Button";
import { Settings } from "@/bindings/Settings";
import { Intent } from "@/bindings/Intent";
import { Theme } from "@/bindings/Theme";
import useTimer from "./useTimer";
import { CountdownCircleTimer } from "./CountdownCircleTimer";

interface Props {
  activeIntent?: Intent;
  settings: Settings;
  theme: Theme;
}

const Timer: React.FC<Props> = (props) => {
  const timer = useTimer(props.settings);

  const store = app.useStore();

  const strokeColor = Color(store.currentTheme?.primary_hex)
    .darken(timer.isRunning ? 0.1 : 0.4)
    .hex() as ColorFormat;

  return (
    <>
      <div className="grow flex flex-col items-center justify-evenly">
        {store.currentTheme && (
          <div className="relative group">
            <CountdownCircleTimer
              key={timer.key}
              isPlaying={timer.isRunning}
              duration={timer.duration * 60}
              onUpdate={timer.onUpdate}
              onComplete={() => {
                services.playAudio();
                timer.next();
              }}
              strokeWidth={8}
              size={186}
              colors={strokeColor}
              trailColor={
                Color(store.currentTheme.window_hex)
                  .darken(0.2)
                  .hex() as ColorFormat
              }
            >
              {({ remainingTime, color }) => (
                <span style={{ fontSize: 44, color }}>
                  {utils.formatTimeTimer(remainingTime)}
                </span>
              )}
            </CountdownCircleTimer>
            <div className="absolute bottom-4 w-full flex flex-col items-center gap-1">
              <span className="text-lg text-text/60 whitespace-nowrap">
                {timer.type === "focus"
                  ? "Focus"
                  : timer.type === "break"
                    ? "Break"
                    : "Long break"}
              </span>
              <button
                className="text-primary/80 hover:text-primary opacity-0 group-hover:opacity-100"
                onClick={() => {
                  timer.restart();
                }}
              >
                <VscDebugRestart size={24} />
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-row items-center justify-center gap-2 w-full h-10">
          {timer.isRunning ? (
            <Button
              transparent
              opacity={0.4}
              onClick={() => {
                timer.pause();
              }}
            >
              <MdPauseCircle size={48} />
            </Button>
          ) : (
            <Button
              transparent
              opacity={0.8}
              onClick={() => {
                timer.start();
              }}
            >
              <MdPlayCircle size={48} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <span className="text-primary/80 font-bold w-7 text-center">#0</span>
        {store.activeIntentId ? (
          <div className="flex flex-row items-center gap-0.5 text-text/80">
            <span>{store.getActiveIntent()?.label}</span>
          </div>
        ) : null}
        <Button
          transparent
          onClick={() => {
            timer.next(true);
          }}
        >
          <MdSkipNext size={28} />
        </Button>
      </div>
    </>
  );
};

export default Timer;
