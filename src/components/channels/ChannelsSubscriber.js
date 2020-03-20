import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';

import { Checkbox } from 'antd';
import { Slider } from '@material-ui/core';
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
  const [eventId, setEventId] = useState(null);


  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      const { domains, id, channelNames: cNames } = raster;

      const initialColorValues = domains.map((_, i) => VIEWER_PALETTE[i]);
      setColorValues(initialColorValues);
      PubSub.publish(COLORS_CHANGE + id, initialColorValues);

      const initialSliderValues = domains.map((d) => {
        const isArray = Array.isArray(d);
        return isArray ? [d[0], Math.ceil(d[1] / 5)] : [0, Math.ceil(STANDARD_MAX / 5)];
      });
      // "5" is arbitrary, but the data tends to be left-skewed.
      // Eventually we want this to be based on the data in the image.));
      setSliderValues(initialSliderValues);
      PubSub.publish(SLIDERS_CHANGE + id, initialSliderValues);

      const initialChannelIsOn = Array(domains.length).fill(true);
      setChannelIsOn(initialChannelIsOn);
      PubSub.publish(CHANNEL_TOGGLE + id, initialChannelIsOn);


      setChannelNames(cNames);
      setSliderDomains(domains.map(d => (Array.isArray(d) ? d : [0, STANDARD_MAX])));
      setEventId(id);
    }
    onReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleColorChange = (i, rgb) => {
    setColorValues((prevColorValues) => {
      const nextColorValues = [...prevColorValues];
      nextColorValues[i] = rgb;
      PubSub.publish(COLORS_CHANGE + eventId, nextColorValues);
      return nextColorValues;
    });
  };

  const handleSliderChange = (i, sliderValue) => {
    setSliderValues((prevSliderValues) => {
      const nextSliderValues = [...prevSliderValues];
      nextSliderValues[i] = sliderValue;
      PubSub.publish(SLIDERS_CHANGE + eventId, nextSliderValues);
      return nextSliderValues;
    });
  };

  const handleChannelIsOnChange = (i) => {
    setChannelIsOn((prevChannelIsOn) => {
      const nextChannelIsOn = [...prevChannelIsOn];
      nextChannelIsOn[i] = !channelIsOn[i];
      PubSub.publish(CHANNEL_TOGGLE + eventId, nextChannelIsOn);
      return nextChannelIsOn;
    });
  };

  if (channelNames && colorValues && sliderValues && channelIsOn && sliderDomains) {
    const channelSliders = channelNames.map((name, i) => {
      const colorValue = colorValues[i];
      const sliderValue = sliderValues[i];
      const [min, max] = sliderDomains[i];
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
            <Slider
              value={sliderValue}
              onChange={(e, v) => handleSliderChange(i, v)}
              valueLabelDisplay="auto"
              getAriaLabel={() => name}
              min={min}
              max={max}
              style={{ color: `rgb(${colorValue})` }}
              orientation="horizontal"
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
