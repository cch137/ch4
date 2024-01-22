"use client"
import './sidebar.css'
import { useState, useEffect, ChangeEvent } from "react";
import { Select, SelectItem, Slider } from "@nextui-org/react";
import type { IModelType, IRedirectIModelType, IConversation } from "@/constants/types"
import ErrorMessage from './error-message';
import { IoSettingsSharp } from "react-icons/io5";

const Sidebar = () => {
  const sidebarOpenedWidth = 280;
  let [sidebarOpened, setSidebarOpened] = useState(true);
  let [sidebarWidth, setSidebarWidth] = useState(sidebarOpenedWidth);

  function sideButtonOnClick() {
    setSidebarOpened(!sidebarOpened)
    setSidebarWidth(sidebarWidth ? 0 : sidebarOpenedWidth)
  }

  const [modelIsDisabled, setModelIsDisabled] = useState(true);
  const [models, setModels] = useState<IModelType[]>([]);
  const maxHistoryMessages = 10;
  const [conversation, _setConversation] = useState<IConversation|undefined>(undefined);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedModel, _setSelectedModel] = useState<IModelType|undefined>(undefined);
  const { openErrorMessageBox, errorMessageBox } = ErrorMessage();
  const setSelectedModel = async (model: IModelType) => {
    setSelectedModels([model.value]);
    _setSelectedModel(model);
  }
  const setConversation = async (conversation: IConversation) => {
    const { name, temp, history } = conversation;
    _setConversation(conversation);
  }
  const setTemperature = async (value: number) => {
    value = Math.min(Math.max(0, value), 1);
    if (conversation !== undefined) setConversation({ ...conversation, temp: value });
  }
  const setHistoryMessages = async (value: number) => {
    value = Math.min(Math.max(0, value), maxHistoryMessages);
    if (conversation !== undefined) setConversation({ ...conversation, history: value });
  }
  const modelOnChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const model = models.find(m => m.value === value);
    if (model === undefined) return;
    setSelectedModel(model);
  }
  let fetched = false;
  useEffect(() => {
    const fetchModels = async () => {
      if (fetched) return;
      fetched = true;
      try {
        const res = await fetch('/api/chat/models');
        if (!res.ok) throw new Error('Response error');
        const { models, redirects } = await res.json() as { models: IModelType[], redirects: IRedirectIModelType[] };
        if (models.length === 0) throw Error('No models found');
        setModels(models);
        setSelectedModel(models[0]);
        setModelIsDisabled(false);
        setConversation({
          name: '',
          temp: 0.5,
          history: 50,
        });
      } catch (error) {
        openErrorMessageBox('Models fetch failed.');
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="sidebar" style={({width: `${sidebarOpenedWidth}px`, left: `${sidebarWidth-sidebarOpenedWidth}px`})}>
      {errorMessageBox}
      <div className="sidebar-content" style={({flex: 1})}>
        <div className="flex flex-col p-4 gap-2">
          <div className="flex gap-1">
            <Select
              isDisabled={modelIsDisabled}
              label="Model" 
              className="max-w-xs"
              onChange={modelOnChange}
              selectedKeys={selectedModels}
            >
              {models.map((model, i) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.name}
                </SelectItem>
              ))}
            </Select>
            <div>
              <IoSettingsSharp />
            </div>
          </div>
          <div className="p-2">
            <Slider
              label="Temperature"
              step={0.05}
              maxValue={1}
              minValue={0}
              isDisabled={!selectedModel?.isTemperatureOptional}
              value={!selectedModel?.isTemperatureOptional ? 1 : conversation?.temp}
              onChange={(v) => setTemperature(v as number)}
              className="max-w-md"
              getValue={(v) => Number(v).toFixed(2)}
            />
          </div>
          <div className="p-2">
            <Slider
              label="History messages"
              step={1}
              maxValue={maxHistoryMessages}
              minValue={0}
              isDisabled={!selectedModel?.isContextOptional}
              value={!selectedModel?.isContextOptional ? 0 : conversation?.history}
              onChange={(v) => setHistoryMessages(v as number)}
              className="max-w-md"
              getValue={(v) => (v == maxHistoryMessages ? 'auto' : v).toString()}
            />
          </div>
        </div>
      </div>
      <div className="sidebar-button-ctn">
        <div className={(sidebarOpened ? 'opened ' : '') + "sidebar-button"} onClick={sideButtonOnClick}></div>
      </div>
    </div>
  )
}

export default Sidebar