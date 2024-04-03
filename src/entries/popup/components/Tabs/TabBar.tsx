import chroma from 'chroma-js';
import { motion } from 'framer-motion';
import { ReactElement, useMemo } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Text } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import { zIndexes } from '../../utils/zIndexes';
import { timingConfig } from '../CommandK/references';

import ActivityIcon from './TabIcons/Activity';
import ActivitySelected from './TabIcons/ActivitySelected';
import HomeIcon from './TabIcons/Home';
import HomeSelected from './TabIcons/HomeSelected';

export type Tab = (typeof TABS)[number];

export const ICON_SIZE = 36;

export const isValidTab = (value: unknown): value is Tab => {
  return typeof value === 'string' && TABS.includes(value);
};

const TABS = ['tokens', 'activity', 'points'];

const TAB_HEIGHT = 32;
const TAB_WIDTH = 42;

type TabConfigType = {
  Icon: () => ReactElement;
  SelectedIcon: ({
    accentColor,
    colorMatrixValues,
  }: {
    accentColor: string;
    colorMatrixValues: number[];
  }) => ReactElement;
  name: Tab;
  label: string;
  isDisabled?: boolean;
};

const tabConfig: TabConfigType[] = [
  {
    Icon: HomeIcon,
    SelectedIcon: HomeSelected,
    name: 'tokens',
    label: 'Assests',
    isDisabled: false,
  },
  {
    Icon: ActivityIcon,
    SelectedIcon: ActivitySelected,
    name: 'activity',
    label: 'Activity',
    isDisabled: true,
  },
];

export function TabBar({
  activeTab,
  onSelectTab,
}: {
  activeTab: Tab;
  height?: number;
  onSelectTab: (tab: Tab) => void;
}) {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();

  // Convert accent color to SVG color matrix values
  const colorMatrixValues = useMemo(() => {
    const accentColorAsRgb = chroma(avatar?.color || globalColors.blue50).rgb();
    const rgbValues = accentColorAsRgb.map((value: number) => value / 255);
    return currentTheme === 'dark' ? [0, 0, 0] : rgbValues;
  }, [avatar?.color, currentTheme]);

  return (
    <Box
      alignItems="center"
      id="tab-bar"
      as={motion.div}
      display="flex"
      justifyContent="space-around"
      key="tabBarContainer"
      padding="8px"
      position="absolute"
      width="full"
      style={{
        alignSelf: 'center',
        backdropFilter: 'blur(15px)',
        background:
          currentTheme === 'dark'
            ? 'linear-gradient(180deg, rgba(36, 37, 41, 0.6) 0%, rgba(36, 37, 41, 0.8) 100%)'
            : 'linear-gradient(180deg, rgba(250, 250, 250, 0.6) 0%, rgba(240, 240, 240, 0.8) 100%)',
        backgroundColor: "black",
        bottom: 0,
        boxShadow:
          currentTheme === 'dark'
            ? '0 16px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0.5px 0 #000000, 0 -1px 6px 0 rgba(245, 248, 255, 0.05) inset, 0 0.5px 2px 0 rgba(245, 248, 255, 0.1) inset'
            : '0 16px 32px 0 rgba(0, 0, 0, 0.15), 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 -1px 6px 0 rgba(255, 255, 255, 0.8) inset, 0 0.5px 2px 0 rgba(255, 255, 255, 0.8) inset',
        height: 80,
        zIndex: zIndexes.TAB_BAR,
      }}
      transition={timingConfig(0.2)}
    >
      {tabConfig.map((tab, index) => {
        return (
          <Tab
            {...tab}
            accentColor={avatar?.color || globalColors.blue50}
            colorMatrixValues={colorMatrixValues}
            index={index}
            key={index}
            onSelectTab={onSelectTab}
            selectedTabIndex={TABS.indexOf(activeTab)}
          />
        );
      })}
      {/* </Inline> */}
    </Box>
  );
}

function Tab({
  Icon,
  SelectedIcon,
  accentColor,
  colorMatrixValues,
  index,
  name,
  label,
  onSelectTab,
  selectedTabIndex,
  isDisabled,
}: {
  Icon: () => ReactElement;
  SelectedIcon: ({
    accentColor,
    colorMatrixValues,
  }: {
    accentColor: string;
    colorMatrixValues: number[];
  }) => ReactElement;
  accentColor: string;
  colorMatrixValues: number[];
  index: number;
  name: Tab;
  label: string;
  onSelectTab: (tab: Tab) => void;
  selectedTabIndex: number;
  isDisabled: boolean;
}) {
  const isSelected = selectedTabIndex === index;
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });

  return (
    <Box
      onClick={() => {
        if (!isDisabled) {
          onSelectTab(name);
        }
      }}
      testId={`bottom-tab-${name}`}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
    >
      <Box
        alignItems="center"
        as={motion.div}
        display="flex"
        flexDirection='column'
        height="full"
        justifyContent="center"
        gap='4px'
        key={`tab-${name}`}
        style={{
          width: TAB_WIDTH,
          willChange: 'transform',
          zIndex: 2,
        }}
        transition={timingConfig(0.2)}
        whileTap={{ scale: 0.82 }}
      >
        <Box style={{ height: ICON_SIZE, width: ICON_SIZE }}>
          <Box
            position="relative"
            style={{
              height: ICON_SIZE * 2,
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: ICON_SIZE * 2,
              willChange: 'transform',
            }}
          >
            <Box
              position="absolute"
              style={{
                opacity: isSelected ? 1 : 0,
                transition: '0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <SelectedIcon
                accentColor={accentColor}
                colorMatrixValues={colorMatrixValues}
              />
            </Box>
            <Box
              position="absolute"
              style={{
                opacity: isSelected ? 0 : 1,
                transition: '0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <Icon />
            </Box>
          </Box>
        </Box>
        <Box style={{ color: avatar?.color }}>
          <Text size="14pt" weight="bold">
            {label}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
