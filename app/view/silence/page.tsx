"use client"

import { notoSerifTC } from '@/constants/font'
import './silence.css'

import { Button } from "@nextui-org/button"
import { Slider } from '@nextui-org/slider'
import { Spacer } from "@nextui-org/spacer"
import { Divider } from '@nextui-org/divider'
import { Spinner } from '@nextui-org/spinner'
import Link from "next/link"
import { createRef, useCallback, useEffect, useState } from "react"
import { IoChevronBackOutline, IoCloseOutline } from "react-icons/io5"
import useInit from '@/hooks/useInit'

type AudioMeta = {
  name: string;
  id: string;
  cat: string;
  isAddition?: boolean;
}

class AudioSource {
  static getUrl = (type: string, id: string) =>
  `https://raw.githubusercontent.com/cch137/silence/main/${type}-${id}.mp4`;

  readonly id: string;
  readonly name: string;
  readonly cat: string;
  readonly isAddition: boolean;

  constructor({id, name, cat, isAddition}: AudioMeta) {
    this.id = id;
    this.name = name;
    this.cat = cat;
    this.isAddition = Boolean(isAddition);
  }

  get mainUrl(): string { return AudioSource.getUrl('main', this.id); }
  get glueUrl(): string { return AudioSource.getUrl('glue', this.id); }
}

const sources = [
  { name: '雨', id: 'rain', cat: '自然' },
  { name: '雷', id: 'thunder', cat: '自然' },
  { name: '海浪', id: 'waves', cat: '自然' },
  { name: '風', id: 'wind', cat: '自然' },
  { name: '火', id: 'fire', cat: '自然' },
  { name: '溪流', id: 'stream', cat: '自然' },
  { name: '瀑布', id: 'waterfall', cat: '自然' },
  { name: '林間雨', id: 'raintrees', cat: '自然' },
  { name: '錫板雨', id: 'raintinroof', cat: '自然' },
  { name: '木屋雨', id: 'raincabin', cat: '自然' },
  { name: '餐館', id: 'people', cat: '雜訊' },
  { name: '白噪音', id: 'whitenoise', cat: '雜訊' },
  { name: '布朗噪聲', id: 'brownnoise', cat: '雜訊' },
  { name: '粉紅雜訊', id: 'pinknoise', cat: '雜訊' },
  { name: '唱片機', id: 'vinyl', cat: '雜訊' },
  { name: '頌缽', id: 'sbowl', cat: '音樂' },
  { name: '編鐘', id: 'chimesmetal', cat: '音樂' },
  { name: '蟬鳴', id: 'cicadas', cat: '動物' },
  { name: '鳥語', id: 'birds', cat: '動物' },
  { name: '蟋蟀', id: 'crickets', cat: '動物' },
  { name: '青蛙', id: 'frogs', cat: '動物' },
  { name: '城市', id: 'city', cat: '工業' },
  { name: '空調', id: 'aircon', cat: '工業' },
  { name: '低音轟鳴', id: 'fanlow', cat: '工業' },
  { name: '高音轟鳴', id: 'fanhigh', cat: '工業' },
].map(m => new AudioSource(m));

type AudioCategory = {
  name: string;
  sources: AudioSource[];
}

const catrgorizedSources = (() => {
  const categories: string[] = [];
  sources.forEach(({cat}) => {
    if (!categories.includes(cat)) categories.push(cat);
  });
  const categorized: AudioCategory[] = categories.map(name => ({name, sources: []}));
  sources.forEach((source) => {
    for (const cat of categorized) {
      if (cat.name === source.cat) {
        cat.sources.push(source);
        break;
      }
    }
  });
  return categorized;
})();

const isAlmostEnd = ({duration, currentTime}: HTMLAudioElement) => duration - currentTime <= 5;

function AudioController({audio, globalVolume = 1}: { audio: AudioSource, globalVolume?: number}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [isPlayingGlue, setIsPlayingGlue] = useState(false);
  const [volume, setVolume] = useState(0);
  const [computedVolume, setComputedVolume] = useState(0);
  const mainRef = createRef<HTMLAudioElement>();
  const glueRef = createRef<HTMLAudioElement>();

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    if (isPlayingMain) mainEl.play();
    else mainEl.pause();
  }, [isPlayingMain, mainRef]);

  useEffect(() => {
    const glueEl = glueRef.current;
    if (!glueEl) return;
    if (isPlayingGlue) glueEl.play();
    else glueEl.pause();
  }, [isPlayingGlue, glueRef]);


  useEffect(() => {
    const computedVolume = volume * globalVolume;
    setComputedVolume(computedVolume);
    const mainEl = mainRef.current;
    const glueEl = glueRef.current;
    if (mainEl) {
      mainEl.volume = computedVolume;
      if (isAlmostEnd(mainEl)) mainEl.currentTime = 0;
    }
    if (glueEl) glueEl.volume = computedVolume;
    if (computedVolume === 0) {
      if (isPlayingMain) setIsPlayingMain(false);
    } else {
      if (!isPlayed) setIsPlayed(true);
      if (!isPlayingMain) setIsPlayingMain(true);
    }
  }, [volume, isPlayed, isPlayingMain, mainRef, glueRef, setComputedVolume, setIsPlayingMain]);

  useInit(() => {
    setVolume(volume);
  });

  return (
    <div className="w-40 text-default-500" style={{opacity: 0.75 + volume * 0.25}}>
      <div className="flex-center text-lg font-medium gap-2" style={{filter: `brightness(${0.75 + volume / 2})`}}>
        <div className="flex-1">{audio.name}</div>
        {(isPlayingMain && !isLoaded) ? <Spinner size="sm" color="white" /> : null}
        <div className="text-xs opacity-75">{Math.round(volume * 100)}</div>
      </div>
      <Slider
        minValue={0}
        maxValue={1}
        step={0.01}
        value={volume}
        size="sm"
        color="foreground"
        onChange={(v) => setVolume(Number(v))}
      />
      <link rel="preload" href={audio.mainUrl} as="audio" />
      <link rel="preload" href={audio.glueUrl} as="audio" />
      {isPlayed ? <>
        <audio
          src={audio.mainUrl}
          ref={mainRef}
          loop
          hidden
          onCanPlay={() => {
            mainRef.current!.volume = computedVolume;
            setIsLoaded(true);
          }}
          onTimeUpdate={() => {
            const mainEl = mainRef.current;
            const glueEl = mainRef.current;
            if (!mainEl || !glueEl || isPlayingGlue) return;
            if (isAlmostEnd(mainEl)) setIsPlayingGlue(true);
          }}
          aria-label={`${audio.id}-main-audio`}
        />
      </> : null}
      {isPlayingGlue ? <>
        <audio
          src={audio.glueUrl}
          ref={glueRef}
          hidden
          onCanPlay={() => glueRef.current!.volume = computedVolume}
          onEnded={() => {
            setIsPlayingGlue(false);
          }}
          aria-label={`${audio.id}-glue-audio`}
        />
      </> : null}
    </div>
  )
}

export default function Silence() {
  const [globalVolume, setGlobalVolume] = useState(1);
  return (
    <div className={notoSerifTC.className}>
      <div className="px-4 py-8 m-auto select-none" style={{maxWidth: 960}}>
        <div className="flex flex-col gap-4">
          <div className="w-64 text-default-500">
            <div className="flex-center text-lg font-medium gap-2">
              <div className="flex-1">音量</div>
              <div className="text-xs opacity-75">{Math.round(globalVolume * 100)}</div>
            </div>
            <Slider
              minValue={0}
              maxValue={1}
              step={0.01}
              value={globalVolume}
              size="sm"
              color="foreground"
              className="opacity-75"
              onChange={(v) => setGlobalVolume(Number(v))}
            />
          </div>
          <Spacer />
          <Divider className="opacity-50" />
          {catrgorizedSources.map((cate, i) => (<div key={i}>
            <div className="text-2xl text-default-500 font-semibold opacity-50">{cate.name}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 p-1">
              {cate.sources.map((s, i) => <AudioController audio={s} globalVolume={globalVolume} key={i} />)}
            </div>
            <Spacer y={4} />
            <Divider className="opacity-50" />
          </div>))}
        </div>
      </div>
    </div>
  )
}
