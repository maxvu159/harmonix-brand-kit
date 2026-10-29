import React from "react";
import { Composition } from "remotion";
import "./brand/colors_and_type.css";
import "./brand-fonts";
import { SmokeTest } from "./SmokeTest";
import { FontProbe } from "./FontProbe";
import { HaUsdc } from "./haUSDC";
import { CoinTest } from "./CoinTest";
import { PTHaHype } from "./PTHaHype";
import { FontCheck } from "./FontCheck";
import { AuroraTest } from "./AuroraTest";
import { CardTest } from "./CardTest";
import { CardsLoop } from "./CardsLoop";
import { BuybackFill } from "./BuybackFill";
import { AprBars } from "./AprBars";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="SmokeTest"
    component={SmokeTest}
    durationInFrames={240}
    fps={30}
    width={1080}
    height={1350}
  />
    <Composition id="haUSDC" component={HaUsdc} durationInFrames={420} fps={30} width={1920} height={1080} />
    <Composition id="CoinTest" component={CoinTest} durationInFrames={360} fps={30} width={2560} height={1440} />
    <Composition id="PTHaHype" component={PTHaHype} durationInFrames={420} fps={30} width={2560} height={1440} />
    <Composition id="CardsLoop" component={CardsLoop} durationInFrames={960} fps={60} width={2560} height={1440} />
    <Composition id="Buyback" component={BuybackFill} durationInFrames={840} fps={60} width={2560} height={1440} />
    <Composition id="AprBars" component={AprBars} durationInFrames={900} fps={60} width={2560} height={1440} />
    <Composition id="CardTest" component={CardTest} durationInFrames={480} fps={60} width={2560} height={1440} />
    <Composition id="AuroraTest" component={AuroraTest} durationInFrames={420} fps={30} width={2560} height={1440} />
    <Composition id="FontCheck" component={FontCheck} durationInFrames={1} fps={30} width={1500} height={720} />
    <Composition id="FontProbe" component={FontProbe} durationInFrames={1} fps={30} width={1080} height={900} />
  </>
);
