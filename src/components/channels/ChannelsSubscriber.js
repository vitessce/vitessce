import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';

import { Checkbox } from 'antd';
import { Slider } from '@material-ui/core';
import PopoverColor from '../sets/PopoverColor';

import TitleInfo from '../TitleInfo';
import {
  SLIDERS_CHANGE, RASTER_ADD, COLORS_CHANGE, CHANNEL_VISIBILITY_CHANGE,
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
  const [channelVisibilities, setChannelVisibilities] = useState(null);
  const [sliderDomains, setSliderDomains] = useState(null);
  const [sourceId, setSourceId] = useState(null);

  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      const { domains, id, channelNames: cNames } = raster;

      const initialColorValues = domains.map((_, i) => VIEWER_PALETTE[i]);
      setColorValues(initialColorValues);
      PubSub.publish(COLORS_CHANGE(id), initialColorValues);

      const initialSliderValues = domains.map((d) => {
        const isArray = Array.isArray(d);
        return isArray ? [d[0], Math.ceil(d[1] / 5)] : [0, Math.ceil(STANDARD_MAX / 5)];
      });
      // "5" is arbitrary, but the data tends to be left-skewed.
      // Eventually we want this to be based on the data in the image.));
      setSliderValues(initialSliderValues);
      PubSub.publish(SLIDERS_CHANGE(id), initialSliderValues);

      const initialChannelVisibilities = Array(domains.length).fill(true);
      setChannelVisibilities(initialChannelVisibilities);
      PubSub.publish(CHANNEL_VISIBILITY_CHANGE(id), initialChannelVisibilities);


      setChannelNames(cNames);
      setSliderDomains(domains.map(d => (Array.isArray(d) ? d : [0, STANDARD_MAX])));
      setSourceId(id);
    }
    memoizedOnReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [memoizedOnReady]);

  const handleColorChange = (i, rgb) => {
    setColorValues((prevColorValues) => {
      const nextColorValues = [...prevColorValues];
      nextColorValues[i] = rgb;
      PubSub.publish(COLORS_CHANGE(sourceId), nextColorValues);
      return nextColorValues;
    });
  };

  const handleSliderChange = (i, sliderValue) => {
    setSliderValues((prevSliderValues) => {
      const nextSliderValues = [...prevSliderValues];
      nextSliderValues[i] = sliderValue;
      PubSub.publish(SLIDERS_CHANGE(sourceId), nextSliderValues);
      return nextSliderValues;
    });
  };

  const handleChannelVisibilitiesChange = (i) => {
    setChannelVisibilities((prevChannelVisibilities) => {
      const nextChannelVisibilities = [...prevChannelVisibilities];
      nextChannelVisibilities[i] = !nextChannelVisibilities[i];
      PubSub.publish(CHANNEL_VISIBILITY_CHANGE(sourceId), nextChannelVisibilities);
      return nextChannelVisibilities;
    });
  };

  if (channelNames && colorValues && sliderValues && channelVisibilities && sliderDomains) {
    const channelSliders = channelNames.map((name, i) => {
      const colorValue = colorValues[i];
      const sliderValue = sliderValues[i];
      const [min, max] = sliderDomains[i];
      const channelIsVisible = channelVisibilities[i];
      return (
        <div key={`container-${name}`}>
          <div>{name}</div>
          <div className="channel-container">
            <Checkbox
              className="channel-checked"
              checked={channelIsVisible}
              onChange={() => handleChannelVisibilitiesChange(i)}
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
