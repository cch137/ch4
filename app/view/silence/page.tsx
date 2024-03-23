"use client"

import { silenceFontClassName } from '@/constants/font'
import './silence.css'

import { Slider } from '@nextui-org/slider'
import { Spacer } from "@nextui-org/spacer"
import { Select } from "@nextui-org/select"
import { Divider as _Divider } from '@nextui-org/divider'
import { Spinner } from '@nextui-org/spinner'
import { Accordion, AccordionItem } from '@nextui-org/accordion'
import { Button } from '@nextui-org/button'
import Link from "next/link"
import { createRef, useCallback, useEffect, useRef, useState } from "react"
import { MdChevronLeft, MdPlayArrow, MdEdit, MdDeleteForever, MdAdd, MdPause } from "react-icons/md"
import useUserInfo from '@/hooks/useUserInfo'
import useInit from '@/hooks/useInit'
import FullpageSpinner from '@/app/components/fullpage-spiner'

const LOCALSTORAGE_KEY = 'silence';
const DEFAULT_VOLUME = 0;
const SAVE_EVENT = 'save';
const LOAD_EVENT = 'load';
const PLAY_EVENT = 'play';
const PAUSE_EVENT = 'pause';
const et = new EventTarget();

const save = (() => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => et.dispatchEvent(new Event(SAVE_EVENT)), 100);
  }
})();

class AudioSource {
  static getUrl = (type: string, id: string) =>
  // `https://raw.githubusercontent.com/cch137/silence/main/${type}-${id}.mp4`;
  `/assets/silence/${type}-${id}.mp4`;

  readonly id: string;
  readonly name: string;
  readonly cat: string;
  readonly isAddition: boolean;
  volume: number = 0;

  constructor({id, name, cat, isAddition}: {name: string, id: string, cat: string, isAddition?: boolean}) {
    this.id = id;
    this.name = name;
    this.cat = cat;
    this.isAddition = Boolean(isAddition);
  }

  get mainUrl(): string { return AudioSource.getUrl('main', this.id); }
  get glueUrl(): string { return AudioSource.getUrl('glue', this.id); }
}

type MixConfig = {
  name: string;
  volume: number;
  speed: number;
  isPlaying?: boolean;
  sources: {id: string, volume: number}[];
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
  { name: '餐廳', id: 'people', cat: '雜訊' },
  { name: '唱片機', id: 'vinyl', cat: '雜訊' },
  { name: '白噪音', id: 'whitenoise', cat: '雜訊' },
  { name: '布朗噪聲', id: 'brownnoise', cat: '雜訊' },
  { name: '粉紅雜訊', id: 'pinknoise', cat: '雜訊' },
  { name: '頌缽', id: 'sbowl', cat: '音樂' },
  { name: '編鐘', id: 'chimesmetal', cat: '音樂' },
  { name: '蟬鳴', id: 'cicadas', cat: '動物' },
  { name: '鳥語', id: 'birds', cat: '動物' },
  { name: '蟋蟀', id: 'crickets', cat: '動物' },
  { name: '青蛙', id: 'frogs', cat: '動物' },
  { name: '城市', id: 'city', cat: '工業' },
  { name: '空調', id: 'aircon', cat: '工業' },
  { name: '低頻轟鳴', id: 'fanlow', cat: '工業' },
  { name: '高頻轟鳴', id: 'fanhigh', cat: '工業' },
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

function Divider() {
  return <_Divider className="opacity-50" />
}

function AudioController({audio, currentMix, globalVolume = 1, speed = 1}: { audio: AudioSource, currentMix: MixConfig, globalVolume?: number, speed?: number}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingGlue = useRef(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [computedVolume, setComputedVolume] = useState(DEFAULT_VOLUME * globalVolume);
  const mainRef = createRef<HTMLAudioElement>();
  const glueRef = createRef<HTMLAudioElement>();

  const setupMain = useCallback(() => {
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.volume = computedVolume;
      mainEl.playbackRate = speed;
    }
  }, [mainRef, computedVolume, speed]);

  const setupGlue = useCallback(() => {
    const glueEl = glueRef.current;
    if (glueEl) {
      glueEl.volume = computedVolume;
      glueEl.playbackRate = speed;
    }
  }, [glueRef, computedVolume, speed]);

  const setup = useCallback(() => {
    setupMain();
    setupGlue();
  }, [setupMain, setupGlue]);

  const play = useCallback(() => {
    if (!computedVolume) return;
    if (!isPlayed) setIsPlayed(true);
    setIsPlaying(true);
    const mainEl = mainRef.current;
    const glueEl = glueRef.current;
    if (mainEl) mainEl.play();
    if (glueEl && isPlayingGlue.current) glueEl.play();
  }, [computedVolume, isPlayed, mainRef, glueRef, isPlayingGlue, setIsPlaying]);

  const pause = useCallback(() => {
    if (!isPlayed) return;
    setIsPlaying(false);
    const mainEl = mainRef.current;
    const glueEl = glueRef.current;
    if (mainEl) {
      mainEl.pause();
      if (isAlmostEnd(mainEl)) mainEl.currentTime = 0;
    }
    if (glueEl) glueEl.pause();
  }, [mainRef, glueRef, setIsPlaying, isPlayed]);

  useEffect(() => {
    audio.volume = volume;
    const computedVolume = volume * globalVolume;
    setComputedVolume(computedVolume);
  }, [globalVolume, audio, volume, setComputedVolume]);

  useEffect(() => {
    setup();
    if (computedVolume === 0 || speed === 0) pause();
    else play();
  }, [computedVolume, speed, setup, play, pause]);

  useEffect(() => {
    const load = () => {
      setVolume(audio.volume);
      mainRef.current!.currentTime = 0;
      glueRef.current!.currentTime = 0;
    }
    et.addEventListener(LOAD_EVENT, load);
    et.addEventListener(PLAY_EVENT, play);
    et.addEventListener(PAUSE_EVENT, pause);
    return () => {
      et.removeEventListener(LOAD_EVENT, load);
      et.removeEventListener(PLAY_EVENT, play);
      et.removeEventListener(PAUSE_EVENT, pause);
    }
  }, [audio, setVolume, play, pause, mainRef, glueRef]);

  return (
    <div className="w-40 text-default-500 transition" style={{ filter: `brightness(${0.75 + volume *0.5})` }}>
      <div className="flex-center text-lg font-medium gap-2 transition">
        <div className="flex-1">{audio.name}</div>
        {(isPlaying && !isLoaded) ? <Spinner size="sm" color="white" /> : null}
        <div className="text-xs opacity-75">{Math.round(volume * 100)}</div>
      </div>
      <Slider
        minValue={0}
        maxValue={1}
        step={0.01}
        value={volume}
        size="sm"
        color="foreground"
        onChange={(_v) => {
          const v = Number(_v);
          setVolume(v);
          const { sources } = currentMix;
          const src = sources.find(s => s.id === audio.id);
          if (src) {
            if (v === DEFAULT_VOLUME) sources.splice(sources.indexOf(src), 1);
            else src.volume = v;
          } else sources.push({id: audio.id, volume: v});
          save();
        }}
        classNames={{base: "opacity-75", track: "cursor-pointer"}}
      />
      {isPlayed ? <>
        <audio
          src={audio.mainUrl}
          ref={mainRef}
          loop
          hidden
          onCanPlay={() => {
            setupMain();
            setIsLoaded(true);
          }}
          onTimeUpdate={() => {
            if (!isPlayingGlue.current && isAlmostEnd(mainRef.current!)) {
              isPlayingGlue.current = true;
              glueRef.current!.play();
            }
          }}
          aria-label={`${audio.id}-main-audio`}
        />
        <audio
          src={audio.glueUrl}
          ref={glueRef}
          hidden
          onCanPlay={setupGlue}
          onEnded={() => {
            isPlayingGlue.current = false;
            glueRef.current!.currentTime = 0;
          }}
          aria-label={`${audio.id}-glue-audio`}
        />
      </> : null}
    </div>
  )
}

export default function Silence() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [globalVolume, setGlobalVolume] = useState(1);
  const [globalSpeed, setGlobalSpeed] = useState(1);
  const [mixConfigList, setMixConfigList] = useState<MixConfig[]>([]);
  const [showRelaxingMusic, setShowRelaxingMusic] = useState(false);
  const [isHoverVolume, setIsHoverVolume] = useState(false);

  const needLoad = useRef(false);
  const loaded = useRef(false);

  useEffect(() => {
    const isPlayingCount = mixConfigList.filter(m => m.isPlaying).length;
    if (isPlayingCount === 0 && mixConfigList.length) {
      mixConfigList[0].isPlaying = true;
      setMixConfigList([...mixConfigList]);
      save();
    }
  }, [setMixConfigList, mixConfigList]);

  useEffect(() => {
    const mix = mixConfigList.find(m => m.isPlaying);
    if (!mix) return;
    if (loaded.current) {
      mix.volume = globalVolume;
      save();
    }
  }, [mixConfigList, globalVolume, loaded]);

  useEffect(() => {
    const mix = mixConfigList.find(m => m.isPlaying);
    if (!mix) return;
    if (loaded.current) {
      mix.speed = globalSpeed;
      save();
    }
  }, [mixConfigList, globalSpeed, loaded]);

  const loadConfig = useCallback((mix: MixConfig) => {
    setMixConfigList(mixConfigList.map(m => {
      m.isPlaying = m === mix;
      return m;
    }));
    sources.forEach((source) => {
      const savedSource = mix.sources.find(({id: _id}) => _id === source.id);
      source.volume = savedSource ? savedSource.volume : DEFAULT_VOLUME;
    });
    et.dispatchEvent(new Event(LOAD_EVENT));
    setGlobalVolume(mix.volume);
    setGlobalSpeed(mix.speed);
  }, [mixConfigList, setGlobalVolume, setGlobalSpeed]);

  useInit(() => {
    const loadedMixes = (() => {
      try {
        const mixes: MixConfig[] = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)!);
        if (!Array.isArray(mixes) || mixes.length < 1) throw new Error('No Saved Mixes');
        return mixes;
      } catch {
        return [
          {
            name: "阿爾卑斯營地",
            volume: 1,
            speed: 1,
            sources: [
              { id: "fire", volume: 0.84 },
              { id: "whitenoise", volume: 0.02 },
              { id: "cicadas", volume: 0.04 },
              { id: "crickets", volume: 0.08 },
              { id: "frogs", volume: 0.04 },
              { id: "wind", volume: 0.12 },
              { id: "stream", volume: 0.18 },
            ],
            isPlaying: true,
          },
          {
            name: "聽海禪寺",
            volume: 1,
            speed: 1,
            sources: [
              { id: "waves", volume: 0.88 },
              { id: "rain", volume: 0.13 },
              { id: "thunder", volume: 0.18 },
              { id: "wind", volume: 0.26 },
              { id: "brownnoise", volume: 0.09 },
              { id: "sbowl", volume: 0.2 },
              { id: "chimesmetal", volume: 0.08 },
            ],
            isPlaying: false,
          },
          {
            name: "溪邊的餐廳",
            volume: 1,
            speed: 1,
            sources: [
              { id: "people", volume: 1 },
              { id: "stream", volume: 0.48 },
              { id: "waterfall", volume: 0.32 },
              { id: "birds", volume: 0.12 },
              { id: "aircon", volume: 0.02 },
              { id: "frogs", volume: 0.06 },
            ],
            isPlaying: false,
          },
        ];
      }
    })();
    setMixConfigList(loadedMixes);
  }, [setMixConfigList]);

  useEffect(() => {
    const _save = () => {
      if (!mixConfigList.length) return;
      const toSave = [...mixConfigList];
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(toSave));
    }
    const preventSpacebarScorll = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
    }
    const playAndPauseByKeyboard = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsPlaying(v => !v);
    }
    const controlVolumeByWheel = (e: WheelEvent) => {
      if (!isHoverVolume) return;
      if (e.deltaY < 0) setGlobalVolume(v => Math.min(1, v + 0.01));
      if (e.deltaY > 0) setGlobalVolume(v => Math.max(0, v - 0.01));
      e.preventDefault();
    }
    document.addEventListener('keydown', preventSpacebarScorll);
    document.addEventListener('keyup', playAndPauseByKeyboard);
    document.addEventListener('wheel', controlVolumeByWheel, {passive: false});
    et.addEventListener(SAVE_EVENT, _save);
    return () => {
      document.removeEventListener('keydown', preventSpacebarScorll);
      document.removeEventListener('keyup', playAndPauseByKeyboard);
      document.removeEventListener('wheel', controlVolumeByWheel);
      et.removeEventListener(SAVE_EVENT, _save);
    }
  }, [mixConfigList, isHoverVolume, setIsPlaying, setGlobalVolume]);

  useEffect(() => {
    if (!needLoad.current && mixConfigList.length) {
      needLoad.current = true;
      loadConfig(mixConfigList.find(m => m.isPlaying) || mixConfigList[0]);
      setTimeout(() => {
        loaded.current = true;
        setIsLoading(false);
      }, 1000);
      return;
    }
    const isPlayingCount = mixConfigList.filter(m => m.isPlaying).length;
    if (isPlayingCount === 0 && mixConfigList.length) {
      loadConfig(mixConfigList[0])
      return;
    }
    if (isPlayingCount > 1) {
      mixConfigList.forEach(m => m.isPlaying = false);
      mixConfigList.at(-1)!.isPlaying = true;
      setMixConfigList([...mixConfigList]);
      return;
    }
  }, [mixConfigList, setMixConfigList, loadConfig, needLoad]);

  const { auth, name: username } = useUserInfo();
  const isLoggedIn = auth > 1;

  return (<>
    <FullpageSpinner color="white" show={isLoading} />
    <div className="px-4 py-8 m-auto select-none" style={{maxWidth: 960}}>
      <div className="flex-center text-sm text-default-500 justify-start pb-8">
        <Link className="text-default-300 flex-center gap-2" href="/apps/lab">
          <MdChevronLeft className="text-md" />
          <span>返回</span>
        </Link>
        <div className="flex-1" />
        {isLoggedIn
          ? <div>{username}</div>
          : <Button className="opacity-50 h-7" as={Link} variant="bordered" href="/auth/signin?next=/view/silence">Sign in</Button>}
      </div>
      <div className={`${silenceFontClassName} flex flex-col gap-4`}>
        <div className="flex flex-wrap gap-6 text-default-500">
          <div className="flex flex-col gap-3">
            <div className="flex justify-start items-center gap-4 cursor-pointer" onClick={() => {
              if (isPlaying) {
                et.dispatchEvent(new Event(PAUSE_EVENT));
                setIsPlaying(false);
              } else {
                et.dispatchEvent(new Event(PLAY_EVENT));
                setIsPlaying(true);
              }
            }}>
              <div className="text-4xl">
                {isPlaying ? <MdPause /> : <MdPlayArrow />}
              </div>
              <div className="text-sm">{isPlaying ? '播放中' : '已暫停'}：{mixConfigList.find(m => m.isPlaying)?.name || '-'}</div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="w-64">
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
                  onMouseEnter={() => setIsHoverVolume(true)}
                  onMouseLeave={() => setIsHoverVolume(false)}
                  classNames={{track: "cursor-pointer"}}
                />
              </div>
              <div className="w-24">
                <div className="flex-center text-lg font-medium gap-2">
                  <div className="flex-1">速度</div>
                  <div className="text-xs opacity-75">{globalSpeed.toFixed(2)}</div>
                </div>
                <Slider
                  minValue={0.25}
                  maxValue={4}
                  step={0.25}
                  value={globalSpeed}
                  size="sm"
                  color="foreground"
                  className="opacity-75"
                  onChange={(v) => setGlobalSpeed(Number(v))}
                  classNames={{track: "cursor-pointer"}}
                />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Accordion isCompact defaultSelectedKeys="all">
              <AccordionItem aria-label="Mixes" title="我的混錄" classNames={{title: "text-default-500"}}>
                {mixConfigList.map((mix, i) => {
                  const { name, isPlaying } = mix;
                  return (<div className="flex" key={i}>
                    <Button
                      className="rounded-none text-default-600 flex-1 justify-start text-start h-7"
                      style={{opacity: isPlaying ? 1 : 0.75}}
                      variant="light"
                      startContent={isPlaying ? <MdPlayArrow /> : null}
                      onClick={() => isPlaying || loadConfig(mix)}
                    >
                      {name}
                    </Button>
                    <div className="flex-center w-7 overflow-hidden opacity-75">
                      <Button
                        className="rounded-none text-default-600 h-7"
                        variant="light"
                        isIconOnly
                        onClick={() => {setMixConfigList(mixConfigList.map(m => {
                          if (m === mix) {
                            m.name = (prompt('輸入名稱', m.name) || '').trim() || m.name;
                          }
                          return m;
                        }))}}
                      >
                        <MdEdit />
                      </Button>
                    </div>
                    <div className="flex-center w-7 overflow-hidden opacity-75">
                      <Button
                        className="rounded-none text-default-500 h-7"
                        variant="light"
                        isIconOnly
                        onClick={() => {if (mixConfigList.length > 1 && confirm(`是否刪除混錄：${mix.name}`)) setMixConfigList(mixConfigList.filter(m => m !== mix))}}
                      >
                        <MdDeleteForever />
                      </Button>
                    </div>
                  </div>)
                })}
                <div className="flex-center w-full opacity-75">
                  <Button
                    className="rounded-none text-default-400 flex-1 justify-center h-7"
                    variant="light"
                    startContent={<MdAdd />}
                    onClick={() => {
                      const newMixName = (prompt('輸入名稱') || '').trim();
                      if (!newMixName) return;
                      setMixConfigList([...mixConfigList, { name: newMixName, volume: 1, speed: 1, sources: [] }]);
                    }}
                  >
                    新增混錄
                  </Button>
                </div>
              </AccordionItem>
            </Accordion>
            <Divider />
          </div>
        </div>
        <Spacer />
        <Divider />
        {catrgorizedSources.map((cate, i) => (<div key={i}>
          <div className="text-2xl text-default-500 font-semibold">{cate.name}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 p-1">
            {cate.sources.map((s, i) => <AudioController audio={s} currentMix={mixConfigList.find(m => m.isPlaying)!} globalVolume={globalVolume} speed={isPlaying ? globalSpeed : 0} key={i} />)}
          </div>
          <Spacer y={4} />
          <Divider />
        </div>))}
        <div className="flex-center flex-col gap-4 py-16">
          <Button className="opacity-50 h-7" variant="bordered" onClick={() => setShowRelaxingMusic((v) => !v)}>
            {showRelaxingMusic ? "隱藏" : "播放"} YouTube 放鬆音樂
          </Button>
          {showRelaxingMusic ? <div className="w-full">
            <iframe
              className="w-full h-40"
              src="//www.youtube.com/embed/hlWiI4xVXKY?t=0&playlist=hlWiI4xVXKY&loop=1"
              title="Sunny Mornings: Beautiful Relaxing Music • Peaceful Piano Music &amp; Guitar Music by Peder B. Helland"
              // frameborder="0"
              allow="accelerometer; autoplay; playlist=hlWiI4xVXKY; loop; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              // allowfullscreen
            />
          </div> : null}
        </div>
        <div className="flex-center text-sm text-default-500 gap-8 py-4">
          <Button className="opacity-50 h-7" variant="bordered" onClick={() => {
            if (confirm('是否重置全部？')) {
              window.scrollTo({ top: 0 });
              localStorage.setItem(LOCALSTORAGE_KEY, '');
              location.reload();
            }
          }}>
            重置全部
          </Button>
        </div>
      </div>
    </div>
  </>)
}
