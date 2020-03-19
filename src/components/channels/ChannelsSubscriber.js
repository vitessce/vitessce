import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';

import { Checkbox } from 'antd';
import ChannelSlider from './ChannelSlider';
import PopoverColor from '../sets/PopoverColor';

import TitleInfo from '../TitleInfo';
import {
  SLIDERS_CHANGE, RASTER_ADD, COLORS_CHANGE, CHANNEL_TOGGLE,
} from '../../events';

const VIEWER_PALETTE = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 255],
  [255, 128, 0],
];

const STANDARD_MAX = 65535;

export default function ChannelsSubscriber({ onReady, removeGridComponent }) {
  const [channelNames, setChannelNames] = useState(null);
  const [colorValues, setColorValues] = useState(null);
  const [sliderValues, setSliderValues] = useState(null);
  const [channelIsOn, setChannelIsOn] = useState(null);
  const [sliderDomains, setSliderDomains] = useState(null);

  useEffect(() => {
    function rasterAddSubscriber(event, data) {
      const { domains } = data;
      setSliderValues(domains.map(d => (Array.isArray(d) ? [d[0], Math.ceil(d[1] / 5)] : [0, Math.ceil(STANDARD_MAX / 5)])));
      // "5" is arbitrary, but the data tends to be left-skewed.
      // Eventually we want this to be based on the data in the image.));
      setColorValues(domains.map((_, i) => VIEWER_PALETTE[i]));
      setChannelIsOn(domains.map(_ => true));
      setChannelNames(data.dimensions[0].values);
      setSliderDomains(domains.map(d => (Array.isArray(d) ? d : [0, STANDARD_MAX])));
    }
    const token = PubSub.subscribe(RASTER_ADD, rasterAddSubscriber);
    onReady();
    return () => PubSub.unsubscribe(token);
  }, []);

  function handleColorChange(i, rgb) {
    const nextColorValues = [...colorValues];
    nextColorValues[i] = rgb;
    setColorValues(nextColorValues);
    PubSub.publish(COLORS_CHANGE, nextColorValues);
  }

  function handleSliderChange(i, sliderValue) {
    const nextSliderValues = [...sliderValues];
    nextSliderValues[i] = sliderValue;
    setSliderValues(nextSliderValues);
    PubSub.publish(SLIDERS_CHANGE, nextSliderValues);
  }

  function handleChannelIsOnChange(i) {
    const nextChannelIsOn = [...channelIsOn];
    nextChannelIsOn[i] = !channelIsOn[i];
    setChannelIsOn(nextChannelIsOn);
    PubSub.publish(CHANNEL_TOGGLE, nextChannelIsOn);
  }

  // function handleChannelSelectionsChange(i, selection) {
  //   const nextChannelSelections = [...channelSelections];
  //   nextChannelSelections[i] = selection;
  //   setChannelSelections(nextChannelSelections);
  //   PubSub.publish(CHANNEL_SELECTION_CHANGE, nextChannelSelections);
  // }


  if (channelNames && colorValues && sliderValues && channelIsOn && sliderDomains) {
    const channelSliders = channelNames.map((name, i) => {
      const colorValue = colorValues[i];
      const sliderValue = sliderValues[i];
      const sliderDomain = sliderDomains[i];
      return (
        <div key={`container-${name}`}>
          <div>{name}</div>
          <div className="channel-container">
            <Checkbox
              className="channel-checked"
              checked={channelIsOn[i]}
              onChange={() => handleChannelIsOnChange(i)}
            />
            <PopoverColor
              prefixClass="channel"
              color={colorValue}
              setColor={rgb => handleColorChange(i, rgb)}
              placement="left"
              palette={VIEWER_PALETTE}
            />
            <ChannelSlider
              name={name}
              onChange={v => handleSliderChange(i, v)}
              range={sliderDomain}
              color={colorValue}
              value={sliderValue}
            />
          </div>
        </div>
      );
    });
    return (
      <TitleInfo title="Channel Levels" isScroll removeGridComponent={removeGridComponent}>
        <div className="sliders">
          {channelSliders}
        </div>
      </TitleInfo>
    );
  }
  return null;
}
