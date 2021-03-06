import { Flex } from '@chakra-ui/react';
import AsyncBoundary from '@src/components/common/wrapper/AsyncBoundary';
import BasicLayout from '@src/layout/BasicLayout';
import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import ChromeRecommend from '@src/components/common/ChromeRecommend';

const DynamicEnterPage = dynamic(() => import('@src/components/live/enter/DynamicEnterPage'), {
  loading: () => <div> loading</div>,
  ssr: false,
  suspense: true,
});

const RoomEnterPage = () => {
  return (
    <Flex width="full" justifyContent="center">
      <AsyncBoundary>
        <DynamicEnterPage />
      </AsyncBoundary>
      <ChromeRecommend />
    </Flex>
  );
};

RoomEnterPage.getLayout = function getLayout(page: ReactElement) {
  return <BasicLayout>{page}</BasicLayout>;
};

export default RoomEnterPage;
