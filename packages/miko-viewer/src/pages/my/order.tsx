import { Flex, Heading, Text } from '@chakra-ui/react';
import AsyncBoundary from '@src/components/common/wrapper/AsyncBoundary';
import OrderHistory from '@src/components/product/order/OrderHistory';
import BasicLayout from '@src/layout/BasicLayout';
import { useUser } from '@src/state/swr';
import { useSingleLaravel } from '@src/state/swr/useLaravel';
import { ReactElement } from 'react';

export default function Orders() {
  const { data: userData } = useUser();
  const orders = useSingleLaravel('/orders', userData?.id, {});
  return (
    <Flex h="70vh" justifyContent="center" w="100%">
      <Flex flexDir={'column'} h="full" w={'100%'}>
        <Heading ml="100px" fontSize={{ base: '2xl', sm: '4xl' }}>
          ご注文履歴{orders.data?.data ? <span style={{ fontSize: '25px' }}>&nbsp;({orders.data?.data.length})</span> : null}
        </Heading>
        {orders.data?.length === 0 ? (
          <Text mt={'20%'} fontSize={'4xl'} color="gray.300" textAlign={'center'}>
            まだご注文履歴がありません。
          </Text>
        ) : (
          <OrderHistory orders={orders?.data}></OrderHistory>
        )}
      </Flex>
    </Flex>
  );
}

Orders.getLayout = function getLayout(page: ReactElement) {
  return (
    <BasicLayout>
      <AsyncBoundary>{page}</AsyncBoundary>
    </BasicLayout>
  );
};
